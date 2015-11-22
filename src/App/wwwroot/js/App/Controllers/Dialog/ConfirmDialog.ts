/// <init-options exclude="route"/>
/// <reference path="../../../typings/angularjs/angular.d.ts"/>

module FinancialApp {
    'use strict';

    export enum DialogType {
        Info,
        Danger,
        Warning
    }
    
    export interface IConfirmDialogOptions {
        title: string;
        bodyText: string;
        dialogType: DialogType;

        okResult?: any;
        cancelResult?: any;
        okButtonText?: string;
        cancelButtonText?:string;
    }

    export interface IConfirmDialogScope extends ng.IScope {
        options: IConfirmDialogOptions;

        ok: IAction;
        cancel: IAction;

        // ReSharper disable once InconsistentNaming
        DialogType: typeof DialogType;
    }

    export class ConfirmDialogController {
        static $inject = ["$scope", "$modalInstance", "options"];
        static templateUrl = "/Angular/Dialogs/ConfirmDialog.html";

        static create($modal: ng.ui.bootstrap.IModalService, options: IConfirmDialogOptions) : ng.ui.bootstrap.IModalServiceInstance {
            return $modal.open({
                templateUrl: ConfirmDialogController.templateUrl,
                controller: ConfirmDialogController,
                resolve: {
                    options: () => options
                }
            });
        }

        constructor($scope: IConfirmDialogScope, $modalInstance: ng.ui.bootstrap.IModalServiceInstance, options: IConfirmDialogOptions) {
            $scope.DialogType = DialogType;
            $scope.options = options;

            $scope.ok = () => $modalInstance.close(options.okResult);
            $scope.cancel = () => $modalInstance.dismiss(options.cancelResult);
        }
    }
}