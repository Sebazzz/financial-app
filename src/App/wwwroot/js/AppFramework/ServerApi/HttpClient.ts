import * as $ from 'jquery';

export default class HttpClient {
    public static create() {
        return new HttpClient();
    }

    public get<T>(url: string, data: any = null) : Promise<T> {
        return $.getJSON(url, data);
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

    private method<T>(url: string, method: string, data: any): Promise<T> {
        return $.ajax({
            url: url,
            contentType: 'application/json',
            data: data === null ? data : JSON.stringify(data),
            dataType: 'json',
            method: method
        });
    }
}