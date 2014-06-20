 /// <reference path="../typings/angularjs/angular.d.ts" /> 
 /// <reference path="../typings/angularjs/angular-route.d.ts" /> 
 /// <reference path="../typings/angularjs/angular-resource.d.ts" /> 
 /// <reference path="../typings/moment/moment.d.ts" /> 
 /// <reference path="Controllers/ControllerInit.d.ts" /> 
 /// <reference path="Factories/ResourceFactory.ts" /> 
 /// <reference path="DTO.generated.d.ts" /> 

module FinancialApp {
    'use strict';

    export class Program {
        static isInitialized: boolean;

        static init() {
            /// <summary>Initializes the application</summary>

            if (Program.isInitialized === true) {
                throw new Error("App is already initialized");
            }

            if (Program.enableDebug()) {
                window.onerror = <ErrorEventHandler>Program.handleWindowError;
            }

            if (!window.localStorage) {
                alert('Sorry, your browser does not support local storage and can therefore not run this app.');
                throw new Error("Local Storage (HTML5) support required, but was not present");
            }

            Program.isInitialized = true;

            // moment language (hardcoded dutch for now)
            moment.lang('nl');

            // define module
            var app: ng.IModule = angular.module('main',
                ['ngRoute', 'ngMoment', 'ngLocale', 'ngResource', 'angular-loading-bar', 'ui.bootstrap']);

            app.config((($routeProvider: ng.route.IRouteProvider, $locationProvider: ng.ILocationProvider) => {
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
            }).withInject("$routeProvider", "$locationProvider"));

            // factories
            app.factory("categoryResource", Factories.ResourceFactory<DTO.ICategory>("/api/category/:id"));
            app.factory("userResource", Factories.ResourceFactory<DTO.IAppUserListing>("/api/user/:id"));
            app.factory("sheetResource", Factories.ResourceFactory<DTO.ISheet>("/api/sheet/:id", {
                'getByDate': {
                    method: 'GET',
                    url: '/api/sheet/:year/:month'
                }
            }));

            app.factory("sheetEntryResource", Factories.ResourceFactory<DTO.ISheetEntry>("/api/sheet/:sheetId/entries/:id"));

            app.factory("localStorage", Factories.LocalStorageFactory());

            // error handling
            if (Program.enableDebug()) {
                app.factory('$exceptionHandler', () => (exception, cause) => {
                    alert(exception.message);
                    alert(cause);
                });
            }

            // services
            app.service("authentication", Services.AuthenticationService);
            app.service("calculation", Services.CalculationService);

            // directives
            app.directive("faRequiredIf", Directives.RequiredIf.directive());

            // controllers
            FinancialApp.ControllerInitializer.registerControllers(app);

            // run
            app.run((($templateCache: ng.ITemplateCacheService, $http: ng.IHttpService) => {
                $http.get('/Angular/Widgets/Loader.html', { cache: $templateCache });
            }).withInject("$templateCache", "$http")); 

            // application cache (HTML5)
            Program.initAppCache();
        }

        private static initAppCache() {
            if (!window.addEventListener) {
                return;
            }

            // Check if a new cache is available on page load.
            window.addEventListener('load', e => {
                if (!window.applicationCache) {
                    return;
                }

                window.applicationCache.addEventListener('updateready', () => {
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

        private static enableDebug(): boolean {
            var htmlElement = <HTMLHtmlElement> document.getElementsByTagName("html")[0];
            var isMobileDebug = htmlElement.getAttribute("data-is-mobile") === "true";
            return isMobileDebug;
        }

        static createNowRoute(): string {
            var now: Date = new Date();
            return '/sheet/' + now.getFullYear() + "/" + (now.getMonth() + 1);
        }

        static handleWindowError(errMsg: string, url: string, lineNumber: number, column: number = 0, errType : Error = new Error("(no details)")) {
            var n = "\n";
            alert("Error in Application" + n +
                  "'"+errMsg+"' at:"+n+
                  " Line #"+lineNumber+" col #"+column + n +
                  " At: "+url);

            alert("Error Type: " + errType.toString() + n +
                  "Name: "+ errType.name);
        }
    }
}