declare namespace webpack {
    interface Module {
        /**
         * If available, accesses the hot module replacement runtime
         */
        hot?: hmr.IHotModule;
    }
}

/**
 * https://webpack.js.org/concepts/hot-module-replacement/
 */
declare namespace webpack.hmr {
    type ModuleDependencies = Array<string> | string;

    type OutdatedModules = Array<string>;

    type ModuleDisposeHandler = (data: any) => void;

    type HotModuleStatus = 'idle' | 'check' | 'prepare' | 'ready' | 'dispose' | 'apply' | 'abort' | 'fail';

    type ApplyNotifier = (info: ApplyInfo) => void;

    type StatusHandler = (status: HotModuleStatus) => void;

    interface ApplyInfo {
        type:
            | 'self-declined'
            | 'declined'
            | 'unaccepted'
            | 'accepted'
            | 'disposed'
            | 'accept-errored'
            | 'self-accept-errored'
            | 'self-accept-error-handler-errored';

        moduleId: number;
        dependencyId: number;
        chain: number[];
        parentId: number;
        outdatedModules: number[];
        outdatedDependencies: number[][];
        error?: Error;
        originalError?: Error;
    }

    interface ApplyOptions {
        ignoreUnaccepted?: boolean;
        ignoreDeclined?: boolean;
        ignoreErrored?: boolean;

        onDeclined?: ApplyNotifier;
        onUnaccepted?: ApplyNotifier;
        onAccepted?: ApplyNotifier;
        onDisposed?: ApplyNotifier;
        onErrored?: ApplyNotifier;
    }

    interface IHotModule {
        /**
         *
         */
        data?: any;

        accept(dependencies?: ModuleDependencies, callback?: Function): void;
        accept(callback?: Function): void;
        decline(dependencies: ModuleDependencies): void;

        /**
         * Add a handler which is executed when the current module code is replaced. This should be used to remove any persistent resource you have claimed or created. If you want to transfer state to the updated module, add it to given data parameter. This object will be available at module.hot.data after the update.
         */
        dispose(disposeHandler: ModuleDisposeHandler): void;

        /**
         * Add a handler which is executed when the current module code is replaced. This should be used to remove any persistent resource you have claimed or created. If you want to transfer state to the updated module, add it to given data parameter. This object will be available at module.hot.data after the update.
         */
        addDisposeHandler(disposeHandler: ModuleDisposeHandler): void;

        /**
         * Remove the callback added via dispose or addDisposeHandler.
         */
        removeDisposeHandler(disposeHandler: ModuleDisposeHandler): void;

        /**
         * Retrieve the current status of the hot module replacement process.
         */
        status(): HotModuleStatus;

        /**
         * Test all loaded modules for updates and, if updates exist, apply them.
         * @param autoApply The autoApply parameter can either be a boolean or options to pass to the apply method when called.
         * @returns {}
         */
        check(autoApply: boolean): Promise<ModuleDependencies>;

        /**
         * Continue the update process (as long as module.hot.status() === 'ready').
         */
        apply(options?: ApplyOptions): Promise<ModuleDependencies>;

        /**
         * Register a function to listen for changes in status.
         */
        addStatusHandler(handler: StatusHandler): void;

        /**
         * Remove a registered status handler.
         */
        removeStatusHandler(handler: StatusHandler): void;
    }
}
