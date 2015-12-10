/// <init-options route="/manage/user/add" viewName="UserEdit" />
/// <reference path="../../typings/angularjs/angular.d.ts" /> 
/// <reference path="../DTO.generated.d.ts"/>
/// <reference path="../Common.ts"/>

module FinancialApp {
    'use strict';

    export interface IUserCreateScope extends ng.IScope {
        user: DTO.IAppUserMutate;
        errorMessage: string;
        save: IAction;
    }

    export class UserCreateController {
        public static $inject = ['$scope', '$location', 'userResource'];

        private api: ng.resource.IResourceClass<DTO.IAppUserMutate>;

        constructor($scope: IUserCreateScope,
                    $location: ng.ILocationService,
                    userResource: ng.resource.IResourceClass<DTO.IAppUserMutate>) {
            this.api = userResource;

            $scope.save = () => this.api.save($scope.user, (data) => {
                $scope.user.id = <number>data.id;

                $location.path('/manage/user');
            }, (data: string[]) => {
                $scope.errorMessage = data.join('; ');
            });
        }
    }

}