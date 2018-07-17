declare module 'serviceworker-webpack-plugin/lib/runtime' {
    export interface ServiceWorkerRuntime {
        register(options?: RegistrationOptions): Promise<ServiceWorkerRegistration>; // May actually return false if (!navigator.serviceWorker) === true
    }

    const runtime: ServiceWorkerRuntime;

    export default runtime;
}
