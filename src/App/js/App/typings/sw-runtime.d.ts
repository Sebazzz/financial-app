declare module 'serviceworker-webpack-plugin/lib/runtime' {
    export interface ServiceWorkerRuntime {
        register(options?:RegistrationOptions):void;
    }

    const runtime: ServiceWorkerRuntime;

    export default runtime;
}