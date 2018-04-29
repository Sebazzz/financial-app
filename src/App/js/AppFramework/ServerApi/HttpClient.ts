import * as $ from 'jquery';

interface IRequestFormat {
    dataType: string;
    contentType: string | undefined | false;
}

const jsonRequest: IRequestFormat = {
    dataType: 'json',
    contentType: 'application/json'
};
const textRequest: IRequestFormat = {
    dataType: 'text',
    contentType: undefined
};
const interceptors: IHttpInterceptor[] = [];

export type RequestHandler<T> = (promise: Promise<T>) => void;

export interface IHttpInterceptor {
    interceptRequest<T>(request: JQuery.AjaxSettings): RequestHandler<T> | null;
}

export default class HttpClient {
    public static registerInterceptor(interceptor: IHttpInterceptor) {
        interceptors.push(interceptor);
    }

    public static create() {
        return new HttpClient();
    }

    public get<T>(url: string, data: any = null): Promise<T> {
        return this.method(url, 'GET', data);
    }

    public getText(url: string, data: any = null): Promise<string> {
        return this.method(url, 'GET', data, textRequest);
    }

    public put<T>(url: string, data: any = null): Promise<T> {
        return this.method(url, 'PUT', data);
    }

    public post<T>(url: string, data: any = null): Promise<T> {
        return this.method(url, 'POST', data);
    }

    public delete<T>(url: string, data: any = null): Promise<T> {
        return this.method(url, 'DELETE', data);
    }

    private method<T>(url: string, method: string, data: any, requestFormat: IRequestFormat = jsonRequest): Promise<T> {
        let convertData = () => JSON.stringify(data);

        if (method === 'GET') {
            convertData = () => $.param(data);
        }

        const ajaxOptions: JQuery.AjaxSettings = {
            url,
            contentType: requestFormat.contentType,
            data: data === null ? data : convertData(),
            dataType: requestFormat.dataType,
            method
        };

        const requestHandlers: Array<RequestHandler<T>> = [];
        for (const interceptor of interceptors) {
            const handler = interceptor.interceptRequest(ajaxOptions);
            if (handler) {
                requestHandlers.push(handler);
            }
        }

        const promise = $.ajax(ajaxOptions);
        for (const requestHandler of requestHandlers) {
            requestHandler(promise);
        }

        return promise;
    }
}
