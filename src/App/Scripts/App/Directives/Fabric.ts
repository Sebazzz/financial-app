module FinancialApp.Directives.Fabric {
    export function registerDirectives(app: ng.IModule) {
        app.directive('msfa-navbar', NavBarDirective.factory);
    }

    export class NavBarDirective implements ng.IDirective {
        public require = '';

        public static factory(): ng.IDirective {
            return new NavBarDirective();
        }

        public link(scope: ng.IScope, elm: any, attrs: ng.IAttributes, ctrl: any) {
            elm.NavBar();
        }
    }
}