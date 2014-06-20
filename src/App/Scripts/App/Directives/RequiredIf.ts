module FinancialApp.Directives {
    "use strict";

    export class RequiredIf implements ng.IDirective {
        public static $inject = [];
        public restrict = "A";

        public static factory(): ng.IDirective {
            return new RequiredIf();
        }

        constructor() {
            return this;
        }

        public link (scope: ng.IScope, instanceElement: ng.IAugmentedJQuery, instanceAttributes: ng.IAttributes, controller: any, transclude: ng.ITranscludeFunction) : void {
            var expr = instanceAttributes["faRequiredIf"]; // fa-required-if

            console.log("fa-required-if expr: %s", expr);
            scope.$watch(expr, (val) => {
                console.log("fa-required-if: %s", val);
                if (val) {
                    instanceElement.attr("required", "required");
                } else {
                    instanceElement.removeAttr("required");
                }
            });
        }
    }
}