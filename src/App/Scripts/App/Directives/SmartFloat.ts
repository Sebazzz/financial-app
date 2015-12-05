module FinancialApp.Directives {

    export class SmartFloatDirective implements ng.IDirective {
        private static floatRegexp = /^\-?\d+((\.|\,)\d+)?$/;
        public require = 'ngModel';

        public static factory(): ng.IDirective {
            return new SmartFloatDirective();
        }
        
        public link(scope: ng.IScope, elm: ng.IAugmentedJQuery, attrs: ng.IAttributes, ctrl: any) {
            // TODO / HACK: The current HTML 5 input=number fails to recognize Dutch
            //              formatting rules, e.g.: comma as decimal formatter.
            //              This causes the web browser, depending on version and brand,
            //              to actually return an empty string from the input type=number.
            //              Note that the code below may fail if the browser actually recognizes
            //              the current page to be Dutch and applies the correct rules!

            var lastInput = elm.val();
            elm.keyup((e: JQueryKeyEventObject) => {
                if (e.char === ',' && !elm.val()) {
                    if (!lastInput) return;
                    if (lastInput.indexOf('.') !== -1) return;

                    lastInput += '.';
                    elm.val(lastInput);
                } else {
                    lastInput = elm.val();
                }
            });

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