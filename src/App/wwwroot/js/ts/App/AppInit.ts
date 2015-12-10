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

            if (Program.isInitialized) {
                throw new Error("App is already initialized!");
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
            moment.locale('nl');

            // define module
            var app: ng.IModule = angular.module('main',
                ['ngRoute', 'ngMoment', 'ngLocale', 'ngResource', 'angular-loading-bar', 'ui.bootstrap', 'cfp.hotkeys', 'googlechart']);

            app.config((($routeProvider: ng.route.IRouteProvider, $locationProvider: ng.ILocationProvider, $httpProvider : ng.IHttpProvider) => {
                // generated routes
                FinancialApp.ControllerInitializer.registerControllerRoutes($routeProvider);

                // custom routes
                // ... special 'now' route
                $routeProvider.when("/now", {
                    redirectTo: Program.createNowRoute()
                });

                // ... special 'now' add route
                $routeProvider.when("/now/entries/add", {
                    redirectTo: Program.createNowRoute("entries/add")
                });

                // fallback
                $routeProvider.otherwise({
                    redirectTo: '/'
                });

                // use the HTML5 History API (with automatic fallback)
                $locationProvider.html5Mode(true);

                // configure HTTP interceptor
                $httpProvider.interceptors.push('apiCachingPreventionInterceptor');
                $httpProvider.interceptors.push('authenticationCheckInterceptor');
                $httpProvider.interceptors.push('viewFingerPrintInterceptor');
                $httpProvider.interceptors.push('connectionFailureInterceptor');
                $httpProvider.interceptors.push('connectionFailureRetryInterceptor');
            }).withInject("$routeProvider", "$locationProvider", "$httpProvider"));

            // constants
            app.constant("appVersion", Program.getAppVersion());

            // factories
            app.factory("categoryResource", Factories.ResourceFactory<DTO.ICategory>("/api/category/:id"));
            app.factory("userResource", Factories.ResourceFactory<DTO.IAppUserListing>("/api/user/:id"));
            app.factory("impersonateResource", Factories.ResourceFactory<DTO.IAppUserListing>("/api/user/impersonate/:id", {
                'impersonate': {
                    method: 'POST',
                    url: '/api/user/impersonate/:id'
                }
            }));
            app.factory("sheetResource", Factories.ResourceFactory<DTO.ISheet>("/api/sheet/:id", {
                'getByDate': {
                    method: 'GET',
                    url: '/api/sheet/:year-:month'
                }
            }));

            app.factory("sheetEntryResource", Factories.ResourceFactory<DTO.ISheetEntry>("/api/sheet/:sheetYear-:sheetMonth/entries/:id", {
                'mutateOrder': {
                    method: 'PUT',
                    url: '/api/sheet/:sheetYear-:sheetMonth/entries/order/:mutation/:id'
                }
            }));

            // ... $http interceptors
            app.factory("apiCachingPreventionInterceptor", Factories.ApiCachingPreventionInterceptor());
            app.factory("authenticationCheckInterceptor", Factories.AuthenticationErrorHttpInterceptor());
            app.factory("viewFingerPrintInterceptor", Factories.ViewFingerPrintInterceptor());
            app.factory('connectionFailureRetryInterceptor', Factories.ConnectionFailureRetryInterceptor());
            app.factory("connectionFailureInterceptor", Factories.ConnectionFailureInterceptor());
             
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
            app.directive("faRequiredIf", Directives.RequiredIf.factory);
            app.directive("faSameValue", Directives.SameValue.factory);
            app.directive("faSmartFloat", Directives.SmartFloatDirective.factory);
            app.directive("faScrollNub", Directives.ScrollNub.factory.withInject("$window"));

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
                        alert('Een nieuwe versie is beschikbaar. De pagina wordt herladen.')
                        window.location.reload();
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

        private static getAppVersion(): string {
            var htmlElement = <HTMLHtmlElement> document.getElementsByTagName("html")[0];
            var appVersion = htmlElement.getAttribute("data-app-version");
            return appVersion;
        }

        static createNowRoute(subPath = ""): string {
            if (subPath) {
                subPath = "/" + subPath;
            }

            var now: Date = new Date();
            return '/sheet/' + now.getFullYear() + "/" + (now.getMonth() + 1) + subPath;
        }

        static handleWindowError(message: string, filename?: string, lineno?: number, colno?: number, error?: Error) {
            var n = "\n";
            alert("Error in Application" + n +
                "'" + filename+"' at:"+n+
                " Line #" + lineno + " col #" + colno + n +
                " At: " + filename);

            alert("Error Type: " + event.toString() + n +
                "Name: " + event.srcElement);
        }
    }
}