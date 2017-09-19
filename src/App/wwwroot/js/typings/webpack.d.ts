declare var module: webpack.Module;

declare namespace webpack {
    interface Module {
        loaded:boolean;
        id : string;
        DEBUG : boolean;
    }
}

/**
 * Import the specified asset
 */
declare function require<T=any>(input : string) : T;