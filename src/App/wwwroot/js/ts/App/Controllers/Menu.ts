/// <init-options exclude="route"/>
/// <reference path="../../typings/angularjs/angular.d.ts"/>
/// <reference path="../Services/AuthenticationService.ts"/>

module FinancialApp {
    'use strict';

    export interface IMenuControllerScope extends ng.IScope {
        currentPath : string;
        nowPath: string;

        hasPath(str: string): boolean;

        extendMenuVisible: boolean;
        toggleNavBar: IAction;

        currentUser: string;

        clientCount(): number;
        loggedInUserSummary() : string;
    }

    export class MenuController {
        public static $inject = ['$scope', '$location', 'authentication'];

        private hubConnection : HubConnection;
        private hub : AppOwnerHub;

        private clients: string[] = [];

        constructor(private $scope: IMenuControllerScope, $location: ng.ILocationService, private authentication : Services.AuthenticationService) {
            $scope.currentPath = $location.path();
            $scope.nowPath = Program.createNowRoute();
            $scope.extendMenuVisible = false;

            $scope.hasPath = function(str: string): boolean {
                return str == this.currentPath;
            };

            $scope.clientCount = () => Math.max(0, this.clients.length - 1);
            $scope.loggedInUserSummary = () => Enumerable.from(this.clients).toJoinedString('\r\n');

            $scope.$on('$locationChangeSuccess', () => {
                $scope.currentPath = $location.path();
                $scope.extendMenuVisible = false;
            });

            $scope.toggleNavBar = () => $scope.extendMenuVisible = !$scope.extendMenuVisible;

            this.hubConnection = $.hubConnection('/extern/signalr');
            this.hubConnection.logging = true;
            this.hub = this.hubConnection.createHubProxy('appOwnerHub');
            this.oneTimeSignalRSetup();

            authentication.addAuthenticationChange(() => this.handleSignalR(authentication.isAuthenticated()));
            $scope.$on('$destroy', () => this.shutdownSignalR());
        }

        public handleSignalR(isAuthenticated: boolean): void {
            if (isAuthenticated) {
                this.setupSignalR();
            } else {
                this.shutdownSignalR();
            }

            this.$scope.currentUser = this.authentication.getUserName();
        }

        public shutdownSignalR() {
            if (!this.hubConnection) {
                return;
            }

            this.hubConnection.stop();
        }

        public setupSignalR() {
            this.hubConnection.start();
        }

        public oneTimeSignalRSetup() {
            this.hub.on('popClient', (name: string) => {
                var idx = this.clients.indexOf(name);
                if (idx !== -1) {
                    this.clients.remove(name);

                    this.$scope.$apply();
                }
            });

            this.hub.on('pushClient', (name: string) => {
                var idx = this.clients.indexOf(name);
                if (idx !== -1) {
                    this.clients.push(name);

                    this.$scope.$apply();
                }
            });

            this.hub.on('setInitialClientList', (names: string[]) => {
                this.clients = names;

                this.$scope.$apply();
            });

            this.handleSignalR(this.authentication.isAuthenticated());
        }
    }

}