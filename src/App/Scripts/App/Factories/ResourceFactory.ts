/// <reference path="../../typings/angularjs/angular.d.ts" /> 
/// <reference path="../Common.ts"/>

module FinancialApp.Factories {
    'use strict';

    export interface IResourceFactory<T> {
        ($resource: ng.resource.IResourceService): IWebResourceClass<T>;
    };

    export interface IWebResourceClass<T> extends ng.resource.IResourceClass<T> {
        update(params: Object, data: T) : void;
        update(params: Object, data: T, successCallback: IAction): void;
        update(params: Object, data: T, successCallback: IAction, failureCallback: IAction): void;
    }

    export interface ISheetDate {
        month: number;
        year: number;
    }

    export interface ISheetWebResourceClass extends IWebResourceClass<DTO.ISheet> {
        getByDate(params: ISheetDate) : DTO.ISheet;
        getByDate(params: ISheetDate, success: Function, error?: Function): DTO.ISheet;
    }

    // ReSharper disable InconsistentNaming
    export function ResourceFactory<T>(spec: string, extraMethods?: Object): IResourceFactory<T> {
        var extraParams = {
            'update': { method: 'PUT' }
        };

        angular.extend(extraParams, extraMethods);

        var fact = ($resource: ng.resource.IResourceService) =>
            $resource<T>(spec, undefined, extraParams);

        return fact.withInject("$resource");
    }

    
}