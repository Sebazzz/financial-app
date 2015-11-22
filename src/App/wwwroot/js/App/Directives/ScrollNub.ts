module FinancialApp.Directives {
    "use strict";

    export class ScrollNub implements ng.IDirective {
        public static $inject = ["$window"];
        public restrict = "A";

        public static factory($window): ng.IDirective {
            return new ScrollNub($window);
        }

        constructor(private $window: ng.IWindowService) {
            return this;
        }

        public link(): void {
            var impl = new ScrollNubImpl(<ng.IWindowService>window); // TODO: improve this
        }
    }

    class ScrollNubImpl {
        private currentpageYOffset: number;
        private scrollNub: HTMLDivElement;

        constructor(private $window: ng.IWindowService) {
            this.currentpageYOffset = this.getPageYOffset();
            this.createScrollNub();
            this.checkScroll();
            this.registerEvent();
        }

        private getPageYOffset() {
            return this.$window.pageYOffset || this.$window.document.documentElement.scrollTop;
        }

        private registerEvent(): void {
            this.$window.addEventListener("scroll", () => this.checkScroll());
        }

        private checkScroll(): void {
            if (!document.querySelector('body > div > .navbar')) {
                // wait
                this.$window.setTimeout(() => this.checkScroll(), 800);
                return;
            }

            var pageYOffset = this.getPageYOffset(),
                minTopPosition = (<HTMLElement>document.querySelector('body > div > .navbar')).offsetHeight,
                maxBottomPosition = (<HTMLElement>document.querySelector('body > #scrollBottom')).offsetTop - document.documentElement.clientHeight;

            if (pageYOffset > minTopPosition && pageYOffset < maxBottomPosition) {
                if (this.currentpageYOffset > pageYOffset) {
                    this.scrollNub.classList.add('invert');
                }
                else if (this.currentpageYOffset < pageYOffset) {
                    this.scrollNub.classList.remove('invert');
                }

                this.scrollNub.style.display = "block";
            }
            else {
                this.scrollNub.style.display = "none";
            }

            this.currentpageYOffset = pageYOffset;
        }

        private createScrollNub(): void {
            // create nub
            var domElement = document.createElement("div");
            domElement.className = "scrollTo";
            domElement.addEventListener('mousedown', (ev) => this.onScrollNubClick(ev));

            this.$window.document.body.appendChild(domElement);

            this.scrollNub = domElement;
        }

        private onScrollNubClick(ev: any) {
            // prevent to click anything under
            ev.preventDefault();

            // scroll to top or bottom
            var scrollToTop = this.scrollNub.classList.contains('top');

            var scrollElement = <HTMLElement>(scrollToTop ? document.querySelector('body > div > .navbar') : document.querySelector('body > #scrollBottom'));
            scrollElement.scrollIntoView();

            // check scrolling
            this.$window.setTimeout(() => this.checkScroll(), 200);
        }
    }
}