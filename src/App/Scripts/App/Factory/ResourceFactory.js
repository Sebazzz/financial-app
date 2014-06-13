/// <reference path="../../typings/angularjs/angular.d.ts" />
var FinancialApp;
(function (FinancialApp) {
    (function (Factories) {
        ;

        // ReSharper disable once InconsistentNaming
        function ResourceFactory(spec) {
            var fact = function ($resource) {
                return $resource(spec);
            };
            fact.$inject = ["$resource"];
            return fact;
        }
        Factories.ResourceFactory = ResourceFactory;
    })(FinancialApp.Factories || (FinancialApp.Factories = {}));
    var Factories = FinancialApp.Factories;
})(FinancialApp || (FinancialApp = {}));
//# sourceMappingURL=ResourceFactory.js.map
