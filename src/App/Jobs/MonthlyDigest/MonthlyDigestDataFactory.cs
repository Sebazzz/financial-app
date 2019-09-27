// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : MonthlyDigestDataFactory.cs
//  Project         : App
// ******************************************************************************
namespace App.Jobs.MonthlyDigest {
    using System;
    using System.Linq;
    using System.Threading.Tasks;
    using Models.Domain;
    using Models.Domain.Repositories;
    using Models.Domain.Services;

    public sealed class MonthlyDigestDataFactory {
        private readonly SheetRetrievalService _sheetRetrievalService;
        private readonly RecurringSheetEntryRepository _recurringSheetEntryRepository;
        private readonly SheetOffsetCalculationService _calculationService;

        public MonthlyDigestDataFactory(RecurringSheetEntryRepository recurringSheetEntryRepository, SheetRetrievalService sheetRetrievalService, SheetOffsetCalculationService calculationService) {
            this._recurringSheetEntryRepository = recurringSheetEntryRepository;
            this._sheetRetrievalService = sheetRetrievalService;
            this._calculationService = calculationService;
        }

        public async Task<MonthlyDigestData> GetForAsync(int appOwnerId) {
            DateTime previousMonth = DateTime.Today.AddMonths(-1);
            previousMonth = new DateTime(previousMonth.Year, previousMonth.Month, 1);

            DateTime secondPreviousMonth = previousMonth.AddMonths(-1);

            var digestData = new MonthlyDigestData();

            await this.AddPreviousMonthAsync(previousMonth, digestData, appOwnerId);
            await this.AddSecondPreviousMonthFiguresAsync(secondPreviousMonth, digestData, appOwnerId);
            this.AddUpcomingExpenses(digestData, appOwnerId);
            await this.AddWealthInformationAsync(previousMonth, digestData, appOwnerId);

            return digestData;
        }

        private async Task AddWealthInformationAsync(DateTime previousMonth, MonthlyDigestData digestData, int appOwnerId) {
            Sheet sheet = await this._sheetRetrievalService.GetBySubjectAsync(previousMonth.Month, previousMonth.Year, appOwnerId);
            CalculationOptions calcOffset = this._calculationService.CalculateOffset(sheet);

            digestData.Wealth.BankAccount.PreviousAmount = calcOffset.BankAccountOffset ?? 0;
            digestData.Wealth.BankAccount.Amount = digestData.Wealth.BankAccount.PreviousAmount + CalculateFigure(sheet, se => se.Account == AccountType.BankAccount);

            digestData.Wealth.SavingsAccount.PreviousAmount = calcOffset.SavingsAccountOffset ?? 0;
            digestData.Wealth.SavingsAccount.Amount = digestData.Wealth.SavingsAccount.PreviousAmount + CalculateFigure(sheet, se => se.Account == AccountType.SavingsAccount);
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

        private async Task AddSecondPreviousMonthFiguresAsync(DateTime timestamp, MonthlyDigestData digestData, int appOwnerId) {
            Sheet sheet = await this._sheetRetrievalService.GetBySubjectAsync(timestamp.Month, timestamp.Year, appOwnerId);

            digestData.Expenses.PreviousAmount = Math.Abs(CalculateExpenses(sheet));
            digestData.Income.PreviousAmount = CalculateIncome(sheet);
            digestData.Savings.PreviousAmount = CalculateSavings(sheet);
        }

        private async Task AddPreviousMonthAsync(DateTime timestamp, MonthlyDigestData digestData, int appOwnerId) {
            Sheet sheet = await this._sheetRetrievalService.GetBySubjectAsync(timestamp.Month, timestamp.Year, appOwnerId);

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
            decimal savingsDecreasedAmount = CalculateFigure(sheet, se => se.Account == AccountType.SavingsAccount && se.Delta < 0);

            // Prevent decrease in savings being calculated as income
            decimal totalIncome = CalculateFigure(sheet, se => se.Delta > 0 && se.Account == AccountType.BankAccount) - savingsDecreasedAmount;

            return totalIncome;
        }

        private static decimal CalculateExpenses(Sheet sheet) {
            decimal savingsIncreasedAmount = CalculateFigure(sheet, se => se.Account == AccountType.SavingsAccount && se.Delta > 0);

            // Prevent money to the savings account from being calculated in the number
            decimal totalExpense = CalculateFigure(sheet, se => se.Delta < 0 && se.Account == AccountType.BankAccount) - savingsIncreasedAmount;

            return totalExpense;
        }

        private static decimal CalculateFigure(Sheet sheet, Func<SheetEntry, bool> condition) {
            return sheet.Entries.Where(condition).Sum(x => x.Delta);
        }
    }
}
