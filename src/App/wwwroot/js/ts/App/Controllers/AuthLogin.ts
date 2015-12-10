/// <init-options route="/auth/login" />
/// <reference path="../../typings/angularjs/angular.d.ts" /> 
/// <reference path="../Services/AuthenticationService.ts"/>

module FinancialApp {
    'use strict';

    export interface IAuthLoginScope extends ng.IScope {
        userName: string;
        password: string;
        rememberMe: boolean;

        login: IAction;
        isBusy: boolean;

        wasLoggedOff:boolean;

        errorMessage: string;
    }

    export class AuthLoginController {
        static $inject = ["$scope", "$location", "$timeout", "$log", "authentication"];

        private targetPath: string;

        constructor(private $scope: IAuthLoginScope,
                    private $location: ng.ILocationService,
                    private $timeout: ng.ITimeoutService,
                            $log: ng.ILogService,
                    private authentication: Services.AuthenticationService) {
            var uriArgs = (this.$location.search() || {});

            this.targetPath = uriArgs.uri || "/";
            var doLogOff = !!uriArgs.logOff;
            $scope.wasLoggedOff = !!uriArgs.wasLoggedOff;

            if (doLogOff) {
                authentication.logOff();
                return;
            }

            if (authentication.isAuthenticated()) {
                $log.info("AuthLoginController: Already authenticated. Redirecting.");
                this.postLoginRedirect();
                return;
            }

            $scope.login = () => this.onLogin();
            $scope.isBusy = false;

            $scope.isBusy = authentication.isCheckingAuthentication;
            authentication.addAuthenticationChange(() => {
                $scope.isBusy = false;

                if (authentication.isAuthenticated()) {
                    $log.info("AuthLoginController: Has authenticated. Redirecting.");
                    this.postLoginRedirect();
                }
            });
        }

        private onLogin() {
            this.$scope.isBusy = true;
            this.$scope.errorMessage = null;

            this.authentication.authenticate(
                    this.$scope.userName,
                    this.$scope.password,
                    this.$scope.rememberMe)
                .then(() => {
                    // handled by authorization control
                }, () => {
                    this.$scope.errorMessage = "Inloggen mislukt. Controleer je gebruikersnaam of wachtwoord.";
                })['finally'](() => {
                    this.$scope.isBusy = false;
                });
        }

        private postLoginRedirect() {
            this.$timeout(() => {
                this.$location.search({});
                this.$location.path(this.targetPath);
                this.$location.replace();
            }, 250, false);
        }
    }

}