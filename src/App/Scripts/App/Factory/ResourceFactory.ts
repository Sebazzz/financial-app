/// <reference path="../../typings/angularjs/angular.d.ts" /> 

module FinancialApp.Factories {
    export interface IResourceFactory<T> {
        ($resource: ng.resource.IResourceService): ng.resource.IResourceClass<T>;
    };

    // ReSharper disable once InconsistentNaming
    export function ResourceFactory<T>(spec: string): IResourceFactory<T> {
        var fact = ($resource: ng.resource.IResourceService) => $resource<T>(spec);
        fact.$inject = ["$resource"];
        return fact;
    }
}