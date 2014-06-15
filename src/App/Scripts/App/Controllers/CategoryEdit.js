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
//# sourceMappingURL=CategoryEdit.js.map
