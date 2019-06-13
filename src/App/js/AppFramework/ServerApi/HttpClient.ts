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

export type RequestHandler<T> = (promise: Promise<Response>) => void;

export interface IHttpInterceptor {
    interceptRequest<T>(request: Request): RequestHandler<T> | null;
}

export class HttpError extends Error {
    constructor(public response: Response) {
        super();
    }

    public toString() {
        return `[HttpError] ${this.response.status} ${this.response.statusText}`;
    }
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

    private async method<T>(
        url: string,
        method: string,
        data: any,
        requestFormat: IRequestFormat = jsonRequest
    ): Promise<T> {
        // Prepare request
        let convertData = () => JSON.stringify(data);

        if (method === 'GET') {
            convertData = () => $.param(data);
        }

        const ajaxOptions: Request = new Request(url, {
            body: data === null ? data : convertData(),
            method
        });

        if (requestFormat.contentType) {
            ajaxOptions.headers.set('Content-Type', requestFormat.contentType);
        }

        // Append interceptors
        const requestHandlers: Array<RequestHandler<T>> = [];
        for (const interceptor of interceptors) {
            const handler = interceptor.interceptRequest(ajaxOptions);
            if (handler) {
                requestHandlers.push(handler);
            }
        }

        const promise = fetch(ajaxOptions);
        for (const requestHandler of requestHandlers) {
            requestHandler(promise);
        }

        // Response handling
        const response = await promise;

        if (response.status >= 400) {
            throw new HttpError(response);
        }

        return await response.json();
    }
}
