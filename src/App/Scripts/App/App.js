var FinancialApp;
(function (FinancialApp) {
    'use strict';

    Function.prototype.withInject = function () {
        var $inject = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            $inject[_i] = arguments[_i + 0];
        }
        this.$inject = $inject;

        return this;
    };

    Array.prototype.remove = function (object) {
        var cnt = this.length;
        for (var i = 0; i < cnt; i++) {
            if (object === this[i]) {
                this.splice(i, 1);
                return true;
            }
        }

        return false;
    };

    var Delegate = (function () {
        function Delegate() {
            this.functors = [];
        }
        Delegate.prototype.addListener = function (listener) {
            this.functors.push(listener);
        };

        Delegate.prototype.removeListener = function (listener) {
            this.functors.remove(listener);
        };

        Delegate.prototype.invoke = function (invoker) {
            var invokables = [].concat(this.functors);

            for (var i = 0; i < invokables.length; i++) {
                var retVal = invoker(invokables[i]);

                if (retVal === false) {
                    break;
                }
            }
        };
        return Delegate;
    })();
    FinancialApp.Delegate = Delegate;
})(FinancialApp || (FinancialApp = {}));

;
/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../Common.ts"/>
var FinancialApp;
(function (FinancialApp) {
    (function (Factories) {
        'use strict';

        ;

        // ReSharper disable once InconsistentNaming
        function ResourceFactory(spec) {
            var fact = function ($resource) {
                return $resource(spec, undefined, {
                    'update': { method: 'PUT' }
                });
            };

            return fact.withInject("$resource");
        }
        Factories.ResourceFactory = ResourceFactory;
    })(FinancialApp.Factories || (FinancialApp.Factories = {}));
    var Factories = FinancialApp.Factories;
})(FinancialApp || (FinancialApp = {}));
/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/angularjs/angular-route.d.ts" />
/// <reference path="../typings/angularjs/angular-resource.d.ts" />
/// <reference path="../typings/moment/moment.d.ts" />
/// <reference path="Controllers/ControllerInit.d.ts" />
/// <reference path="Factories/ResourceFactory.ts" />
/// <reference path="DTO.generated.d.ts" />
var FinancialApp;
(function (FinancialApp) {
    'use strict';

    var Program = (function () {
        function Program() {
        }
        Program.init = function () {
            /// <summary>Initializes the application</summary>
            if (Program.isInitialized === true) {
                throw new Error("App is already initialized");
            }

            window.onerror = Program.handleWindowError;

            if (!window.localStorage) {
                alert('Sorry, your browser does not support local storage and can therefore not run this app.');
                throw new Error("Local Storage (HTML5) support required, but was not present");
            }

            Program.isInitialized = true;

            // moment language (hardcoded dutch for now)
            moment.lang('nl');

            // define module
            var app = angular.module('main', ['ngRoute', 'ngMoment', 'ngResource', 'angular-loading-bar', 'ui.bootstrap']);

            app.config((function ($routeProvider, $locationProvider) {
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
            app.factory("categoryResource", FinancialApp.Factories.ResourceFactory("/api/category/:id"));
            app.factory("localStorage", FinancialApp.Factories.LocalStorageFactory());

            // error handling
            app.factory('$exceptionHandler', function () {
                return function (exception, cause) {
                    alert(exception.message);
                    alert(cause);
                };
            });

            // services
            app.service("authentication", FinancialApp.Services.AuthenticationService);

            // controllers
            FinancialApp.ControllerInitializer.registerControllers(app);

            // run
            app.run((function ($templateCache, $http) {
                $http.get('/Angular/Widgets/Loader.html', { cache: $templateCache });
            }).withInject("$templateCache", "$http"));

            // application cache (HTML5)
            Program.initAppCache();
        };

        Program.initAppCache = function () {
            if (!window.addEventListener) {
                return;
            }

            // Check if a new cache is available on page load.
            window.addEventListener('load', function (e) {
                if (!window.applicationCache) {
                    return;
                }

                window.applicationCache.addEventListener('updateready', function () {
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
        };

        Program.createNowRoute = function () {
            var now = new Date();
            return '/sheet/' + now.getFullYear() + "/" + (now.getMonth() + 1);
        };

        Program.handleWindowError = function (errMsg, url, lineNumber, column, errType) {
            if (typeof column === "undefined") { column = 0; }
            if (typeof errType === "undefined") { errType = new Error("(no details)"); }
            var n = "\n";
            alert("Error in Application" + n + "'" + errMsg + "' at:" + n + " Line #" + lineNumber + " col #" + column + n + " At: " + url);

            alert("Error Type: " + errType.toString() + n + "Name: " + errType.name);
        };
        return Program;
    })();
    FinancialApp.Program = Program;
})(FinancialApp || (FinancialApp = {}));
/// <reference path="../../typings/angularjs/angular.d.ts"/>
/// <reference path="../../typings/linq/linq.d.ts"/>
/// <reference path="../DTO.generated.d.ts"/>
var FinancialApp;
(function (FinancialApp) {
    'use strict';

    var ArchiveController = (function () {
        function ArchiveController($scope, $resource) {
            var _this = this;
            this.api = $resource("/api/sheet/:id");

            $scope.sheets = this.api.query(function () {
                $scope.isLoaded = true;
                _this.postProcess($scope.sheets);
            });
        }
        ArchiveController.prototype.postProcess = function (sheets) {
            var now = moment();
            var m = now.month() + 1, y = now.year();

            if (!Enumerable.From(sheets).Any(function (x) {
                return m === x.month && y === x.year;
            })) {
                // add dummy
                sheets.push({
                    month: m,
                    year: y,
                    updateTimestamp: now.toISOString(),
                    createTimestamp: now.toISOString(),
                    name: null
                });
            }
        };
        ArchiveController.$inject = ["$scope", "$resource"];
        return ArchiveController;
    })();
    FinancialApp.ArchiveController = ArchiveController;
})(FinancialApp || (FinancialApp = {}));
/// <reference path="../Common.ts"/>
/// <reference path="../../typings/angularjs/angular.d.ts"/>
/// <reference path="../DTO.generated.d.ts"/>
var FinancialApp;
(function (FinancialApp) {
    (function (Services) {
        'use strict';

        var AuthenticationInfo = (function () {
            function AuthenticationInfo(isAuthenticated, userId, userName) {
                if (typeof isAuthenticated === "undefined") { isAuthenticated = false; }
                if (typeof userId === "undefined") { userId = 0; }
                if (typeof userName === "undefined") { userName = null; }
                this.isAuthenticated = isAuthenticated;
                this.userId = userId;
                this.userName = userName;
            }
            return AuthenticationInfo;
        })();

        var AuthenticationService = (function () {
            function AuthenticationService($http, $q, $rootScope, $location, localStorage) {
                var _this = this;
                this.$http = $http;
                this.$q = $q;
                this.localStorage = localStorage;
                this.authenticationChangedEvent = new FinancialApp.Delegate();

                this.authInfo = this.checkAuthentication();

                $rootScope.$on("$locationChangeStart", function (ev, newLocation) {
                    if (!_this.authInfo.isAuthenticated && newLocation.indexOf('/auth/login') === -1) {
                        ev.preventDefault();
                    }
                });

                if (!this.authInfo.isAuthenticated) {
                    $location.path("/auth/login");
                }
            }
            AuthenticationService.prototype.addAuthenticationChange = function (invokable) {
                this.authenticationChangedEvent.addListener(invokable);
            };

            AuthenticationService.prototype.removeAuthenticationChange = function (invokable) {
                this.authenticationChangedEvent.removeListener(invokable);
            };

            AuthenticationService.prototype.isAuthenticated = function () {
                return this.authInfo.isAuthenticated;
            };

            AuthenticationService.prototype.logOff = function () {
                var _this = this;
                var ret = this.$q.defer();

                this.$http.post("/api/authentication/logoff", {}).success(function (data) {
                    _this.authInfo = data;
                    _this.raiseAuthenticationEvent();

                    ret.resolve(null);
                }).error(function (data) {
                    return ret.reject(data);
                });

                return ret.promise;
            };

            AuthenticationService.prototype.raiseAuthenticationEvent = function () {
                this.authenticationChangedEvent.invoke(function (f) {
                    f();
                    return true;
                });
            };

            AuthenticationService.prototype.authenticate = function (userName, password, persistent) {
                var _this = this;
                var ret = this.$q.defer();

                var postData = {
                    userName: userName,
                    password: password,
                    persistent: persistent
                };

                this.$http.post("/api/authentication/login", postData).success(function (data) {
                    _this.authInfo = data;
                    _this.raiseAuthenticationEvent();

                    ret.resolve(null);
                }).error(function (data, status) {
                    return ret.reject(data);
                });

                return ret.promise;
            };

            AuthenticationService.prototype.checkAuthentication = function () {
                var _this = this;
                console.info("AuthenticationService: Checking authentication");

                this.$http.get("/api/authentication/check").success(function (info) {
                    console.log("AuthenticationService: Authentication information received");

                    _this.setAuthInfo(info);
                    _this.isCheckingAuthentication = false;
                    _this.raiseAuthenticationEvent();
                });

                this.isCheckingAuthentication = true;

                return this.getAuthInfo();
            };

            AuthenticationService.prototype.setAuthInfo = function (obj) {
                if (obj) {
                    this.localStorage.setItem("AuthenticationInfo", angular.toJson(obj));
                } else {
                    this.localStorage.removeItem("AuthenticationInfo");
                }

                this.authInfo = obj;
            };

            AuthenticationService.prototype.getAuthInfo = function () {
                var authInfo = this.localStorage.getItem("AuthenticationInfo");

                if (!authInfo) {
                    return new AuthenticationInfo(false, 0, "");
                }

                return angular.fromJson(authInfo);
            };
            AuthenticationService.$inject = ["$http", "$q", "$rootScope", "$location", "localStorage"];
            return AuthenticationService;
        })();
        Services.AuthenticationService = AuthenticationService;
    })(FinancialApp.Services || (FinancialApp.Services = {}));
    var Services = FinancialApp.Services;
})(FinancialApp || (FinancialApp = {}));
/// <init-options route="/auth/login" />
/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../Services/AuthenticationService.ts"/>
var FinancialApp;
(function (FinancialApp) {
    'use strict';

    var AuthLoginController = (function () {
        function AuthLoginController($scope, $location, authentication) {
            var _this = this;
            this.$scope = $scope;
            this.$location = $location;
            this.authentication = authentication;
            if (authentication.isAuthenticated()) {
                console.info("AuthLoginController: Already authenticated. Redirecting.");
                this.$location.path("/auth/success");
                return;
            }

            $scope.login = function () {
                return _this.onLogin();
            };
            $scope.isBusy = false;

            $scope.isBusy = authentication.isCheckingAuthentication;
            authentication.addAuthenticationChange(function () {
                $scope.isBusy = false;

                if (authentication.isAuthenticated()) {
                    console.info("AuthLoginController: Has authenticated. Redirecting.");
                    _this.$location.path("/auth/success");
                }
            });
        }
        AuthLoginController.prototype.onLogin = function () {
            var _this = this;
            this.$scope.isBusy = true;
            this.$scope.errorMessage = null;

            this.authentication.authenticate(this.$scope.userName, this.$scope.password, this.$scope.rememberMe).then(function () {
                // handled by authorization control
            }, function () {
                _this.$scope.errorMessage = "Inloggen mislukt. Controleer je gebruikersnaam of wachtwoord.";
            })['finally'](function () {
                _this.$scope.isBusy = false;
            });
        };
        AuthLoginController.$inject = ["$scope", "$location", "authentication"];
        return AuthLoginController;
    })();
    FinancialApp.AuthLoginController = AuthLoginController;
})(FinancialApp || (FinancialApp = {}));
/// <init-options route="/auth/logoff"/>
/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../Services/AuthenticationService.ts"/>
var FinancialApp;
(function (FinancialApp) {
    var AuthLogOffController = (function () {
        function AuthLogOffController($scope, $location, authentication) {
            var _this = this;
            this.$scope = $scope;
            this.$location = $location;
            this.authentication = authentication;
            if (!authentication.isAuthenticated()) {
                this.redirect();
                return;
            }

            $scope.confirm = function () {
                return _this.confirmLogOff();
            };
        }
        AuthLogOffController.prototype.confirmLogOff = function () {
            var _this = this;
            this.$scope.isBusy = true;
            this.authentication.logOff().then(function () {
                return _this.redirect();
            }, function () {
                return alert('Kon niet uitloggen.');
            });
        };

        AuthLogOffController.prototype.redirect = function () {
            this.$location.path("/auth/login");
        };
        AuthLogOffController.$inject = ["$scope", "$location", "authentication"];
        return AuthLogOffController;
    })();
    FinancialApp.AuthLogOffController = AuthLogOffController;
})(FinancialApp || (FinancialApp = {}));
/// <init-options route="/manage/category/add" viewName="CategoryEdit" />
/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../DTO.generated.d.ts"/>
/// <reference path="../Common.ts"/>
var FinancialApp;
(function (FinancialApp) {
    'use strict';

    var CategoryCreateController = (function () {
        function CategoryCreateController($scope, $location, categoryResource) {
            var _this = this;
            this.api = categoryResource;
            $scope.save = function () {
                return _this.api.save($scope.category, function () {
                    return $location.path("/manage/category");
                });
            };
        }
        CategoryCreateController.$inject = ["$scope", "$location", "categoryResource"];
        return CategoryCreateController;
    })();
    FinancialApp.CategoryCreateController = CategoryCreateController;
})(FinancialApp || (FinancialApp = {}));
/// <init-options route="/manage/category/edit/:id" />
/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../DTO.generated.d.ts" />
/// <reference path="../Common.ts"/>
var FinancialApp;
(function (FinancialApp) {
    'use strict';

    var CategoryEditController = (function () {
        function CategoryEditController($scope, $routeParams, $location, categoryResource) {
            var _this = this;
            this.api = categoryResource;

            $scope.category = this.api.get({ id: $routeParams.id }, function () {
            }, function () {
                return $location.path("/manage/category");
            });
            $scope.save = function () {
                return _this.api.update({ id: $routeParams.id }, $scope.category, function () {
                    return $location.path("/manage/category");
                });
            };
        }
        CategoryEditController.$inject = ["$scope", "$routeParams", "$location", "categoryResource"];
        return CategoryEditController;
    })();
    FinancialApp.CategoryEditController = CategoryEditController;
})(FinancialApp || (FinancialApp = {}));
/// <init-options route="/manage/category"/>
/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../DTO.generated.d.ts"/>
/// <reference path="../Common.ts"/>
var FinancialApp;
(function (FinancialApp) {
    'use strict';

    var CategoryListController = (function () {
        function CategoryListController($scope, categoryResource) {
            var _this = this;
            this.api = categoryResource;

            $scope.categories = this.api.query(function () {
                $scope.isLoaded = true;
            });

            $scope.deleteCategory = function (cat) {
                if (cat.canBeDeleted === true) {
                    $scope.isLoaded = false;
                    _this.api['delete']({ id: cat.id }, function () {
                        $scope.isLoaded = true;
                        $scope.categories.remove(cat);
                    });
                }
            };
        }
        CategoryListController.$inject = ["$scope", "categoryResource"];
        return CategoryListController;
    })();
    FinancialApp.CategoryListController = CategoryListController;
})(FinancialApp || (FinancialApp = {}));
/// <init-options exclude="route"/>
/// <reference path="../Services/AuthenticationService.ts"/>
/// <reference path="../../typings/angularjs/angular.d.ts"/>
var FinancialApp;
(function (FinancialApp) {
    'use strict';

    var MasterController = (function () {
        function MasterController($scope, authentication) {
            var _this = this;
            this.authentication = authentication;

            MasterController.setAuthenticationInfo($scope, this.authentication.isAuthenticated());

            this.authentication.addAuthenticationChange(function () {
                return MasterController.setAuthenticationInfo($scope, _this.authentication.isAuthenticated());
            });
        }
        MasterController.setAuthenticationInfo = function ($scope, isAuthenticated) {
            $scope.isMenuVisible = isAuthenticated;
            $scope.isAuthenticated = isAuthenticated;
        };
        MasterController.$inject = ["$scope", "authentication"];
        return MasterController;
    })();
    FinancialApp.MasterController = MasterController;
})(FinancialApp || (FinancialApp = {}));
/// <init-options exclude="route"/>
/// <reference path="../../typings/angularjs/angular.d.ts"/>
/// <reference path="../Services/AuthenticationService.ts"/>
var FinancialApp;
(function (FinancialApp) {
    'use strict';

    var MenuController = (function () {
        function MenuController($scope, $location) {
            $scope.currentPath = $location.path();
            $scope.nowPath = FinancialApp.Program.createNowRoute();
            $scope.extendMenuVisible = false;

            $scope.hasPath = function (str) {
                return str == this.currentPath;
            };

            $scope.$on("$locationChangeSuccess", function () {
                $scope.currentPath = $location.path();
            });

            $scope.toggleNavBar = function () {
                return $scope.extendMenuVisible = !$scope.extendMenuVisible;
            };
        }
        MenuController.$inject = ["$scope", "$location"];
        return MenuController;
    })();
    FinancialApp.MenuController = MenuController;
})(FinancialApp || (FinancialApp = {}));
/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../Common.ts"/>
var FinancialApp;
(function (FinancialApp) {
    (function (Factories) {
        // ReSharper disable once InconsistentNaming
        function LocalStorageFactory() {
            var fact = function ($window) {
                return $window.localStorage;
            };
            return fact.withInject("$window");
        }
        Factories.LocalStorageFactory = LocalStorageFactory;
    })(FinancialApp.Factories || (FinancialApp.Factories = {}));
    var Factories = FinancialApp.Factories;
})(FinancialApp || (FinancialApp = {}));
/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../../typings/moment/moment.d.ts" />
var FinancialApp;
(function (FinancialApp) {
    (function (Directives) {
        'use strict';

        angular.module('ngMoment', []).filter("moment", function () {
            return function (input, format) {
                return moment(input).format(format);
            };
        });
    })(FinancialApp.Directives || (FinancialApp.Directives = {}));
    var Directives = FinancialApp.Directives;
})(FinancialApp || (FinancialApp = {}));
/// <init-options route="/sheet/:year/:month"/>
var FinancialApp;
(function (FinancialApp) {
    'use strict';

    var SheetController = (function () {
        function SheetController($scope, $routeParams, $location) {
            $scope.date = moment([parseInt($routeParams.year, 10), parseInt($routeParams.month, 10) - 1]);

            // bail out if invalid date is provided
            if (!$scope.date.isValid()) {
                $location.path("/archive");
            }
        }
        SheetController.$inject = ["$scope", "$routeParams", "$location"];
        return SheetController;
    })();
    FinancialApp.SheetController = SheetController;
})(FinancialApp || (FinancialApp = {}));
/// <init-options route="/"/>
var FinancialApp;
(function (FinancialApp) {
    'use strict';

    var DefaultController = (function () {
        function DefaultController() {
        }
        DefaultController.$inject = [];
        return DefaultController;
    })();
    FinancialApp.DefaultController = DefaultController;
})(FinancialApp || (FinancialApp = {}));
//# sourceMappingURL=App.js.map
