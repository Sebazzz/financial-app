/// <reference path="../Common.ts"/>
/// <reference path="../../typings/angularjs/angular.d.ts"/>
var FinancialApp;
(function (FinancialApp) {
    (function (Services) {
        var AuthenticationService = (function () {
            function AuthenticationService($document) {
                this.authenticationChangedEvent = new FinancialApp.Delegate();
            }
            AuthenticationService.prototype.addAuthenticationChange = function (invokable) {
                this.authenticationChangedEvent.addListener(invokable);
            };

            AuthenticationService.prototype.removeAuthenticationChange = function (invokable) {
                this.authenticationChangedEvent.removeListener(invokable);
            };
            AuthenticationService.$inject = ["$document"];
            return AuthenticationService;
        })();
        Services.AuthenticationService = AuthenticationService;
    })(FinancialApp.Services || (FinancialApp.Services = {}));
    var Services = FinancialApp.Services;
})(FinancialApp || (FinancialApp = {}));
//# sourceMappingURL=AuthenticationService.js.map
