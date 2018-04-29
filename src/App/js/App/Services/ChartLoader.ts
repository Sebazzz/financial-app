import { Chart, ChartDataSets } from 'chart.js';

const offwhite = '#f8f9fa',
    globalOptions = Chart.defaults.global,
    defaultColors = [
        '#3366CC',
        '#DC3912',
        '#FF9900',
        '#109618',
        '#990099',
        '#3B3EAC',
        '#0099C6',
        '#DD4477',
        '#66AA00',
        '#B82E2E',
        '#316395',
        '#994499',
        '#22AA99',
        '#AAAA11',
        '#6633CC',
        '#E67300',
        '#8B0707',
        '#329262',
        '#5574A6',
        '#3B3EAC'
    ];

globalOptions.defaultFontColor = offwhite;
globalOptions.responsive = true;
globalOptions.responsiveAnimationDuration = 1000;

if (globalOptions.scales && globalOptions.scales.gridLines) {
    globalOptions.scales.gridLines.color = offwhite;
}

(globalOptions as any).defaultColor = offwhite;

export function applyDefaultColors(dataSets: ChartDataSets[]) {
    for (let index = 0; index < dataSets.length; index++) {
        const color = defaultColors[index % defaultColors.length],
            dataSet = dataSets[index];

        if (!dataSet.backgroundColor) {
            dataSet.backgroundColor = color;
        }
        if (!dataSet.borderColor) {
            dataSet.borderColor = color;
        }
        if (!dataSet.fill) {
            dataSet.fill = false;
        }

        if (dataSets.length === 1 && dataSet.data) {
            const colors: string[] = [];
            dataSet.backgroundColor = colors;
            dataSet.borderColor = colors;

            for (let dataIndex = 0; dataIndex < dataSet.data.length; dataIndex++) {
                colors.push(defaultColors[dataIndex % defaultColors.length]);
            }
        }
    }
}

export interface IChartLoader {
    chartConstructor: typeof Chart;
    applyDefaultColors(dataSets: ChartDataSets[]): void;
}

const chartLoader: IChartLoader = {
    chartConstructor: Chart,
    applyDefaultColors
};

export { Chart };
export default chartLoader;
