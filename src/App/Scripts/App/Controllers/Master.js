/// <init-options exclude="route"/>
/// <reference path="../Services/AuthenticationService.ts"/>
/// <reference path="../../typings/angularjs/angular.d.ts"/>
var FinancialApp;
(function (FinancialApp) {
    'use strict';

    var MasterController = (function () {
        function MasterController($scope, authentication) {
            var _this = this;
            this.authentication = authentication;

            MasterController.setAuthenticationInfo($scope, this.authentication.isAuthenticated());

            this.authentication.addAuthenticationChange(function () {
                return MasterController.setAuthenticationInfo($scope, _this.authentication.isAuthenticated());
            });
        }
        MasterController.setAuthenticationInfo = function ($scope, isAuthenticated) {
            $scope.isMenuVisible = isAuthenticated;
            $scope.isAuthenticated = isAuthenticated;
        };
        MasterController.$inject = ["$scope", "authentication"];
        return MasterController;
    })();
    FinancialApp.MasterController = MasterController;
})(FinancialApp || (FinancialApp = {}));
//# sourceMappingURL=Master.js.map
