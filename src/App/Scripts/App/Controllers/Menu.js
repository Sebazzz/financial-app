/// <init-options exclude="route"/>
/// <reference path="../../typings/angularjs/angular.d.ts"/>
/// <reference path="../Services/AuthenticationService.ts"/>
var FinancialApp;
(function (FinancialApp) {
    'use strict';

    var MenuController = (function () {
        function MenuController($scope, $location, authentication) {
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
            $scope.showUserControls = authentication.isAuthenticated();

            authentication.addAuthenticationChange(function () {
                return $scope.showUserControls = authentication.isAuthenticated();
            });
        }
        MenuController.$inject = ["$scope", "$location", "authentication"];
        return MenuController;
    })();
    FinancialApp.MenuController = MenuController;
})(FinancialApp || (FinancialApp = {}));
//# sourceMappingURL=Menu.js.map
