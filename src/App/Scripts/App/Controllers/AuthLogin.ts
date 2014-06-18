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

        errorMessage: string;
    }

    export class AuthLoginController {
        static $inject = ["$scope", "$location", "$log", "authentication"];

        constructor(private $scope: IAuthLoginScope,
                    private $location: ng.ILocationService,
                            $log: ng.ILogService,
                    private authentication: Services.AuthenticationService) {
            if (authentication.isAuthenticated()) {
                $log.info("AuthLoginController: Already authenticated. Redirecting.");
                this.$location.path("/auth/success");
                return;
            }

            $scope.login = () => this.onLogin();
            $scope.isBusy = false;

            $scope.isBusy = authentication.isCheckingAuthentication;
            authentication.addAuthenticationChange(() => {
                $scope.isBusy = false;

                if (authentication.isAuthenticated()) {
                    $log.info("AuthLoginController: Has authenticated. Redirecting.");
                    this.$location.path("/auth/success");
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
    }

}