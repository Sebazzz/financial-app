/// <init-options route="/manage/user/edit/:id" />
/// <reference path="../../typings/angularjs/angular.d.ts" /> 
/// <reference path="../DTO.generated.d.ts" /> 
/// <reference path="../Common.ts"/>

module FinancialApp {
    'use strict';

    export interface IUserEditScope extends ng.IScope {
        user: DTO.IAppUserMutate;
        errorMessage: string;
        save: IAction;
    }

    export class UserEditController {
        static $inject = ["$scope", "$routeParams", "$location", "userResource"];

        private api: Factories.IWebResourceClass<DTO.IAppUserMutate>;

        constructor($scope: IUserEditScope, $routeParams: IIdRouteParams, $location: ng.ILocationService, userResource: Factories.IWebResourceClass<DTO.IAppUserMutate>) {
            this.api = userResource;

            $scope.user = this.api.get({ id: $routeParams.id }, () => { }, () => $location.path("/manage/user"));
            $scope.save = () => this.api.update({ id: $routeParams.id }, $scope.user, () => $location.path("/manage/user"));
        }
    }

}