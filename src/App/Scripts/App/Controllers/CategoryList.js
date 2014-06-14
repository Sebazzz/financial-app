/// <init-options route="/manage/category"/>
/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../DTO.generated.ts"/>
var FinancialApp;
(function (FinancialApp) {
    var CategoryListController = (function () {
        function CategoryListController($scope, categoryResource) {
            this.api = categoryResource;

            $scope.categories = this.api.query(function () {
                $scope.isLoaded = true;
            });
        }
        CategoryListController.$inject = ["$scope", "categoryResource"];
        return CategoryListController;
    })();
    FinancialApp.CategoryListController = CategoryListController;
})(FinancialApp || (FinancialApp = {}));
//# sourceMappingURL=CategoryList.js.map
