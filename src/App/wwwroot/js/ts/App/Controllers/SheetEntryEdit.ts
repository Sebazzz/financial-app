/// <init-options route="/sheet/:year/:month/entries/:id" />
/// <reference path="../../typings/angularjs/angular.d.ts" /> 
/// <reference path="../DTO.generated.d.ts" /> 
/// <reference path="../Common.ts"/>

module FinancialApp {
    
    'use strict';

    export interface ISheetEntryEditRouteParams extends ng.route.IRouteParamsService, IIdRouteParams {
        year: string;
        month: string;
    }

    export interface ISheetEntryEditScope extends ng.IScope {
        entry: DTO.ISheetEntry;
        categories: ng.resource.IResourceArray<DTO.ICategoryListing>;

        // copy enum
        // ReSharper disable once InconsistentNaming
        AccountType: typeof DTO.AccountType;

        saveEntry: IAction;
        cancel: IAction;
        deleteEntry: IAction;
        isLoaded: boolean;
    }

    export class SheetEntryEditController {
        public static $inject = ['$scope', '$location', '$routeParams', '$modal', 'sheetEntryResource', 'categoryResource'];

        private api: ng.resource.IResourceClass<DTO.IAppUserMutate>;

        private hubConnection: HubConnection;
        private hub: SheetHub;
        private entryWatcherDispose : Function;

        constructor(private $scope: ISheetEntryEditScope,
                    private $location: ng.ILocationService,
                    private $routeParams: ISheetEntryEditRouteParams,
                    private $modal: ng.ui.bootstrap.IModalService,
                    private recurringSheetEntryResource: Factories.IWebResourceClass<DTO.ISheetEntry>,
                    categoryResource: ng.resource.IResourceClass<DTO.ICategoryListing>) {
            $scope.cancel = () => this.redirectToOverview();
            $scope.isLoaded = false;
            $scope.AccountType = DTO.AccountType;

            $scope.categories = categoryResource.query(() => {
                this.signalCategoriesLoaded();
            });

            $scope.entry = recurringSheetEntryResource.get({
                sheetYear: $routeParams.year,
                sheetMonth: $routeParams.month,
                id: $routeParams.id
            }, () => this.signalEntryLoaded());

            $scope.deleteEntry = () => this.deleteEntry();
            $scope.saveEntry = () => this.saveEntry();

            // set-up signal-r
            this.hubConnection = $.hubConnection('/extern/signalr');
            this.hubConnection.logging = true;
            this.setupSignalR($routeParams.year + '-' + $routeParams.month);

            $scope.$on('$destroy', () => this.shutdownSignalR());
        }

        private setupSignalR(sheetId: string) {
            this.hubConnection.qs = {
                sheetId: sheetId
            };

            this.hub = this.hubConnection.createHubProxy('sheetHub');
            this.hubConnection.start();

            var realtimeId = null,
                isPushing = false;
            this.entryWatcherDispose = this.$scope.$watchCollection(($s) => $s['entry'], (val) => {
                if (realtimeId != null) {
                    this.$scope.entry['realtimeId'] = realtimeId;
                }

                var copy = <IRealtimeSheetEntryInfo>$.extend({}, val);
                copy.sortOrder = 9999; // we don't know, take highest to push to others

                if (!isPushing) {
                    isPushing = true;

                    this.hub.invoke('addOrUpdatePendingSheetEntry', copy)
                        .done(id => {
                            realtimeId = id;
                        }).always(() => isPushing = false);
                }
            });
        }

        private shutdownSignalR() {
            if (!this.hubConnection) {
                return;
            }

            this.hubConnection.stop();
        }

        private redirectToOverview() {
            this.$location.url('/sheet/' + this.$routeParams.year + '/' + this.$routeParams.month);
        }

        private deleteEntry() {
            var res = ConfirmDialogController.create(this.$modal, {
                title: 'Regel verwijderen',
                bodyText: 'Weet je zeker dat je de regel wilt verwijderen?',
                dialogType: DialogType.Danger
            });

            res.result.then(() => this.deleteEntryCore());
        }

        private deleteEntryCore() {
            // server-side delete
            var params = {
                sheetMonth: this.$routeParams.month,
                sheetYear: this.$routeParams.year,
                id: this.$routeParams.id
            };

            if (this.entryWatcherDispose) this.entryWatcherDispose();

            this.recurringSheetEntryResource['delete'](params, () => {
                var copy = <IFinalizeRealtimeSheetEntry>$.extend({
                    committed: false,
                    categoryId : 0
                }, this.$scope.entry);
                copy.id = this.$scope.entry.id;

                this.hub.invoke('finalizeSheetEntry', copy).always(() => this.redirectToOverview());
            });
        }

        private saveEntry() {
            var params = {
                sheetMonth: this.$routeParams.month,
                sheetYear: this.$routeParams.year,
                id: this.$routeParams.id
            };

            if (this.entryWatcherDispose) this.entryWatcherDispose();

            this.$scope.isLoaded = false;
            var res = <ng.resource.IResource<any>> <any> this.recurringSheetEntryResource.update(params, this.$scope.entry);
            res.$promise.then((ret: DTO.IInsertId) => {
                var copy = <IFinalizeRealtimeSheetEntry>$.extend({
                    committed: true
                }, this.$scope.entry);
                copy.id = ret.id;

                this.hub.invoke('finalizeSheetEntry', copy).always(() => this.redirectToOverview());
            });
            res.$promise['catch'](() => {
                this.$scope.isLoaded = true;
            });
        }

        private signalCategoriesLoaded() {
            if (this.$scope.entry.id) {
                this.$scope.isLoaded = true;
            }
        }

        private signalEntryLoaded() {
            if (this.$scope.categories.$resolved) {
                this.$scope.isLoaded = true;
            }
        }
    }
} 