/// <init-options route="/auth/login" />
/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../Services/AuthenticationService.ts"/>
var FinancialApp;
(function (FinancialApp) {
    'use strict';

    var AuthLoginController = (function () {
        function AuthLoginController($scope, $location, authentication) {
            var _this = this;
            this.$scope = $scope;
            this.$location = $location;
            this.authentication = authentication;
            if (authentication.isAuthenticated()) {
                this.$location.path("/");
            }

            $scope.login = function () {
                return _this.onLogin();
            };
            $scope.isBusy = false;

            $scope.isBusy = authentication.isCheckingAuthentication;
            authentication.addAuthenticationChange(function () {
                if (authentication.isAuthenticated()) {
                    _this.$location.path("/");
                }
            });
        }
        AuthLoginController.prototype.onLogin = function () {
            var _this = this;
            this.$scope.isBusy = true;
            this.$scope.errorMessage = null;

            this.authentication.authenticate(this.$scope.userName, this.$scope.password, this.$scope.rememberMe).then(function () {
                // handled by
            }, function () {
                _this.$scope.errorMessage = "Inloggen mislukt. Controleer je gebruikersnaam of wachtwoord.";
            }).finally(function () {
                _this.$scope.isBusy = false;
            });
        };
        AuthLoginController.$inject = ["$scope", "$location", "authentication"];
        return AuthLoginController;
    })();
    FinancialApp.AuthLoginController = AuthLoginController;
})(FinancialApp || (FinancialApp = {}));
//# sourceMappingURL=AuthLogin.js.map
