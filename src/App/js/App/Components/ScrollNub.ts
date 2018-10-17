let currentpageYOffset: number;
let scrollNub: HTMLDivElement;

function getPageYOffset() {
    return window.pageYOffset || window.document.documentElement!.scrollTop;
}

function registerEvent(): void {
    window.addEventListener('scroll', () => checkScroll());
}

function checkScroll(): void {
    const pageYOffset = getPageYOffset();
    const minTopPosition = (document.querySelector('top-menu') as HTMLElement).offsetHeight;
    const maxBottomPosition =
        (document.querySelector('body > #scrollBottom') as HTMLElement).offsetTop -
        document.documentElement!.clientHeight;

    if (pageYOffset > minTopPosition) {
        if (currentpageYOffset > pageYOffset || pageYOffset > maxBottomPosition) {
            scrollNub.classList.add('scroll-nub-invert');
        } else if (currentpageYOffset < pageYOffset) {
            scrollNub.classList.remove('scroll-nub-invert');
        }

        scrollNub.classList.remove('scroll-nub-disabled');
    } else {
        scrollNub.classList.add('scroll-nub-disabled');
    }

    currentpageYOffset = pageYOffset;
}

function createScrollNub(): void {
    // create nub
    const domElement = document.createElement('div');
    domElement.className = 'scrollTo';
    domElement.addEventListener('mousedown', ev => onScrollNubClick(ev));

    window.document.body.appendChild(domElement);

    scrollNub = domElement;
}

function onScrollNubClick(ev: any) {
    // prevent to click anything under
    ev.preventDefault();

    // scroll to top or bottom
    const scrollToTop = scrollNub.classList.contains('scroll-nub-invert'),
        selector = scrollToTop ? 'top-menu' : 'body > #scrollBottom',
        scrollElement = document.querySelector(selector) as HTMLElement;

    if ('scrollIntoView' in scrollElement) {
        scrollElement.scrollIntoView();
    }

    // check scrolling
    window.setTimeout(() => checkScroll(), 200);
}

currentpageYOffset = getPageYOffset();
createScrollNub();
checkScroll();
registerEvent();
