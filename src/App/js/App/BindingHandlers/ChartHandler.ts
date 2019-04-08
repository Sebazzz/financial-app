import registerLazyBindingHandler from 'AppFramework/BindingHandlers/LazyBindingHandler';
import * as ko from 'knockout';
import { IChartLoader } from '../Services/ChartLoader'; // Silence TS2686

function initChart(
    chartLoader: IChartLoader,
    element: HTMLCanvasElement,
    valueAccessor: () => any,
    allBindingsAccessor: ko.AllBindings
) {
    if (element.tagName.toUpperCase() !== 'CANVAS') {
        throw new Error('Invalid tag name: This item should be applied to canvas');
    }

    const data = ko.unwrap(valueAccessor()),
        options = allBindingsAccessor.get('chartOptions'),
        chartType = allBindingsAccessor.get('chartType'),
        ctx = element.getContext('2d');

    if (ctx === null) {
        alert('Unable to get Canvas rendering context');
        return;
    }

    if (!chartType) {
        throw new Error('Please specify chart type via "chartType" binding');
    }

    if (!options) {
        throw new Error('Please specify chart options via "chartOptions" binding');
    }

    chartLoader.applyDefaultColors(data.dataSets);

    const chart = new chartLoader.chartConstructor(ctx, {
        type: chartType,
        data: {
            labels: data.labels,
            datasets: data.dataSets
        },
        options
    });

    ko.utils.domNodeDisposal.addDisposeCallback(element, () => chart.destroy());
}

registerLazyBindingHandler(
    'chart',
    async () => (await import('../Services/ChartLoader')).default,
    {
        init(
            library: IChartLoader,
            element: HTMLCanvasElement,
            valueAccessor: () => any,
            allBindingsAccessor: ko.AllBindings /* viewModel?: any, bindingContext?: ko.BindingContext*/
        ) {
            initChart(library, element, valueAccessor, allBindingsAccessor);
        }
    },
    (canvas: HTMLCanvasElement) => {
        const context = canvas.getContext('2d');
        if (!context) {
            return;
        }

        context.fillStyle = 'white';
        context.font = 'italic 12px Arial';
        context.fillText('Bezig met laden...', 10, canvas.height / 2 + 8);
    }
);
