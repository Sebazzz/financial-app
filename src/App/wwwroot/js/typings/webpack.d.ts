declare var module: webpack.Module;

declare namespace webpack {
    interface Module {
        loaded:boolean;
        id : string;
        DEBUG : boolean;
    }
}

declare function require(input : string) : any;