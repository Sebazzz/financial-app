module FinancialApp.Directives {
    
    export class RequiredIf {
        static directive(): Function {
            var fn = (scope : ng.IScope, element, attr) => {
                var expr = attr.faRequiredIf; // fa-required-if

                scope.$watch(expr, (val) => {
                    if (val) {
                        element.attr("required", "required");
                    } else {
                        element.removeAttr("required");
                    }
                });
            };

            return fn.withInject("scope", "element", "attr");
        }
    }
}