import HttpClient from './HttpClient';

export default class ApiBase {
    protected httpClient = HttpClient.create();
}