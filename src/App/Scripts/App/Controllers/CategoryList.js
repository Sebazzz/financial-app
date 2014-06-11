/// <init-options route="/manage/category"/>
/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../DTO.ts"/>
var FinancialApp;
(function (FinancialApp) {
    var CategoryListController = (function () {
        function CategoryListController($scope, $resource) {
            this.api = $resource("/api/category/:id");

            $scope.categories = this.api.query(function () {
                $scope.isLoaded = true;
            });
        }
        CategoryListController.$inject = ["$scope", "$resource"];
        return CategoryListController;
    })();
    FinancialApp.CategoryListController = CategoryListController;
})(FinancialApp || (FinancialApp = {}));
//# sourceMappingURL=CategoryList.js.map
