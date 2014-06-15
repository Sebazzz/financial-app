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
            return AuthenticationInfo;
        })();

        var AuthenticationService = (function () {
            function AuthenticationService($http, $q, $rootScope, $location) {
                var _this = this;
                this.$q = $q;
                this.$http = $http;

                this.authenticationChangedEvent = new FinancialApp.Delegate();

                this.authInfo = this.checkAuthentication();

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

            AuthenticationService.prototype.raiseAuthenticationEvent = function () {
                this.authenticationChangedEvent.invoke(function (f) {
                    f();
                    return false;
                });
            };

            AuthenticationService.prototype.authenticate = function (userName, password, persistent) {
                var _this = this;
                var ret = this.$q.defer();

                var postData = {
                    userName: userName,
                    password: password,
                    persistent: persistent
                };

                this.$http.post("/api/authentication/login", postData).success(function (data) {
                    _this.authInfo = data;
                    _this.raiseAuthenticationEvent();

                    ret.resolve(null);
                }).error(function (data, status) {
                    return ret.reject(data);
                });

                return ret.promise;
            };

            AuthenticationService.prototype.checkAuthentication = function () {
                var _this = this;
                this.$http.get("/api/authentication/check").success(function (info) {
                    _this.authInfo = info;
                    _this.isCheckingAuthentication = false;
                    _this.raiseAuthenticationEvent();
                });

                this.isCheckingAuthentication = true;
                return new AuthenticationInfo(false, 0, "");
            };
            AuthenticationService.$inject = ["$http", "$q", "$rootScope", "$location"];
            return AuthenticationService;
        })();
        Services.AuthenticationService = AuthenticationService;
    })(FinancialApp.Services || (FinancialApp.Services = {}));
    var Services = FinancialApp.Services;
})(FinancialApp || (FinancialApp = {}));
//# sourceMappingURL=AuthenticationService.js.map
