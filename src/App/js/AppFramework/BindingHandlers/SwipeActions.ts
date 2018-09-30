import * as ko from 'knockout';
import 'swipe-listener';

// Some shared constants
const logPrefix = 'SwipeActions',
    bodySelector = '.swipeable__body',
    primaryActionSelector = '.swipeable__primary-action',
    bodyAnimClass = bodySelector.substr(1) + '--is-settling';

interface ISwipeAction {
    element: HTMLElement;
    width: number;
    widthMultiplier: number;
}

ko.bindingHandlers.swipeActions = {
    init(element: HTMLElement) {
        const swipeableElement = element.querySelector(bodySelector) as HTMLElement | null,
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
                    multiplierOffset = reverse ? elements.length - index - 1 : index + 1;

                result.push({
                    element: currentElement as HTMLElement,
                    width: currentElement.clientWidth,
                    widthMultiplier: 1 / multiplierOffset
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

        function sumActionSize(actions: ISwipeAction[]) {
            let size = 0;
            for (const action of actions) {
                size += action.width;
            }
            return size;
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
         * @param diff Difference from base in px
         */
        function setSwipeState(diff: number) {
            setElementTransform(swipeableElement!, diff);

            for (const action of leftActions) {
                const total = diff * action.widthMultiplier - leftActionSize;
                setElementTransform(action.element, total);
            }

            for (const action of rightActions) {
                const total = diff * action.widthMultiplier + rightActionSize;
                setElementTransform(action.element, total);
            }
        }

        function calculateDiff(xStart: number, xEnd: number) {
            return Math.min(Math.max(xEnd - xStart + currentOffset, -1 * rightActionSize), leftActionSize);
        }

        function onSwipeEvent(ev: SwipeEvent<IBasicSwipeDetails>) {
            const detail = ev.detail;

            console.log('[%s]: Swipe release: %', logPrefix, JSON.stringify(detail));

            const [xStart, xEnd] = detail.x,
                xDiff = calculateDiff(xStart, xEnd),
                directionMax = xDiff < 0 ? rightActionSize : leftActionSize,
                fullOpenSize = xDiff < 0 ? -1 * rightActionSize : leftActionSize,
                cancelThreshold = directionMax / 2;

            // Set-up animation
            setSwipeCompletionAnimation(swipeableElement!);
            leftActions.forEach(item => setSwipeCompletionAnimation(item.element));
            rightActions.forEach(item => setSwipeCompletionAnimation(item.element));

            // Force layout, otherwise transition won't happen (note: if this doesn't work out on Webkit, we can try .focus())
            swipeableElement!.offsetHeight.toString();

            if (Math.abs(xDiff) < cancelThreshold) {
                setSwipeState(0);
                currentOffset = 0;
            } else {
                setSwipeState(fullOpenSize);
                currentOffset = xDiff;
            }

            if (xDiff > 5) {
                preventImmediateClick = true;
                window.setTimeout(() => (preventImmediateClick = false), 1);
            }
        }

        function onSwipingEvent(ev: SwipeEvent<IBasicSwipeDetails>) {
            const detail = ev.detail;

            const [xStart, xEnd] = detail.x,
                xDiff = calculateDiff(xStart, xEnd);

            console.info('[%s] Swiping %s-%s=%s', logPrefix, xStart, xEnd, xDiff);
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

            // Trigger click on primary element
            ev.preventDefault();
            ev.stopPropagation();

            if (preventImmediateClick) {
                return;
            }

            console.log('[%s] Triggering primary action click', logPrefix);

            primaryActionElement.click();
        }

        // Event-listener rearing
        swipeableElement!.addEventListener('click', onSwipeableElementClick);
        element.addEventListener('swiperelease', onSwipeEvent);
        element.addEventListener('swiping', onSwipingEvent);

        ko.utils.domNodeDisposal.addDisposeCallback(element, () => {
            listener.off();

            swipeableElement!.removeEventListener('click', onSwipeableElementClick);
            element.removeEventListener('swipe', onSwipeEvent);
            element.removeEventListener('swiping', onSwipingEvent);
        });

        // Initial init
        setSwipeState(0);
    }
};
