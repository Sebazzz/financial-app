/// <init-options route="/"/>

module FinancialApp {
    'use strict';

    export interface IDefaultControllerScope extends ng.IScope {
        userName: string;
    }

    export class DefaultController {
        static $inject = ["$scope", "authentication"];

        constructor(private $scope: IDefaultControllerScope,
                    private authentication : Services.AuthenticationService) {
            $scope.userName = authentication.getUserName();
        }
    } 

}