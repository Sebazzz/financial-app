import { Format as NumberFormat } from './Number';
import { Format as DateFormat } from './Date';

const formattingRegEx = /\{(\d+)(:[^\}]+)?\}/g;

/**
 * Formats the specified parameter to a string. Provided for backwards compatibility purposes.
 *
 * @param value
 * @param format 'c'
 */
export function toString(value: any | undefined | null, format: string) {
    const typeofValue = typeof value;

    switch (typeofValue) {
        case 'undefined':
            return '';

        case 'number':
            return NumberFormat.toString(value, format);

        case 'object':
            if (value instanceof Date) {
                return DateFormat.toString(value, format);
            }

            if (value === null) {
                return '';
            }

            return value.toString();

        default:
            return value.toString();
    }
}

/**
 * Composite string formatting, similar to .NET String.Format
 *
 * @param formatString Composite formatting string, containing placeholders {0}, {1}
 * @param parameters Parameters to be replaces in composite formatting string
 */
export function compositeFormat(formatString: string, ...parameters: any[]) {
    return formatString.replace(formattingRegEx, (_, index, placeholderFormat) => {
        const value = parameters[parseInt(index, 10)],
            valueFormat = placeholderFormat ? placeholderFormat.substring(1) : null;

        return valueFormat ? toString(value, valueFormat) : value;
    });
}
