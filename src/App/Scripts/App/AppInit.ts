 /// <reference path="../typings/angularjs/angular.d.ts" /> 
 /// <reference path="../typings/angularjs/angular-route.d.ts" /> 
 /// <reference path="../typings/angularjs/angular-resource.d.ts" /> 
 /// <reference path="../typings/moment/moment.d.ts" /> 
 /// <reference path="Controllers/ControllerInit.d.ts" /> 
 /// <reference path="Factory/ResourceFactory.ts" /> 
 /// <reference path="DTO.generated.ts" /> 

module FinancialApp {
    'use strict';

    export class Program {
        static isInitialized: boolean;

        static init() {
            /// <summary>Initializes the application</summary>

            if (Program.isInitialized === true) {
                throw new Error("App is initialized");
            }

            Program.isInitialized = true;

            // moment language
            moment.lang('nl');

            // define module
            var app: ng.IModule = angular.module('main', ['ngRoute', 'ngMoment', 'ngResource', 'angular-loading-bar', 'ui.bootstrap']);

            app.config(($routeProvider: ng.route.IRouteProvider, $locationProvider: ng.ILocationProvider) => {
                // generated routes
                FinancialApp.ControllerInitializer.registerControllerRoutes($routeProvider);

                // custom routes
                // ... special 'now' route
                $routeProvider.when("/now", {
                    redirectTo: Program.createNowRoute()
                });

                // fallback
                $routeProvider.otherwise({
                    redirectTo: '/'
                });

                // use the HTML5 History API (with automatic fallback)
                $locationProvider.html5Mode(true);
            });

            // factories
            app.factory("categoryResource", Factories.ResourceFactory<DTO.ICategory>("/api/category/:id"));

            // controllers
            FinancialApp.ControllerInitializer.registerControllers(app);

            // run
            app.run(($templateCache: ng.ITemplateCacheService, $http: ng.IHttpService) => {
                $http.get('/Angular/Widgets/Loader.html', { cache: $templateCache });
            }); 

            Program.initAppCache();
        }

        private static initAppCache() {
            // Check if a new cache is available on page load.
            window.addEventListener('load', e => {
                if (!window.applicationCache) {
                    return;
                }

                window.applicationCache.addEventListener('updateready', function (e) {
                    if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
                        // Browser downloaded a new app cache.
                        if (confirm('Een nieuwe versie is beschikbaar. Wens je te herladen?')) {
                            window.location.reload();
                        }
                    } else {
                        // Manifest didn't changed. Nothing new to server.
                    }
                }, false);

            }, false);
        }

        static createNowRoute(): string {
            var now: Date = new Date();
            return '/sheet/' + now.getFullYear() + "/" + (now.getMonth() + 1);
        }
    }
}