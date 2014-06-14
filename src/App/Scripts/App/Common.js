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
//# sourceMappingURL=Common.js.map
