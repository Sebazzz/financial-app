module FinancialApp.Directives {

    export class SmartFloatDirective implements ng.IDirective {
        private static floatRegexp = /^\-?\d+((\.|\,)\d+)?$/;
        public require = 'ngModel';

        public static factory(): ng.IDirective {
            return new SmartFloatDirective();
        }
        
        public link(scope: ng.IScope, elm: ng.IAugmentedJQuery, attrs : ng.IAttributes, ctrl : any) {
            ctrl.$parsers.unshift(viewValue => {
                if (SmartFloatDirective.floatRegexp.test(viewValue)) {
                    ctrl.$setValidity('float', true);
                    return parseFloat(viewValue.replace(',', '.'));
                } else {
                    ctrl.$setValidity('float', false);
                    return undefined;
                }
            });
        }
    }
}