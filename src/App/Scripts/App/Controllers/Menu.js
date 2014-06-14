/// <init-options exclude="route"/>
/// <reference path="../../typings/angularjs/angular.d.ts"/>
var FinancialApp;
(function (FinancialApp) {
    var MenuController = (function () {
        function MenuController($scope, $location) {
            $scope.currentPath = $location.path();
            $scope.nowPath = FinancialApp.Program.createNowRoute();
            $scope.extendMenuVisible = false;

            $scope.hasPath = function (str) {
                return str == this.currentPath;
            };

            $scope.$on("$locationChangeSuccess", function () {
                $scope.currentPath = $location.path();
            });

            $scope.toggleNavBar = function () {
                return $scope.extendMenuVisible = !$scope.extendMenuVisible;
            };
        }
        MenuController.$inject = ["$scope", "$location"];
        return MenuController;
    })();
    FinancialApp.MenuController = MenuController;
})(FinancialApp || (FinancialApp = {}));
//# sourceMappingURL=Menu.js.map
