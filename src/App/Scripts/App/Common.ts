module FinancialApp {
    export interface IIdRouteParams extends ng.route.IRouteParamsService {
        id: string;
    }

    export interface IAction {
        () : void;
    }

    Function.prototype.withInject = function(...$inject : string[]) {
        this.$inject = $inject;

        return this;
    };
}

interface Function {
    withInject(...$inject: string[]): any;
};