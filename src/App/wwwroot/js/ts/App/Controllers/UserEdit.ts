/// <init-options route="/manage/user/edit/:id" />
/// <reference path="../../typings/angularjs/angular.d.ts" /> 
/// <reference path="../DTO.generated.d.ts" /> 
/// <reference path="../Common.ts"/>

module FinancialApp {
    'use strict';

    export interface IUserEditScope extends ng.IScope {
        user: DTO.IAppUserMutate;
        isCurrentUser: boolean;
        errorMessage: string;
        save: IAction;
    }

    export class UserEditController {
        static $inject = ["$scope", "$routeParams", "$location", "authentication", "userResource"];

        private api: Factories.IWebResourceClass<DTO.IAppUserMutate>;

        constructor($scope: IUserEditScope,
                    $routeParams: IIdRouteParams,
                    $location: ng.ILocationService,
                    authentication: Services.AuthenticationService,
                    userResource: Factories.IWebResourceClass<DTO.IAppUserMutate>) {

            this.api = userResource;

            $scope.isCurrentUser = true;
            $scope.user = this.api.get({ id: $routeParams.id }, (data) => {
                $scope.isCurrentUser = data.id == authentication.getUserId();
            }, () => $location.path("/manage/user"));
            $scope.save = () => this.api.update({ id: $routeParams.id }, $scope.user, () => $location.path("/manage/user"));
        }
    }

}