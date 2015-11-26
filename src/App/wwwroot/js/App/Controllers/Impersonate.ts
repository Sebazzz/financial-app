/// <init-options route="/manage/impersonate"/>
/// <reference path="../../typings/angularjs/angular.d.ts" /> 
/// <reference path="../DTO.generated.d.ts"/>
/// <reference path="../Common.ts"/>

module FinancialApp {
    'use strict';

    export interface IAppImpersonateListControllerScope extends ng.IScope {
        users: DTO.IAppUserListing[];
        isLoaded: boolean;
        impersonateUser: IAction1<DTO.IAppUserListing>;
    }

    export class ImpersonateController {
        static $inject = ["$scope", "$modal", "$location", "impersonateResource", "authentication"];

        private api: ng.resource.IResourceClass<DTO.IAppUserListing>;

        constructor(private $scope: IAppImpersonateListControllerScope,
                    private $modal: ng.ui.bootstrap.IModalService,
                    private $location: ng.ILocationService,
                            impersonateResource: ng.resource.IResourceClass<DTO.IAppUserListing>,
                    private authentication: Services.AuthenticationService) {

            this.api = impersonateResource;

            $scope.users = this.api.query(() => {
                $scope.isLoaded = true;
            });

            $scope.impersonateUser = (user: DTO.IAppUserListing) => {
                this.impersonateUser(user);
            };
        }

        private impersonateUser(user: DTO.IAppUserListing) {
            this.authentication.impersonate(user.id).then(() => {
                this.$location.path("/");
                this.$location.replace();
            });
        }

    }

}