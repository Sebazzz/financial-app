module FinancialApp.Directives.Fabric {
    export function registerDirectives(app: ng.IModule) {
        app.directive('msfa-navbar', NavBarDirective.factory);

        app.directive('helloWorld', function () {
            return {
                restrict: 'E',
                template: '<h1>Hello World!!</h1>'
            };
        });
    }

    export class NavBarDirective implements ng.IDirective {
        public static $inject = [];
        public restrict = "A";

        public static factory(): ng.IDirective {
            return new NavBarDirective();
        }

        constructor() {
            return this;
        }

        public link(scope: ng.IScope, elm: any, attrs: ng.IAttributes, ctrl: any) {
            elm.NavBar();
        }
    }
}