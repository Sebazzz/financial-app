export interface IServiceWorkerMethod<TData> {
    method: string;
    data?: TData;
}

class ServiceWorkerMethod<T = never> implements IServiceWorkerMethod<T> {
    constructor(public method: string, public data?: T) {}

    public toString() {
        if (this.data) {
            return `${this.method}: ${this.data}`;
        }

        return this.method;
    }
}

export class ServiceWorkerMessaging {
    public static invokeMethod<TData, TResult>(method: string, data: TData): Promise<TResult> {
        const invocation = new ServiceWorkerMethod(method, data);

        return this.sendMessageAsync(invocation);
    }

    public static invokeParameterlessMethod<TResult>(method: string): Promise<TResult> {
        const invocation = new ServiceWorkerMethod(method);

        return this.sendMessageAsync(invocation);
    }

    public static sendMessageAsync<TResult, TMessage extends {}>(message: TMessage): Promise<TResult> {
        return new Promise((resolve, reject) => {
            const messageString = (message && message.toString()) || JSON.stringify(message);

            console.info('[ServiceWorkerMessaging] Sending message %s', messageString);

            const messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event: MessageEvent) => {
                if (event.data && event.data.error) {
                    console.error(
                        '[ServiceWorkerMessaging] Message %s -> Response error [%s]',
                        messageString,
                        event.data.error
                    );

                    reject(event.data.error);
                } else {
                    console.log('[ServiceWorkerMessaging] Message %s -> Response [%s]', messageString, event.data);

                    // This can be null or undefined
                    resolve(event.data as TResult);
                }
            };

            const sw = navigator.serviceWorker;
            if (sw && sw.controller) {
                sw.controller.postMessage(message, [messageChannel.port2]);
            }
        });
    }
}

export default class ServiceWorkerMethods {
    public static versionQuery() {
        return ServiceWorkerMessaging.invokeParameterlessMethod<string>('versionQuery');
    }

    public static buildTypeQuery() {
        return ServiceWorkerMessaging.invokeParameterlessMethod<string>('buildTypeQuery');
    }
}
