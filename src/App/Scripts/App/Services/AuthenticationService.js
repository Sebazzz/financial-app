/// <reference path="../Common.ts"/>
/// <reference path="../../typings/angularjs/angular.d.ts"/>
/// <reference path="../DTO.generated.d.ts"/>
var FinancialApp;
(function (FinancialApp) {
    (function (Services) {
        'use strict';

        var AuthenticationInfo = (function () {
            function AuthenticationInfo(isAuthenticated, userId, userName) {
                if (typeof isAuthenticated === "undefined") { isAuthenticated = false; }
                if (typeof userId === "undefined") { userId = 0; }
                if (typeof userName === "undefined") { userName = null; }
                this.isAuthenticated = isAuthenticated;
                this.userId = userId;
                this.userName = userName;
            }
            AuthenticationInfo.create = function ($document) {
                var html = $document.find("html");

                return new AuthenticationInfo(html.data("auth") === "1", parseInt(html.data("auth-userid"), 10), html.data("auth-username") || null);
            };
            return AuthenticationInfo;
        })();

        var AuthenticationService = (function () {
            function AuthenticationService($document, $rootScope, $location) {
                var _this = this;
                this.authenticationChangedEvent = new FinancialApp.Delegate();

                this.authInfo = AuthenticationInfo.create($document);

                $rootScope.$on("$locationChangeStart", function (ev, newLocation) {
                    if (!_this.authInfo.isAuthenticated && newLocation.indexOf('/auth/login') === -1) {
                        ev.preventDefault();
                    }
                });

                if (!this.authInfo.isAuthenticated) {
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
                return this.authInfo.isAuthenticated;
            };
            AuthenticationService.$inject = ["$document", "$rootScope", "$location"];
            return AuthenticationService;
        })();
        Services.AuthenticationService = AuthenticationService;
    })(FinancialApp.Services || (FinancialApp.Services = {}));
    var Services = FinancialApp.Services;
})(FinancialApp || (FinancialApp = {}));
//# sourceMappingURL=AuthenticationService.js.map
