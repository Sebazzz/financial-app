import {Page, IPageRegistration} from 'AppFramework/Page'
import AppContext from 'AppFramework/AppContext'
import * as api from 'App/ServerApi/SheetStatistics';
import { ChartOptions } from 'chart.js';

const offwhite = '#f8f9fa';

class ReportPage extends Page {
    private api = new api.Api();

    public income = ko.observable<api.IReportDigest>();
    public expenses = ko.observable<api.IReportDigest>();

    public chartOptions : ChartOptions = {
        tooltips: {
            mode: 'index',
            callbacks: {
                label: (value, data) => {
                    if (!value || !data.datasets) {
                        return '';
                    }

                    const dataSet = data.datasets[value.datasetIndex || 0];
                    if (!dataSet) {
                        return '';
                    }

                    return `${dataSet.label}: ${kendo.toString(+(value.yLabel || 0), 'c')}`;
                }
            }
        },
        hover: {
            mode: 'nearest',
            intersect: true
        },
        scales: {
            xAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Maand / jaar'
                },
                gridLines: {
                    display: false,
                    color: offwhite
                }
            }],
            yAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Bedrag'
                },
                ticks: {
                    callback: (value) => '€ ' + value
                },
                gridLines: {
                    display: false,
                    color: offwhite
                }
            }]
        }
    };

    constructor(appContext: AppContext) {
        super(appContext);

        this.title('Rapportage - algemeen');
    }

    protected async onActivate(args?: any): Promise<void> {
        const report = await this.api.getGlobalStatistics();

        this.income(report.income);
        this.expenses(report.expenses);
    }
} 

export default {
    id: module.id,
    templateName: 'report/general',
    routingTable: { name: 'report.general', path: '/general' },
    createPage: (appContext) => new ReportPage(appContext)
} as IPageRegistration;