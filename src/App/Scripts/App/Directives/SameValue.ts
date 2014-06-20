module FinancialApp.Directives {
    "use strict";

    export class SameValue implements ng.IDirective {
        public static $inject = [];
        public restrict = "A";

        public static factory(): ng.IDirective {
            return new SameValue();
        }

        constructor() {
            return this;
        }

        public link (scope: ng.IScope, instanceElement: ng.IAugmentedJQuery, instanceAttributes: ng.IAttributes, controller: any, transclude: ng.ITranscludeFunction) : void {
            var expr = instanceAttributes["faSameValue"]; // fa-same-value
            /*
            controller.$parsers.unshift(viewValue => {
                var otherValue = <boolean>scope.$eval(expr);
                var isSame = viewValue === otherValue;

                controller.$setValidity('faSameValue', isSame);
                return isSame ? viewValue : undefined;
            });*/
        }
    }
}