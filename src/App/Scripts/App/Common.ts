module FinancialApp {
    export interface IIdRouteParams extends ng.route.IRouteParamsService {
        id: string;
    }

    export interface IAction {
        () : void;
    }

    export interface IAction1<T> {
        (object : T): void;
    }

    Function.prototype.withInject = function(...$inject : string[]) {
        this.$inject = $inject;

        return this;
    };

    Array.prototype.remove = function(object: any) {
        var cnt = this.length;
        for (var i = 0; i < cnt; i++) {
            if (object === this[i]) {
                this.splice(i, 1);
                return true;
            }
        }

        return false;
    };
}

interface Function {
    withInject(...$inject: string[]): any;
};

interface Array<T> {
    remove(object : any) : boolean;
}