import * as ko from 'knockout';
import 'swipe-listener';

// Some shared constants
const logPrefix = 'SwipeActions',
    // The body which is actually dragged
    bodySelector = '.swipeable__body',
    // This is "clicked" when the list item is clicked
    primaryActionSelector = '.swipeable__primary-action',
    // Animation ease class
    bodyAnimClass = bodySelector.substr(1) + '--is-settling';

interface ISwipeAction {
    element: HTMLElement;
    width: number;
    widthMultiplier: number;
}

ko.bindingHandlers.swipeActions = {
    init(element: HTMLElement) {
        const container = element.parentElement as HTMLElement,
            swipeableElement = element.querySelector(bodySelector) as HTMLElement | null,
            primaryActionElement =
                swipeableElement && (swipeableElement.querySelector(primaryActionSelector) as HTMLElement | null);
        if (!swipeableElement || swipeableElement === null) {
            console.error(element);
            throw new Error('Error: Unable to find ' + bodySelector);
        }

        /**
         * Index the size and movement multiplier for actions matched this selector
         */
        function indexActions(selector: string, reverse: boolean): ISwipeAction[] {
            const result = [],
                elements = element.querySelectorAll(selector);

            for (let index = 0; index < elements.length; index++) {
                const currentElement = elements.item(index),
                    multiplierOffset = reverse ? elements.length - index : index + 1;

                result.push({
                    element: currentElement as HTMLElement,
                    width: currentElement.getBoundingClientRect().width,
                    widthMultiplier: multiplierOffset / elements.length // 1 <= x < 0
                });
            }

            return result;
        }

        /**
         * Animate the element specified to their end position. Ensure to call for layout after this.
         * @param animElement Element to animate
         */
        function setSwipeCompletionAnimation(animElement: HTMLElement) {
            function onSwipeSettled() {
                animElement.removeEventListener('transitionend', onSwipeSettled);
                animElement.removeEventListener('transitioncancel', onSwipeSettled);

                animElement.classList.remove(bodyAnimClass);
            }

            animElement.addEventListener('transitionend', onSwipeSettled);
            animElement.addEventListener('transitioncancel', onSwipeSettled);
            animElement.classList.add(bodyAnimClass);
        }

        function prepareSwipeCompletionAnimation() {
            // Set-up animation
            setSwipeCompletionAnimation(swipeableElement!);
            leftActions.forEach(item => setSwipeCompletionAnimation(item.element));
            rightActions.forEach(item => setSwipeCompletionAnimation(item.element));

            // Force layout, otherwise transition won't happen (note: if this doesn't work out on Webkit, we can try .focus())
            swipeableElement!.offsetHeight.toString();
        }

        function sumActionSize(actions: ISwipeAction[]) {
            let size = 0;
            for (const action of actions) {
                size += action.width;
            }
            return size; // Offset for multiple actions, we are getting a difference somehow
        }

        // We don't know before hand how many actions there are, and we don't know
        // the width per swipeable action. We measure the maximum swipe distance we allow.
        const leftActions = indexActions('.swipeable__action-container-left > .swipeable__action', false),
            leftActionSize = sumActionSize(leftActions),
            rightActions = indexActions('.swipeable__action-container-right > .swipeable__action', true),
            rightActionSize = sumActionSize(rightActions);

        let currentOffset = 0,
            preventImmediateClick = false;

        const listener = SwipeListener(element, {
            minVertical: 1000 // Prevent top/bottom swipe
        });

        function setElementTransform(element: HTMLElement, num: number) {
            const transformString = `translateX(${num}px)`,
                elementStyle = element.style;
            elementStyle.setProperty('-webkit-transform', transformString);
            elementStyle.setProperty('transform', transformString);
        }

        /**
         * Set the relative swipe state (how open/closed) of the element
         * @param diff Difference from base position in px. IF swiping to the left, this is negative.
         */
        function setSwipeState(diff: number) {
            setElementTransform(swipeableElement!, diff);

            // In base position the action items are translated just outside the viewport,
            // and positioned on top of each other. In fully extended position the
            // items must have a translation of 0, so they appear where they should.
            for (const action of leftActions) {
                const total = (diff - leftActionSize) * action.widthMultiplier;
                setElementTransform(
                    action.element,
                    total - leftActions.length - 1 /*Account for offset at left side, was not able to find the cause*/
                );
            }

            for (const action of rightActions) {
                const total = (rightActionSize + diff) * action.widthMultiplier;
                setElementTransform(action.element, total);
            }
        }

        function calculateDiff(xStart: number, xEnd: number) {
            const diff = xEnd - xStart + currentOffset;

            if (diff === 0) {
                return 0;
            }

            // Determine the bounds.
            // We need to make it progressively difficult to slide it further
            // after the bounds, so it slide a bit further, then a bit back.
            // We do this by a simple square root

            /**
             * Calculates the amount of distance we will move based on the incoming distance.
             * This allows us to apply drag/resistance to the incoming touch.
             *
             * @param diffAfterBound Distance covered by touch, without the bound
             * @param bound The current bound, essentially, sum of the action width
             */
            function calculateIncrease(diffAfterBound: number, bound: number) {
                console.assert(diffAfterBound !== 0, 'diffAfterBound !== 0');

                const absDeviation = Math.abs(diffAfterBound),
                    // Note: sqrt input should be bigger > 5
                    result = Math.sqrt(absDeviation * 5 /* Modifier, tested in practice */);

                return bound + (diffAfterBound > 0 ? -1 * result : result);
            }

            if (diff < 0) {
                const minBound = Math.max(diff, -1 * rightActionSize);
                return diff < minBound ? calculateIncrease(minBound - diff, minBound) : diff;
            } else {
                const maxBound = Math.min(diff, leftActionSize);
                return diff > maxBound ? calculateIncrease(maxBound - diff, maxBound) : diff;
            }
        }

        function onSwipeEvent(ev: SwipeEvent<IBasicSwipeDetails>) {
            const detail = ev.detail;

            console.log('[%s]: Swipe release: %', logPrefix, JSON.stringify(detail));

            const [xStart, xEnd] = detail.x,
                xDiff = calculateDiff(xStart, xEnd),
                directionMax = xDiff < 0 ? rightActionSize : leftActionSize,
                fullOpenSize = xDiff < 0 ? -1 * rightActionSize : leftActionSize,
                cancelThreshold = directionMax / 2;

            // If we didn't swipe enough, we close again (observed threshold appears to be
            // on the half of the swipe)
            prepareSwipeCompletionAnimation();
            if (Math.abs(xDiff) < cancelThreshold) {
                setSwipeState(0);
                currentOffset = 0;

                delete container!.dataset.itemIsOpened;
            } else {
                setSwipeState(fullOpenSize);
                currentOffset = xDiff;

                container!.dataset.itemIsOpened = 'true';
            }

            // Prevent click events to occur if we slided enough
            if (xDiff > 5) {
                preventImmediateClick = true;
                window.setTimeout(() => (preventImmediateClick = false), 1);
            }
        }

        function onSwipingEvent(ev: SwipeEvent<IBasicSwipeDetails>) {
            const detail = ev.detail;

            const [xStart, xEnd] = detail.x,
                xDiff = calculateDiff(xStart, xEnd);

            // Update offsets
            setSwipeState(xDiff);
        }

        function onSwipeableElementClick(ev: MouseEvent) {
            if (
                !ev.target ||
                !primaryActionElement ||
                ev.target === primaryActionElement ||
                primaryActionElement!.contains(ev.target as Node)
            ) {
                // Let it propagate
                return;
            }

            // We don't want to handle this event if there is another item open in the same container
            if (container!.dataset.itemIsOpened === 'true') {
                return;
            }

            // If it is an hyperlink, skip it
            if (ev.target && (ev.target as HTMLElement).tagName === 'A') {
                return;
            }

            // Trigger click on primary element
            ev.preventDefault();
            ev.stopPropagation();

            if (preventImmediateClick) {
                return;
            }

            console.log('[%s] Triggering primary action click', logPrefix);

            primaryActionElement.click();
        }

        function onContainerClick(ev: MouseEvent) {
            // Check whether current element was clicked
            if (ev.target && swipeableElement) {
                if (ev.target === swipeableElement || swipeableElement.contains(ev.target as HTMLElement)) {
                    return;
                }
            }

            // Check if we are the one that needs to retract
            if (currentOffset === 0) {
                return;
            }

            // Click / touch happened somewhere else, prevent it from executing and slide current in
            // This behavior is the same on smartphone list views
            if ((ev.target && container.contains(ev.target as HTMLElement)) || ev.target === container) {
                ev.preventDefault();
                ev.stopPropagation();
            }

            delete container!.dataset.itemIsOpened;
            prepareSwipeCompletionAnimation();
            setSwipeState(0);
            currentOffset = 0;
        }

        // Event-listener rearing
        swipeableElement!.addEventListener('click', onSwipeableElementClick);
        element.addEventListener('swiperelease', onSwipeEvent);
        element.addEventListener('swiping', onSwipingEvent);
        document.body.addEventListener('click', onContainerClick);

        ko.utils.domNodeDisposal.addDisposeCallback(element, () => {
            listener.off();

            swipeableElement!.removeEventListener('click', onSwipeableElementClick);
            element.removeEventListener('swipe', onSwipeEvent);
            element.removeEventListener('swiping', onSwipingEvent);
            document.body.removeEventListener('click', onContainerClick);
        });

        // Initial init
        setSwipeState(0);
    }
};
