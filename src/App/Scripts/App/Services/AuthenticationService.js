/// <reference path="../Common.ts"/>
/// <reference path="../../typings/angularjs/angular.d.ts"/>
var FinancialApp;
(function (FinancialApp) {
    (function (Services) {
        'use strict';

        var AuthenticationService = (function () {
            function AuthenticationService($document, $rootScope, $location) {
                var _this = this;
                this.authenticationChangedEvent = new FinancialApp.Delegate();
                this.isAuthenticatedBit = AuthenticationService.checkDomAuthentication($document);

                $rootScope.$on("$locationChangeStart", function (ev, newLocation) {
                    if (!_this.isAuthenticatedBit && newLocation.indexOf('/auth/login') === -1) {
                        ev.preventDefault();
                    }
                });

                if (!this.isAuthenticatedBit) {
                    $location.path("/auth/login");
                }
            }
            AuthenticationService.prototype.addAuthenticationChange = function (invokable) {
                this.authenticationChangedEvent.addListener(invokable);
            };

            AuthenticationService.prototype.removeAuthenticationChange = function (invokable) {
                this.authenticationChangedEvent.removeListener(invokable);
            };

            AuthenticationService.prototype.isAuthenticated = function () {
                return this.isAuthenticatedBit;
            };

            AuthenticationService.checkDomAuthentication = function ($document) {
                return false;
            };
            AuthenticationService.$inject = ["$document", "$rootScope", "$location"];
            return AuthenticationService;
        })();
        Services.AuthenticationService = AuthenticationService;
    })(FinancialApp.Services || (FinancialApp.Services = {}));
    var Services = FinancialApp.Services;
})(FinancialApp || (FinancialApp = {}));
//# sourceMappingURL=AuthenticationService.js.map
