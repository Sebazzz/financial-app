import { Culture } from './Core';

let dateFormat: Culture = Culture.Dutch;
let formatters: {
    'MMMM yyyy': Intl.DateTimeFormat;
    MMMM: Intl.DateTimeFormat;
    F: Intl.DateTimeFormat;
};

export type PredefinedDateFormats = keyof typeof formatters;

createFormatters(dateFormat);

function createFormatters(culture: Culture) {
    formatters = {
        'MMMM yyyy': new Intl.DateTimeFormat(culture, { year: 'numeric', month: 'long' }),
        MMMM: new Intl.DateTimeFormat(culture, { month: 'long' }),
        F: new Intl.DateTimeFormat(culture, {
            // dddd, MMMM dd, yyyy h:mm:ss tt
            day: 'full',
            month: 'long',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
        })
    };
}

export function getDateFormat() {
    return dateFormat;
}

export function settDateFormat(culture: Culture) {
    createFormatters(culture);
    dateFormat = culture;
}

export class Format {
    public static custom(input: Date, options: Intl.DateTimeFormatOptions) {
        return new Intl.DateTimeFormat(dateFormat, options).format(input);
    }

    public static predefined(input: Date, format: PredefinedDateFormats) {
        const formatter = formatters[format];

        if (!formatter) {
            throw new Error('Unknown predefined format:' + format);
        }

        return formatter.format(input);
    }

    public static monthYear(input: Date) {
        return this.predefined(input, 'MMMM yyyy');
    }
}
