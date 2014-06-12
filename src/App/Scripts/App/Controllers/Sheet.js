/// <init-options route="/sheet/:year/:month"/>
var FinancialApp;
(function (FinancialApp) {
    var SheetController = (function () {
        function SheetController($scope, $routeParams, $location) {
            $scope.date = moment([parseInt($routeParams.year, 10), parseInt($routeParams.month, 10) - 1]);

            // bail out if invalid date is provided
            if (!$scope.date.isValid()) {
                $location.path("/archive");
            }
        }
        SheetController.$inject = ["$scope", "$routeParams", "$location"];
        return SheetController;
    })();
    FinancialApp.SheetController = SheetController;
})(FinancialApp || (FinancialApp = {}));
//# sourceMappingURL=Sheet.js.map
