import { expect } from 'chai';
import * as i18n from 'AppFramework/Internationalization';

function setCulture(culture: i18n.Culture) {
    i18n.setDateFormat(culture);
}

describe('DateFormat', () => {
    const dates = {
        nl: {
            'month-year': 'juli 2015',
            month: 'mei',
            monthDay: '1 mei',
            time: '22:59',
            full: '1 mei 2017 22:59:00'
        },
        'en-GB': {
            'month-year': 'July 2015',
            month: 'May',
            monthDay: '1 May',
            time: '22:59',
            full: '1 May 2017, 22:59:00'
        },
        'en-US': {
            'month-year': 'July 2015',
            month: 'May',
            monthDay: 'May 1',
            time: '10:59 PM',
            full: 'May 1, 2017, 10:59:00 PM'
        }
    };

    for (const culture of Object.keys(dates)) {
        const set = (dates as any)[culture];

        describe('Culture: ' + culture, () => {
            it('formats month-year date', () => {
                // Given
                const date = new Date(2015, 6, 1);
                setCulture(culture as i18n.Culture);

                // When
                const str = i18n.DateFormat.monthYear(date);

                // Then
                expect(str).to.be.equal(set['month-year']);
            });

            it('formats time only', () => {
                // Given
                const date = new Date(2017, 4, 1, 22, 59);
                setCulture(culture as i18n.Culture);

                // When
                const str = i18n.DateFormat.predefined(date, 't');

                // Then
                expect(str).to.be.equal(set.time);
            });

            it('formats month only', () => {
                // Given
                const date = new Date(2017, 4, 1, 22, 59);
                setCulture(culture as i18n.Culture);

                // When
                const str = i18n.DateFormat.predefined(date, 'MMMM');

                // Then
                expect(str).to.be.equal(set.month);
            });

            it('formats month/day only', () => {
                // Given
                const date = new Date(2017, 4, 1, 22, 59);
                setCulture(culture as i18n.Culture);

                // When
                const str = i18n.DateFormat.predefined(date, 'd MMMM');

                // Then
                expect(str).to.be.equal(set.monthDay);
            });

            it('formats full date', () => {
                // Given
                const date = new Date(2017, 4, 1, 22, 59, 0);
                setCulture(culture as i18n.Culture);

                // When
                const str = i18n.DateFormat.predefined(date, 'F');

                // Then
                expect(str).to.be.equal(set.full);
            });
        });
    }
});
