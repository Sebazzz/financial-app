import { Culture } from './Core';

let dateFormat: Culture = Culture.Dutch;
let formatters: {
    'MMMM yyyy': Intl.DateTimeFormat;
    'd MMMM': Intl.DateTimeFormat;
    t: Intl.DateTimeFormat;
    MMMM: Intl.DateTimeFormat;
    F: Intl.DateTimeFormat;
};

export type PredefinedDateFormats = keyof typeof formatters;

createFormatters(dateFormat);

function createFormatters(culture: Culture) {
    formatters = {
        'MMMM yyyy': new Intl.DateTimeFormat(culture, { year: 'numeric', month: 'long' }),
        'd MMMM': new Intl.DateTimeFormat(culture, { day: 'numeric', month: 'long' }),
        t: new Intl.DateTimeFormat(culture, { hour: 'numeric', minute: 'numeric' }),
        MMMM: new Intl.DateTimeFormat(culture, { month: 'long' }),
        F: new Intl.DateTimeFormat(culture, {
            // dddd, MMMM dd, yyyy h:mm:ss tt
            day: 'numeric',
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

export function setDateFormat(culture: Culture) {
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

    public static toString(date: Date, format: string) {
        try {
            return this.predefined(date, format as any);
        } catch (e) {
            throw new Error(`Date format not supported: ${format} (${e.message})`);
        }
    }
}
