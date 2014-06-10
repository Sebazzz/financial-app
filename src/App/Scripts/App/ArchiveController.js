var FinancialApp;
(function (FinancialApp) {
    var ArchiveController = (function () {
        function ArchiveController($scope) {
            $scope.test = "Hello World 2";

            $scope.helloFn = function () {
                this.test += "Bye World 2";
            };
        }
        ArchiveController.$inject = ["$scope"];
        return ArchiveController;
    })();
    FinancialApp.ArchiveController = ArchiveController;
})(FinancialApp || (FinancialApp = {}));
//# sourceMappingURL=ArchiveController.js.map
