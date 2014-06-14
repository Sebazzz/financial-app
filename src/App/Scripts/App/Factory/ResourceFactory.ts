/// <reference path="../../typings/angularjs/angular.d.ts" /> 
/// <reference path="../Common.ts"/>

module FinancialApp.Factories {
    export interface IResourceFactory<T> {
        ($resource: ng.resource.IResourceService): IWebResourceClass<T>;
    };

    export interface IWebResourceClass<T> extends ng.resource.IResourceClass<T> {
        update(params: Object, data: T);
        update(params: Object, data: T, successCallback: IAction);
        update(params: Object, data: T, successCallback: IAction, failureCallback: IAction);
    }

    // ReSharper disable once InconsistentNaming
    export function ResourceFactory<T>(spec: string): IResourceFactory<T> {
        var fact = ($resource: ng.resource.IResourceService) =>
            $resource<T>(spec, undefined,
                {
                    'update': { method: 'PUT'}
                });

        return fact.withInject("$resource");
    }
}