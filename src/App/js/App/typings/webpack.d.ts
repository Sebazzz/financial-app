declare var module: webpack.Module;

declare namespace webpack {
    interface Module {
        loaded: boolean;
        id: string;
        DEBUG: boolean;
    }

    export type IRequireCallback = (require: IRequire) => void;

    interface IRequire {
        /**
         * Import the specified asset
         */
        <T = any>(input: string): T;

        /*
         * Import the specified asset lazily
         */
        ensure(
            dependencies: string[] | string,
            callback: IRequireCallback,
            error: IRequireCallback,
            chunkName: string
        ): void;
    }
}

/**
 * Import the specified asset
 */
declare var require: webpack.IRequire;

/**
 * Declares a global variable to execute module-specific code
 */
declare var DEBUG: boolean;
