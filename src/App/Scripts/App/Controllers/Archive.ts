/// <reference path="../../typings/angularjs/angular.d.ts"/>
/// <reference path="../../typings/linq/linq.d.ts"/>
/// <reference path="../DTO.generated.d.ts"/>

module FinancialApp {
    'use strict';

    export interface IArchiveScope extends ng.IScope {
        
        sheets: DTO.ISheetListing[];
        isLoaded : boolean;
    }

    export class ArchiveController {
        static $inject = ["$scope", "$resource"];

        private api : ng.resource.IResourceClass<DTO.ISheetListing>;

        constructor($scope : IArchiveScope, $resource : ng.resource.IResourceService) {
            this.api = $resource<DTO.ISheetListing>("/api/sheet/:id");

            $scope.sheets = this.api.query(() => {
                $scope.isLoaded = true;
                this.postProcess($scope.sheets);
            });
        }

        postProcess(sheets: DTO.ISheetListing[]) {
            var now = moment();
            var m = now.month() + 1, y = now.year();

            if (!Enumerable.From(sheets).Any(x => m === x.month && y === x.year)) {
                // add dummy
                sheets.push({
                    month: m,
                    year: y,
                    updateTimestamp: now.toISOString(),
                    createTimestamp: now.toISOString(),
                    name: null
                });
            }
        }
    }
 }