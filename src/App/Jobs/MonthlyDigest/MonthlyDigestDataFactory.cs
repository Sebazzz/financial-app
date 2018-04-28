namespace App.Jobs.MonthlyDigest {
    using System;
    using System.Linq;
    using Models.Domain;
    using Models.Domain.Repositories;
    using Models.Domain.Services;

    public sealed class MonthlyDigestDataFactory {
        private readonly SheetRetrievalService _sheetRetrievalService;
        private readonly RecurringSheetEntryRepository _recurringSheetEntryRepository;

        public MonthlyDigestDataFactory(RecurringSheetEntryRepository recurringSheetEntryRepository, SheetRetrievalService sheetRetrievalService) {
            this._recurringSheetEntryRepository = recurringSheetEntryRepository;
            this._sheetRetrievalService = sheetRetrievalService;
        }

        public MonthlyDigestData GetFor(int appOwnerId) {

            DateTime previousMonth = DateTime.Today.AddMonths(-1);
            previousMonth = new DateTime(previousMonth.Year, previousMonth.Month, 1);

            DateTime secondPreviousMonth = previousMonth.AddMonths(-1);

            MonthlyDigestData digestData = new MonthlyDigestData();

            this.AddPreviousMonth(previousMonth, digestData, appOwnerId);
            this.AddSecondPreviousMonthFigures(secondPreviousMonth, digestData, appOwnerId);
            this.AddUpcomingExpenses(digestData, appOwnerId);

            return digestData;
        }

        private void AddUpcomingExpenses(MonthlyDigestData digestData, int appOwnerId) {
            const int numberOfExpenses = 5;
            digestData.UpcomingExpenses.AddRange(this._recurringSheetEntryRepository.GetByOwner(appOwnerId)
                .Where(x => x.Delta < 0)
                .Where(x => x.Account == AccountType.BankAccount)
                .OrderBy(x => x.SortOrder)
                .Select(x => new ExpenseModel {
                    Amount = Math.Abs(x.Delta),
                    CategoryName = x.Category?.Name,
                    Source = x.Source
                })
                .Take(numberOfExpenses));
        }

        private void AddSecondPreviousMonthFigures(DateTime timestamp, MonthlyDigestData digestData, int appOwnerId) {
            Sheet sheet = this._sheetRetrievalService.GetBySubject(timestamp.Month, timestamp.Year, appOwnerId);

            digestData.Expenses.PreviousAmount = Math.Abs(CalculateExpenses(sheet));
            digestData.Income.PreviousAmount = CalculateIncome(sheet);
            digestData.Savings.PreviousAmount = CalculateSavings(sheet);
        }

        private void AddPreviousMonth(DateTime timestamp, MonthlyDigestData digestData, int appOwnerId) {
            Sheet sheet = this._sheetRetrievalService.GetBySubject(timestamp.Month, timestamp.Year, appOwnerId);

            digestData.MonthName = sheet.Subject.ToString("MMMM yyyy");

            digestData.Expenses.Amount = Math.Abs(CalculateExpenses(sheet));
            digestData.Income.Amount = CalculateIncome(sheet);
            digestData.Savings.Amount = CalculateSavings(sheet);

            AddLargestExpenses(sheet, digestData);
        }

        private static void AddLargestExpenses(Sheet sheet, MonthlyDigestData digestData) {
            const int numberOfExpenses = 5;

            var q = from entry in sheet.Entries
                where entry.Account == AccountType.BankAccount
                where entry.Delta < 0
                let amount = Math.Abs(entry.Delta)
                orderby amount descending 
                select new ExpenseModel {
                    Amount = amount,
                    CategoryName = entry.Category?.Name,
                    Source = entry.Source
                };

            digestData.LargestExpenses.AddRange(q.Take(numberOfExpenses));
        }

        private static decimal CalculateSavings(Sheet sheet) {
            return CalculateFigure(sheet, se => se.Account == AccountType.SavingsAccount);
        }

        private static decimal CalculateIncome(Sheet sheet) {
            return CalculateFigure(sheet, se => se.Delta > 0 && se.Account == AccountType.BankAccount);
        }

        private static decimal CalculateExpenses(Sheet sheet) {
            return CalculateFigure(sheet, se => se.Delta < 0 && se.Account == AccountType.BankAccount);
        }

        private static decimal CalculateFigure(Sheet sheet, Func<SheetEntry, bool> condition) {
            return sheet.Entries.Where(condition).Sum(x => x.Delta);
        }
    }
}