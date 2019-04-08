import AppContext from '../AppContext';
import * as ko from 'knockout';
import * as $ from 'jquery';
import { default as HttpClient, IHttpInterceptor } from '../ServerApi/HttpClient';

const settings = {
    completionTimeOut: 500,
    autoIncrement: true,
    startSize: 0.02,
    latencyThreshold: 100
};

class LoadingBarComponentModel implements IHttpInterceptor, ko.components.ViewModel {
    private $element: JQuery<Element>;
    private status = 0;
    private increaseTimeoutHandle: number = 0;
    private completeTimeoutHandle: number = 0;

    private requestCounters = {
        totalRequests: 0,
        completedRequests: 0
    };
    private startAnimationHandle: number = 0;

    public widthPercentageString = ko.observable<string>('0%');
    public show = ko.observable<boolean>(false);

    constructor(private appContext: AppContext, element: Element) {
        element.classList.add('progress-indicator');
        this.$element = $(element).children('.progress-indicator-bar');

        this.requestCompleted = this.requestCompleted.bind(this);

        console.log('LoadingBar started [%s]', this.appContext.title);
    }

    public dispose() {
        // STFU tsc
    }

    public interceptRequest() {
        return (promise: Promise<any>) => {
            const counters = this.requestCounters;

            if (counters.totalRequests === 0) {
                this.startAnimationHandle = window.setTimeout(() => {
                    this.start();
                }, settings.latencyThreshold);
            }

            counters.totalRequests++;
            this.set(counters.completedRequests / counters.totalRequests);

            promise.then(this.requestCompleted, this.requestCompleted);
        };
    }

    private requestCompleted() {
        const counters = this.requestCounters;

        counters.completedRequests++;
        if (counters.completedRequests >= counters.totalRequests) {
            this.setComplete();
        } else {
            this.set(counters.completedRequests / counters.totalRequests);
        }
    }

    private setComplete() {
        const counters = this.requestCounters;
        counters.totalRequests = 0;
        counters.completedRequests = 0;

        window.clearTimeout(this.startAnimationHandle);
        this.completeAll();
    }

    private start() {
        window.clearTimeout(this.completeTimeoutHandle);

        if (this.show.peek()) {
            return;
        }

        this.show(true);
        this.set(settings.startSize);
    }

    private completeAll() {
        this.set(1);
        window.clearTimeout(this.completeTimeoutHandle);

        // A request may still start in the mean time
        this.completeTimeoutHandle = window.setTimeout(() => {
            // Let jquery complete the animation
            const queue = this.$element.queue();
            if (queue.length > 0) {
                this.$element.queue(() => {
                    this.completeAnimation();
                });
            } else {
                this.completeAnimation();
            }
        }, settings.completionTimeOut);
    }

    private completeAnimation() {
        this.status = 0;
        this.show(false);
        this.$element.finish();
    }

    /**
     * Increments the loading bar by a random amount
     * but slows down as it progresses
     */
    private increase() {
        if (this.status >= 1) {
            return;
        }

        let rnd = 0;

        const stat = this.status;
        if (stat >= 0 && stat < 0.25) {
            // Start out between 3 - 6% increments
            rnd = (Math.random() * (5 - 3 + 1) + 3) / 100;
        } else if (stat >= 0.25 && stat < 0.65) {
            // increment between 0 - 3%
            rnd = (Math.random() * 3) / 100;
        } else if (stat >= 0.65 && stat < 0.9) {
            // increment between 0 - 2%
            rnd = (Math.random() * 2) / 100;
        } else if (stat >= 0.9 && stat < 0.99) {
            // finally, increment it .5 %
            rnd = 0.005;
        } else {
            // after 99%, don't increment:
            rnd = 0;
        }

        const percentage = this.status + rnd;
        this.set(percentage);
    }

    private set(percentage: number) {
        if (!this.show.peek()) {
            return;
        }

        const percentageString = percentage * 100 + '%';
        this.$element.animate({ width: percentageString }, 'fast', 'swing');

        this.status = percentage;

        // increment loadingbar to give the illusion that there is always
        // progress but make sure to cancel the previous timeouts so we don't
        // have multiple incs running at the same time.
        if (settings.autoIncrement) {
            window.clearTimeout(this.increaseTimeoutHandle);
            this.increaseTimeoutHandle = window.setTimeout(() => {
                this.increase();
            }, 250);
        }
    }
}

class LoadingBarComponent implements ko.components.Config {
    private appContext: AppContext;

    public template = require<string>('./templates/loading-bar.html');

    public viewModel: ko.components.ViewModelFactory = {
        createViewModel: (params: any, componentInfo: ko.components.ComponentInfo) => {
            const vm = new LoadingBarComponentModel(this.appContext, componentInfo.element as Element);
            HttpClient.registerInterceptor(vm);

            return vm;
        }
    };

    public synchronous = true;

    constructor(appContext: AppContext) {
        this.appContext = appContext;
    }
}

export default function register(appContext: AppContext) {
    ko.components.register('loading-bar', new LoadingBarComponent(appContext));
}
