import { expect } from 'chai';
import * as i18n from 'AppFramework/Internationalization';

function setCulture(culture: i18n.Culture) {
    i18n.setDateFormat(culture);
    i18n.setNumberFormat(culture);
}

setCulture(i18n.Culture.USEnglish);

describe('StringFormat', () => {
    describe('compositeFormat', () => {
        const formats = [
            {
                format: 'Hello, I am {0}!',
                expected: 'Hello, I am John!',
                params: ['John']
            },
            {
                format: 'I spent {0:c} already!',
                expected: 'I spent €100.00 already!',
                params: [100]
            },
            {
                format: 'Christina was born in {0:MMMM yyyy}, Hannah in {1:MMMM yyyy}.',
                expected: 'Christina was born in July 2015, Hannah in May 2017.',
                params: [new Date(2015, 6, 30), new Date(2017, 4, 20)]
            },
            {
                format: 'I forgot a {0}',
                expected: 'I forgot a undefined',
                params: []
            }
        ];

        for (const test of formats) {
            it(`[${test.format}] -> [${test.expected}]`, () => {
                // When
                const value = i18n.compositeFormat(test.format, ...test.params);

                // Then
                expect(test.expected).to.be.equal(value);
            });
        }
    });
});
