import { Culture } from './Core';

export interface INumberFormat {
    decimalSeperator: string;
    thousandSeperator: string;
    identifier: Culture;
}

export interface ICurrencyFormat {
    name: string;
    symbol: () => string;
}

function getCurrencySymbol(currencyFormat: CurrencyFormatIdentifier) {
    return new Intl.NumberFormat('nl', { style: 'currency', currency: currencyFormat }).format(0)[0];
}

export const currencyFormats = {
    EUR: {
        name: 'Euro',
        symbol: () => getCurrencySymbol('EUR')
    },
    USD: {
        name: 'US Dollars',
        symbol: () => getCurrencySymbol('USD')
    }
};

export type CurrencyFormatIdentifier = keyof typeof currencyFormats;
export const defaultCurrencyFormat: CurrencyFormatIdentifier = 'EUR';

export const currencyFormat: CurrencyFormatIdentifier = defaultCurrencyFormat;

export const defaultNumberFormatKey: Culture = Culture.Dutch;
export const numberFormats: { [lang: string]: INumberFormat } = {
    'en-US': {
        decimalSeperator: '.',
        thousandSeperator: ',',
        identifier: Culture.USEnglish
    },
    'en-GB': {
        decimalSeperator: '.',
        thousandSeperator: ',',
        identifier: Culture.GBEnglish
    },
    nl: {
        decimalSeperator: ',',
        thousandSeperator: '.',
        identifier: Culture.Dutch
    }
};

let currentCulture: Culture,
    currentNumberFormat: INumberFormat,
    numberFormatters: { currency: Intl.NumberFormat; decimal: Intl.NumberFormat; percent: Intl.NumberFormat };

setNumberFormat(defaultNumberFormatKey);

function createNumberFormatters(culture: Culture) {
    return {
        decimal: new Intl.NumberFormat(culture, { style: 'decimal', useGrouping: true, maximumFractionDigits: 10 }),
        currency: new Intl.NumberFormat(culture, { style: 'currency', currency: currencyFormat, useGrouping: true }),
        percent: new Intl.NumberFormat(culture, { style: 'percent', useGrouping: true, maximumFractionDigits: 10 })
    };
}

export function setNumberFormat(culture: Culture) {
    const newNumberFormat = numberFormats[culture];

    if (!newNumberFormat) {
        throw new Error('Unknown culture: ' + culture);
    }

    currentCulture = culture;
    currentNumberFormat = newNumberFormat;
    numberFormatters = createNumberFormatters(culture);
}

export function getNumberFormat() {
    return currentNumberFormat;
}

export enum NumberFormatType {
    Currency = 2,
    Decimal = 0,
    Percent = 1
}

function getNumberFormatter(type: NumberFormatType) {
    switch (type) {
        case NumberFormatType.Currency:
            return numberFormatters.currency;
        case NumberFormatType.Decimal:
            return numberFormatters.decimal;
        case NumberFormatType.Percent:
            return numberFormatters.percent;
        default:
            throw new Error('Unknown number format:' + type);
    }
}

function formatNumberCore(input: number, formatter: Intl.NumberFormat, numberOfDecimals?: number) {
    let currentFormatter = formatter;

    if (typeof numberOfDecimals === 'number') {
        const formatterOptions = formatter.resolvedOptions();
        formatterOptions.maximumFractionDigits = numberOfDecimals;
        formatterOptions.minimumFractionDigits = numberOfDecimals;

        currentFormatter = new Intl.NumberFormat(currentNumberFormat.identifier, formatterOptions);
    }

    return currentFormatter.format(input);
}

export class Format {
    public static number(input: number, type: NumberFormatType, numberOfDecimals?: number) {
        return formatNumberCore(input, getNumberFormatter(type), numberOfDecimals);
    }

    public static currency(input: number) {
        return formatNumberCore(input, numberFormatters.currency);
    }

    public static percent(input: number, numberOfDecimals?: number) {
        return formatNumberCore(input, numberFormatters.percent, numberOfDecimals);
    }

    public static decimal(input: number, numberOfDecimals?: number, culture?: Culture) {
        const formatters =
            typeof culture !== 'undefined' && culture !== currentCulture
                ? createNumberFormatters(culture)
                : numberFormatters;
        return formatNumberCore(input, formatters.decimal, numberOfDecimals);
    }

    public static toString(input: number, format: string) {
        function formatN() {
            return Format.decimal(input, parseInt(format.substr(1), 10));
        }

        const formatFirstLetter = format[0];
        switch (formatFirstLetter) {
            case 'n':
                return formatN();

            case 'c':
                return this.currency(input);

            default:
                throw new Error(`Number formatting: Unsupported format '${format}'`);
        }
    }
}

export class Parse {
    public static float(input: string, culture?: Culture): number {
        // While the JS standard library does have number formatting nowadays, it is still
        // lacking proper number parsing. This is not a problem, this just means we got to
        // transform the input into international number formatting

        if (!input) {
            return NaN;
        }

        const numberFormat = (typeof culture !== 'undefined' && numberFormats[culture]) || currentNumberFormat;

        const transformedInput = input
            .split(numberFormat.thousandSeperator)
            .join('')
            .replace(numberFormat.decimalSeperator, '.')
            .replace('\u00A0', ' ')
            .replace('$', ' ')
            .replace('€', ' ')
            .replace(' ', '');

        return parseFloat(transformedInput);
    }
}
