var FinancialApp;
(function (FinancialApp) {
    Function.prototype.withInject = function () {
        var $inject = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            $inject[_i] = arguments[_i + 0];
        }
        this.$inject = $inject;

        return this;
    };
})(FinancialApp || (FinancialApp = {}));

;
//# sourceMappingURL=Common.js.map
