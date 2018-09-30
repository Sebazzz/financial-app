/**
 * Import as: import 'swipe-listener';
 */
declare module 'swipe-listener';

/**
 * Swipe listener interface
 */
interface ISwipeListener {
    /**
     * Turns off the swipe-listener on a given element.
     */
    off(): void;
}

interface ISwipeListenerOptions {
    /**
     * Minimum number of horizontal pixels travelled for the gesture to be considered as a left or right swipe.
     *
     * @default 10
     */
    minHorizontal?: number;

    /**
     * Minimum number of vertical pixels travelled for the gesture to be considered as a top or bottom swipe.
     *
     * @default 10
     */
    minVertical?: number;

    /**
     * Maximum difference between the rightmost pixel (right-swipe) or the leftmost pixel (left-swipe) travelled to and the pixel at which the gesture is released.
     *
     * @default 3
     */
    deltaHorizontal?: number;

    /**
     * Maximum difference between the bottommost pixel (bottom-swipe) or the topmost pixel (top-swipe) travelled to and the pixel at which the gesture is released.
     *
     * @default 5
     */
    deltaVertical?: number;

    /**
     * Prevents page scrolling when swiping on the DOM element.
     *
     * @default false
     */
    preventScroll?: boolean;

    /**
     * Enforces only one direction to be true instead of multiple. Selects the direction with the most travel. Is not enforced when the travel is equal. Example: for a top-left swipe, only one of top and left will be true instead of both.
     *
     * @default true
     */
    lockAxis?: boolean;
}

declare function SwipeListener(element: Element, options?: ISwipeListenerOptions): ISwipeListener;

interface HTMLElementEventMap {
    /**
     * Emitted once a swipe is performed
     */
    swipe: SwipeEvent<ISwipeDetails>;

    /**
     * Emitted multiple times during a single swipe.
     */
    swiping: SwipeEvent<ISwipeDetails>;

    /**
     * Emitted once the swipe is released/completed. Emitted at the end of the swipe.
     */
    swiperelease: SwipeEvent<ISwipeDetails>;

    /**
     *  Emitted if the swipe-distance did not meet minimum travel-distance. Emitted at the end of the swipe.
     */
    swipecancel: SwipeEvent<ISwipeDetails>;
}

interface ISwipeDetails extends IBasicSwipeDetails {
    directions: {
        /**
         * Signifies a top-swipe
         */
        top: boolean;

        /**
         * Signifies a bottom-swipe.
         */
        bottom: boolean;

        /**
         * Signifies a right-swipe.
         */
        right: boolean;

        /**
         * Signifies a left-swipe.
         */
        left: boolean;
    };
}

interface IBasicSwipeDetails {
    /**
     * Array containing two elements: starting and ending x-coords.
     */
    x: [/*start*/ number, /*end*/ number];

    /**
     * Array containing two elements: starting and ending y-coords.
     */
    y: [/*start*/ number, /*end*/ number];

    /**
     * Whether or not TouchEvent was used for this particular event.
     */
    touch: boolean;
}

interface SwipeEvent<T extends IBasicSwipeDetails> extends Event {
    detail: T;
}
