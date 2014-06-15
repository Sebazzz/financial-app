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
        static $inject = ["$scope", "$location", "authentication"];

        constructor(private $scope: IAuthLoginScope,
                    private $location: ng.ILocationService,
                    private authentication: Services.AuthenticationService) {
            if (authentication.isAuthenticated()) {
                this.$location.path("/auth/success");
            }

            $scope.login = () => this.onLogin();
            $scope.isBusy = false;

            $scope.isBusy = authentication.isCheckingAuthentication;
            authentication.addAuthenticationChange(() => {
                if (authentication.isAuthenticated()) {
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
                    // handled by 
                }, () => {
                    this.$scope.errorMessage = "Inloggen mislukt. Controleer je gebruikersnaam of wachtwoord.";
                })
                .finally(() => {
                    this.$scope.isBusy = false;
                });
        }
    }

}