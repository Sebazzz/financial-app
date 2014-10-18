module FinancialApp.Directives {
    "use strict";

    export class ScrollNub implements ng.IDirective {
        public static $inject = ["$window", "$document"];
        public restrict = "A";

        private linkCalled : boolean;
        private scrollNub: ng.IAugmentedJQuery;
        private currentpageYOffset : number;

        public static factory($window, $document): ng.IDirective {
            return new ScrollNub($window);
        }

        constructor(private $window: ng.IWindowService) {
            return this;
        }

        public link(): void {
            if (this.linkCalled) {
                console.error("Unexpected: link called again");
                return;
            }

            this.linkCalled = true;
            this.currentpageYOffset = this.getPageYOffset();
            this.createScrollNub();
            this.checkScroll();
        }

        private getPageYOffset() {
            return this.$window.pageYOffset || this.$window.document.documentElement.scrollTop;
        }

        private registerEvent(): void {
            this.$window.addEventListener("scroll", () => this.checkScroll);
        }

        private checkScroll(): void {
            var pageYOffset = this.getPageYOffset(),
                minTopPosition = angular.element('body > .navbar').get(0).offsetHeight,
                maxBottomPosition = angular.element('body > #scrollBottom').get(0).offsetTop - document.documentElement.clientHeight;

            if (pageYOffset > minTopPosition && pageYOffset < maxBottomPosition) {
                if (this.currentpageYOffset > pageYOffset) {
                    this.scrollNub.addClass('top');
                }
                else if (this.currentpageYOffset < pageYOffset) {
                    this.scrollNub.removeClass('top');
                }

                this.scrollNub.css("display", "block");
            }
            else {
                this.scrollNub.css("display", "none");
            }

            this.currentpageYOffset = pageYOffset;
        }

        private createScrollNub(): void {
            // remove existing nub
            if (this.scrollNub) {
                this.scrollNub.remove();
                this.scrollNub = null;
            }

            // create nub
            var domElement = document.createElement("div");
            domElement.className = "scrollTo";

            this.scrollNub = angular.element(domElement);
            this.scrollNub.appendTo("body");

            this.scrollNub.mousedown((ev) => this.onScrollNubClick(ev));
        }

        private onScrollNubClick(ev : any) {
            // prevent to click anything under
            ev.preventDefault();

            // scroll to top or bottom
            var scrollToTop = this.scrollNub.hasClass('top');

            var scrollElement = scrollToTop ? angular.element('body > .navbar') : angular.element('body > #scrollBottom');
            scrollElement.get(0).scrollIntoView();

            // check scrolling
            this.$window.setTimeout(() => this.checkScroll, 200);
        }
    }
}