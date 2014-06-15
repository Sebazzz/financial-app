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
//# sourceMappingURL=CategoryCreate.js.map
