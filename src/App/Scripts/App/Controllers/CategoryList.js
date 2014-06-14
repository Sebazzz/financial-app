/// <init-options route="/manage/category"/>
/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../DTO.generated.ts"/>
/// <reference path="../Common.ts"/>
var FinancialApp;
(function (FinancialApp) {
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
                    _this.api.delete({ id: cat.id }, function () {
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
//# sourceMappingURL=CategoryList.js.map
