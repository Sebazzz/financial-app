/// <init-options route="/manage/user"/>
/// <reference path="../../typings/angularjs/angular.d.ts" /> 
/// <reference path="../DTO.generated.d.ts"/>
/// <reference path="../Common.ts"/>

module FinancialApp {
    'use strict';

    export interface IAppUserListControllerScope extends ng.IScope {
        users: DTO.IAppUserListing[];
        isLoaded: boolean;
        deleteUser: IAction1<DTO.IAppUserListing>;
    }

    export class UserListController {
        static $inject = ["$scope", "$modal", "userResource"];

        private api: ng.resource.IResourceClass<DTO.IAppUserListing>;

        constructor(private $scope: IAppUserListControllerScope,
                    private $modal: ng.ui.bootstrap.IModalService,
                            userResource: ng.resource.IResourceClass<DTO.IAppUserListing>) {
            this.api = userResource;

            $scope.users = this.api.query(() => {
                $scope.isLoaded = true;
            });

            $scope.deleteUser = (user: DTO.IAppUserListing) => {
                this.deleteUser(user);
            };
        }

        private deleteUser(user: DTO.IAppUserListing) {
            var res = ConfirmDialogController.create(this.$modal, {
                title: 'Gebruiker verwijderen',
                bodyText: 'Weet je zeker dat je de gebruiker "' + user.userName + "' wilt verwijderen?",
                dialogType: DialogType.Danger
            });

            res.result.then(() => this.deleteUserCore(user));
        }

        private deleteUserCore(user: DTO.IAppUserListing) {
            this.$scope.isLoaded = false;
            this.api['delete']({ id: user.id }, () => {
                this.$scope.isLoaded = true;
                this.$scope.users.remove(user);
            });
        }

    }

}