import { expect } from 'chai';
import * as i18n from 'AppFramework/Internationalization';

function setCulture(culture: i18n.Culture) {
    i18n.setNumberFormat(culture);
}

describe('NumberFormat', () => {
    const numbers = {
        nl: {
            parse: [['1.000,56', 1000.56], ['0,0000153', 0.0000153], ['1.000.000', 1000000], ['1,32456', 1.32456]],
            decimal: [
                // input, default, no digits
                [1000.56, '1.000,56', '1.001'],
                [0.0000153, '0,0000153', '0'],
                [1000000, '1.000.000', '1.000.000'],
                [1.32456, '1,32456', '1']
            ],
            percent: [[0.1056, '11%'], [0.0000153, '0%'], [1000000, '100.000.000%'], [1.32456, '132%']],
            currency: {
                EUR: [[1234.56, '€ 1234,56']]
            }
        },
        'en-GB': {
            parse: [['1,000.56', 1000.56], ['0.0000153', 0.0000153], ['1,000,000', 1000000], ['1.32456', 1.32456]],
            decimal: [
                // input, default, no digits
                [1000.56, '1,000.56', '1,001'],
                [0.0000153, '0.0000153', '0'],
                [1000000, '1,000,000', '1,000,000'],
                [1.32456, '1.32456', '1']
            ],
            percent: [[0.1056, '11%'], [0.0000153, '0%'], [1000000, '100,000,000%'], [1.32456, '132%']],
            currency: {
                EUR: [[1234.56, '€ 1234.56']]
            }
        }
    };
    (numbers as any)['en-US'] = numbers['en-GB'];

    for (const culture of Object.keys(numbers)) {
        const testSet = (numbers as any)[culture];

        describe('Culture: ' + culture, () => {
            describe('parse tests', () => {
                for (const [input, expectedValue] of testSet.parse) {
                    it(`'${input}' -> ${expectedValue}`, () => {
                        // Given
                        setCulture(culture as i18n.Culture);

                        // When
                        const val = i18n.NumberParse.float(input);

                        // Then
                        expect(val).to.be.equal(expectedValue);
                    });
                }
            });

            describe('format-decimal tests (digits)', () => {
                for (const [input, expectedValue] of testSet.decimal) {
                    it(`'${input}' -> ${expectedValue}`, () => {
                        // Given
                        setCulture(culture as i18n.Culture);

                        // When
                        const val = i18n.NumberFormat.decimal(input);

                        // Then
                        expect(val).to.be.equal(expectedValue);
                    });
                }
            });

            describe('format-decimal tests (no digits)', () => {
                for (const [input, , expectedValue] of testSet.decimal) {
                    it(`'${input}' -> ${expectedValue}`, () => {
                        // Given
                        setCulture(culture as i18n.Culture);

                        // When
                        const val = i18n.NumberFormat.decimal(input, 0);

                        // Then
                        expect(val).to.be.equal(expectedValue);
                    });
                }
            });

            describe('format-percent tests', () => {
                for (const [input, expectedValue] of testSet.percent) {
                    it(`'${input}' -> ${expectedValue}`, () => {
                        // Given
                        setCulture(culture as i18n.Culture);

                        // When
                        const val = i18n.NumberFormat.percent(input, 0);

                        // Then
                        expect(val).to.be.equal(expectedValue);
                    });
                }
            });

            describe('format-currency tests', () => {
                for (const currencyType of Object.keys(testSet.currency)) {
                    const childTestSet = testSet.currency[currencyType];

                    it(currencyType, () => {
                        for (const [input, expectedValue] of childTestSet) {
                            it(`'${input}' -> ${expectedValue}`, () => {
                                // Given
                                setCulture(culture as i18n.Culture);

                                // When
                                const val = i18n.NumberFormat.currency(input);

                                // Then
                                expect(val).to.be.equal(expectedValue);
                            });
                        }
                    });
                }
            });
        });
    }
});
