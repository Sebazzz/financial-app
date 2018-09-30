import * as ko from 'knockout';
import 'swipe-listener';

ko.bindingHandlers.swipeActions = {
    init(element: HTMLElement) {
        const bodySelector = '.swipeable__body',
            swipeableElement = element.querySelector(bodySelector) as HTMLElement | null;
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

        let currentOffset = 0;

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

            console.log('Swipe release: ' + JSON.stringify(detail));

            const [xStart, xEnd] = detail.x,
                xDiff = calculateDiff(xStart, xEnd),
                directionMax = xDiff < 0 ? rightActionSize : leftActionSize,
                fullOpenSize = xDiff < 0 ? -1 * rightActionSize : leftActionSize,
                cancelThreshold = directionMax / 2;

            if (Math.abs(xDiff) < cancelThreshold) {
                setSwipeState(0);
                currentOffset = 0;
            } else {
                setSwipeState(fullOpenSize);
                currentOffset = xDiff;
            }
        }

        function onSwipingEvent(ev: SwipeEvent<IBasicSwipeDetails>) {
            const detail = ev.detail;

            const [xStart, xEnd] = detail.x,
                xDiff = calculateDiff(xStart, xEnd);

            console.info('Swiping %s-%s=%s', xStart, xEnd, xDiff);
            setSwipeState(xDiff);
        }

        element.addEventListener('swiperelease', onSwipeEvent);
        element.addEventListener('swiping', onSwipingEvent);

        ko.utils.domNodeDisposal.addDisposeCallback(element, () => {
            listener.off();

            element.removeEventListener('swipe', onSwipeEvent);
            element.removeEventListener('swiping', onSwipingEvent);
        });
    }
};
