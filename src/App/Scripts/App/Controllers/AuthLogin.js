/// <init-options route="/auth/login" />
/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../Services/AuthenticationService.ts"/>
var FinancialApp;
(function (FinancialApp) {
    'use strict';

    var AuthLoginController = (function () {
        function AuthLoginController($scope, authentication) {
            $scope.login = function () {
                return alert('Dikke pech');
            };
        }
        AuthLoginController.$inject = ["$scope", "authentication"];
        return AuthLoginController;
    })();
    FinancialApp.AuthLoginController = AuthLoginController;
})(FinancialApp || (FinancialApp = {}));
//# sourceMappingURL=AuthLogin.js.map
