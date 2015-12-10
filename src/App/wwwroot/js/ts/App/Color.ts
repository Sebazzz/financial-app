module FinancialApp.Colors {
    
    export class Chart {
        public static backgroundColor = '#2b2b2b';
        public static color = '#FFF';

        public static setColors(options: any) {
            $.extend(true, options, {
                backgroundColor: Chart.backgroundColor,

                chartArea: {
                    backgroundColor: Chart.backgroundColor
                },

                hAxis: {
                    textStyle: {
                        color: Chart.color
                    }
                },

                legend: {
                    textStyle: {
                        color: Chart.color
                    }
                },

                titleTextStyle: {
                    color: Chart.color
                },

                vAxis: {
                    textStyle: {
                        color: Chart.color
                    }
                }
            });
        }
    }
}