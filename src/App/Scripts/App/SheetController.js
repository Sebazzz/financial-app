/// <init-options route="/sheet/:year/:month"/>
var FinancialApp;
(function (FinancialApp) {
    var SheetController = (function () {
        function SheetController($scope, $routeParams) {
            $scope.date = moment([parseInt($routeParams.year, 10), parseInt($routeParams.month, 10)]);
        }
        SheetController.$inject = ["$scope", "$routeParams"];
        return SheetController;
    })();
    FinancialApp.SheetController = SheetController;
})(FinancialApp || (FinancialApp = {}));
//# sourceMappingURL=SheetController.js.map
