/// <reference path="../typings/angularjs/angular.d.ts"/>
/// <reference path="DTO.ts"/>

module FinancialApp {

    export interface IArchiveScope extends ng.IScope {
        
        sheets : DTO.ISheetListing[];
    }

    export class ArchiveController {
        static $inject = ["$scope", "$resource"];

        private api : ng.resource.IResourceClass<DTO.ISheetListing>;

        constructor($scope : IArchiveScope, $resource : ng.resource.IResourceService) {
            this.api = $resource<DTO.ISheetListing>("/api/sheet/:id");

            $scope.sheets = this.api.query();
        }
    }
 }