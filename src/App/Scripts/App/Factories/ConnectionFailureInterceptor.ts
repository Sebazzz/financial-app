module FinancialApp.Factories {
    var maxRetryCount = 1;
    var piper: ConnectionPiper;

    /**
     * Once connection failures occurs we want to deal with connection failures one at a time. The rest of the connection failures
     * will be queued and later resolved. This simplifies the code a great deal, especially considering user input can be requested
     * for once connection at a time.
     */
    class ConnectionPiper {
        private static nextId = 0;

        private currentConnectionId: number = null;
        private connectionQueue = new Queue<{ deferred: ng.IDeferred<ng.IRequestConfig>; requestConfig: ng.IRequestConfig }>();

        constructor(private $q: ng.IQService, private $injector: ng.auto.IInjectorService) {}

        public isActiveConnection(requestConfig: ng.IRequestConfig) {
            return ConnectionPiper.getId(requestConfig) === this.currentConnectionId;
        }

        public completeActiveConnection(requestConfig: ng.IRequestConfig) {
            this.continueWithNextConnection(requestConfig);
        }

        public failActiveConnection(requestConfig: ng.IRequestConfig) {
            this.continueWithNextConnection(requestConfig);
        }

        private continueWithNextConnection(requestConfig : ng.IRequestConfig) {
            if (this.currentConnectionId !== ConnectionPiper.getId(requestConfig)) {
                throw new Error(`ConnectionPiper ID mismatch: ${this.currentConnectionId} vs ${ConnectionPiper.getId(requestConfig)}`);
            }

            console.log("ConnectionPiper: Finalizing active connection#%d with url '%s'", this.currentConnectionId, requestConfig.url);
            this.currentConnectionId = null;

            var nextConnection = this.connectionQueue.dequeue();
            if (nextConnection) {
                console.log("ConnectionPiper: Dequeuing new connection#%d with url '%s'", ConnectionPiper.getId(nextConnection.requestConfig), nextConnection.requestConfig.url);
                
                nextConnection.deferred.resolve(nextConnection.requestConfig);
            }
        }

        public hasActiveConnection() : boolean {
            return this.currentConnectionId !== null;
        }

        public pipeConnection(httpPromiseCallbackArg: ng.IHttpPromiseCallbackArg<any>): ng.IPromise<void> {
            var deferred = this.$q.defer<ng.IRequestConfig>(),
                config = httpPromiseCallbackArg.config;

            console.log("ConnectionPiper: Enqueuing new connection with url '%s'", config.url);
            this.connectionQueue.enqueue({
                deferred: deferred,
                requestConfig: config
            });
            ConnectionPiper.getId(config);

            return deferred.promise.then((conf) => {
                console.log("ConnectionPiper: Completing new connection with url '%s'", conf.url);
                var $http = this.$injector.get('$http');

                this.setActiveConnection(conf);

                return $http(conf);
            });
        }

        public setActiveConnection(requestConfig: ng.IRequestConfig) {
            if (this.hasActiveConnection() && ConnectionPiper.getId(requestConfig) !== this.currentConnectionId) {
                throw new Error(`ConnectionPiper: Connection with ID ${this.currentConnectionId} still active.`);
            }

            console.log("ConnectionPiper: Setting active connection with url '%s'", requestConfig.url);
            this.currentConnectionId = ConnectionPiper.getId(requestConfig);
        }

        private static getId(requestConfig: ng.IRequestConfig) {
            return <number>requestConfig['ConnectionPiper-Id'] || (requestConfig['ConnectionPiper-Id'] = ++ConnectionPiper.nextId);
        }
    }

    function checkResponseForConnectionFailure(response: ng.IHttpPromiseCallbackArg<any>) {
        // In Microsoft Edge at least, the status will be zero
        // and the statusText is empty on connection failure
        var isConnectionFailure = response.status === 0 || !response.statusText;

        // Also offer to retry server errors
        isConnectionFailure = isConnectionFailure || response.status === 500;

        return isConnectionFailure;
    }

    // ReSharper disable InconsistentNaming
    export function ConnectionFailureRetryInterceptor() {
        var func = ($q: ng.IQService, $injector: ng.auto.IInjectorService) => {
            piper = piper || new ConnectionPiper($q, $injector);

            return {
                response: (response: ng.IHttpPromiseCallbackArg<any>) => {
                    var connectionFailureCount = +response.config['connectionFailureCount'];

                    if (connectionFailureCount > 0 && piper.isActiveConnection(response.config)) {
                        console.log('ConnectionFailureRetryInterceptor: Connection retry succeeded.');
                        piper.completeActiveConnection(response.config);

                        (<any>$('#connection-failure-retry-dialog')).modal('hide');
                    }

                    return response;
                },
                responseError: (response: ng.IHttpPromiseCallbackArg<any>) => {
                    // In Microsoft Edge at least, the status will be zero
                    // and the statusText is empty on connection failure
                    var isConnectionFailure = checkResponseForConnectionFailure(response);
                    var connectionFailureCount = (+response.config['connectionFailureCount']) || 0;

                    if (!isConnectionFailure) {
                        return $q.reject(response);
                    }
                    
                    if (!piper.isActiveConnection(response.config) && piper.hasActiveConnection()) {
                        console.log("ConnectionFailureRetryInterceptor: Queuing failed connection for later processing...");
                        return piper.pipeConnection(response);
                    }

                    if (connectionFailureCount < maxRetryCount) {
                        console.log("ConnectionFailureRetryInterceptor: Retrying failed connection...");

                        var $http = $injector.get('$http');
                        var deferred = $q.defer();

                        window.setTimeout(() => deferred.resolve(), 500);
                        var config = $.extend(response.config, {
                            connectionFailureCount: (connectionFailureCount || 0) + 1
                        });

                        $('#connection-failure-retry-dialog').find('.progress-bar').width('50%');
                        (<any>$('#connection-failure-retry-dialog')).modal('show');

                        piper.setActiveConnection(response.config);

                        return deferred.promise.then(() => {
                            $('#connection-failure-retry-dialog').find('.progress-bar').width('100%');
                            console.log('ConnectionFailureRetryInterceptor: Continue retrying connection...');
                            return $http(config);
                        });
                    }

                    if (connectionFailureCount === maxRetryCount) {
                        console.log('ConnectionFailureRetryInterceptor: Connection failure. Retry failed. Going to pass through...');

                        // We wait for the dialog to hide, so we can pass it on to the ConnectionFailureInterceptor
                        var hideDeferred = $q.defer();

                        $('#connection-failure-retry-dialog').one('hidden.bs.modal', () => {
                            console.log('ConnectionFailureRetryInterceptor: Connection failure. Retry failed. Passing through...');

                            hideDeferred.resolve();
                        });

                        (<any>$('#connection-failure-retry-dialog')).modal('hide');

                        return hideDeferred.promise.then(() => $q.reject(response));
                    }

                    return $q.reject(response);
                }
            }
        };

        return func.withInject("$q", "$injector");
    }

    export function ConnectionFailureInterceptor() {
        var func = ($q: ng.IQService, $injector: ng.auto.IInjectorService) => {
            piper = piper || new ConnectionPiper($q, $injector);

            return {
                responseError: (response: ng.IHttpPromiseCallbackArg<any>) => {
                    var isConnectionFailure = checkResponseForConnectionFailure(response);

                    if (!isConnectionFailure) {
                        return $q.reject(response);
                    }

                    var connectionFailureCount = (+response.config['connectionFailureCount']) || 0;
                    if (!piper.hasActiveConnection() || !(connectionFailureCount >= maxRetryCount)) {
                        console.log('ConnectionFailureInterceptor: Connection was cancelled. Rejecting.');
                        return $q.reject(response);
                    }

                    if (connectionFailureCount >= maxRetryCount) {
                        var $http = $injector.get('$http');
                        var deferred = $q.defer();
                        var isRetrying = false;

                        (<any>$('#connection-failure-dialog')).modal('show');

                        $('#connection-failure-dialog').find('.btn-retry').bind('click.retry', (e) => {
                            isRetrying = true;
                            (<any>$('#connection-failure-dialog')).modal('hide');
                        });

                        $('#connection-failure-dialog').one('hidden.bs.modal', (e) => {
                            $('#connection-failure-dialog').find('.btn-retry').unbind('click.retry');

                            if (isRetrying) {
                                deferred.resolve();
                            } else {
                                deferred.reject();
                            }
                        });

                        var config = $.extend(response.config, {
                            connectionFailureCount: (connectionFailureCount || 0) + 1
                        });

                        return deferred.promise.then(() => {
                            console.log('Connection failure. Retrying connection on request of user...');

                            return $http(config);
                        }, () => {
                            piper.failActiveConnection(response.config);
                            return $q.reject(response);
                        });
                    }

                    return $q.reject(response);
                }
            }
        };

        return func.withInject("$q", "$injector");
    }
}