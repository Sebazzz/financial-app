 module FinancialApp {
    export class ArchiveController {
        static $inject = ["$scope"];

        constructor($scope) {
            $scope.test = "Hello World 2";

            $scope.helloFn = function () {
                this.test += "Bye World 2";
            };
        }
    }
 }