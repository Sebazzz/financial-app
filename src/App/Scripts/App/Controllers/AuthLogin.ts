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
    }

    export class AuthLoginController {
        static $inject = ["$scope", "authentication"];

        constructor($scope: IAuthLoginScope, authentication : Services.AuthenticationService) {
            $scope.login = () => alert('Dikke pech');
        }
    }

}