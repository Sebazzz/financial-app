/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../Common.ts"/>
var FinancialApp;
(function (FinancialApp) {
    (function (Factories) {
        ;

        // ReSharper disable once InconsistentNaming
        function ResourceFactory(spec) {
            var fact = function ($resource) {
                return $resource(spec);
            };
            return fact.withInject("$resource");
        }
        Factories.ResourceFactory = ResourceFactory;
    })(FinancialApp.Factories || (FinancialApp.Factories = {}));
    var Factories = FinancialApp.Factories;
})(FinancialApp || (FinancialApp = {}));
//# sourceMappingURL=ResourceFactory.js.map
