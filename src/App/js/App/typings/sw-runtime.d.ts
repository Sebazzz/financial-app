declare module 'serviceworker-webpack-plugin/lib/runtime' {
    export interface ServiceWorkerRuntime {
        register():void;
    }

    const runtime: ServiceWorkerRuntime;

    export default runtime;
}