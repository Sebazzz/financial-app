import * as ko from 'knockout';
import 'swipe-listener';

ko.bindingHandlers.swipeActions = {
    init(element: HTMLElement) {
        const logPrefix = 'SwipeActions: ',
            bodySelector = '.swipeable__body',
            primaryActionSelector = '.swipeable__primary-action',
            bodyAnimClass = bodySelector.substr(1) + '--is-settling',
            swipeableElement = element.querySelector(bodySelector) as HTMLElement | null,
            primaryActionElement =
                swipeableElement && (swipeableElement.querySelector(primaryActionSelector) as HTMLElement | null);
        if (!swipeableElement || swipeableElement === null) {
            console.error(element);
            throw new Error('Error: Unable to find ' + bodySelector);
        }

        function countMaxSize(actions: NodeListOf<Element>) {
            let size = 0;
            for (let index = 0; index < actions.length; index++) {
                size += actions.item(index).clientWidth;
            }
            return size;
        }

        const leftActions = element.querySelectorAll('.swipeable__action-left'),
            leftActionSize = countMaxSize(leftActions),
            rightActions = element.querySelectorAll('.swipeable__action-right'),
            rightActionSize = countMaxSize(rightActions);

        let currentOffset = 0,
            preventImmediateClick = false;

        const listener = SwipeListener(element, {
            minVertical: 1000 // Prevent top/bottom swipe
        });

        function setSwipeState(diff: number) {
            const transformString = `translateX(${diff}px)`,
                elementStyle = swipeableElement!.style;
            elementStyle.setProperty('-webkit-transform', transformString);
            elementStyle.setProperty('transform', transformString);
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
            function onSwipeSettled() {
                swipeableElement!.removeEventListener('transitionend', onSwipeSettled);
                swipeableElement!.removeEventListener('transitioncancel', onSwipeSettled);

                swipeableElement!.classList.remove(bodyAnimClass);
            }

            swipeableElement!.addEventListener('transitionend', onSwipeSettled);
            swipeableElement!.addEventListener('transitioncancel', onSwipeSettled);
            swipeableElement!.classList.add(bodyAnimClass);

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

        swipeableElement!.addEventListener('click', onSwipeableElementClick);
        element.addEventListener('swiperelease', onSwipeEvent);
        element.addEventListener('swiping', onSwipingEvent);

        ko.utils.domNodeDisposal.addDisposeCallback(element, () => {
            listener.off();

            swipeableElement!.removeEventListener('click', onSwipeableElementClick);
            element.removeEventListener('swipe', onSwipeEvent);
            element.removeEventListener('swiping', onSwipingEvent);
        });
    }
};
