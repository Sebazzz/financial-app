// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : MonthlyDigestMailer.cs
//  Project         : App
// ******************************************************************************

namespace App.Jobs.MonthlyDigest {
    using System;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using Support.Mailing;

    public sealed class MonthlyDigestMailer {
        private const string TemplateName = "monthly-digest";

        private readonly MailService _mailService;
        private readonly TemplateProvider _templateProvider;

        public MonthlyDigestMailer(MailService mailService, TemplateProvider templateProvider) {
            this._mailService = mailService;
            this._templateProvider = templateProvider;
        }

        public async Task SendAsync(string to, MonthlyDigestData monthlyDigest) {
            var template = await this._templateProvider.GetTemplateAsync(TemplateName);

            template.AddReplacement("month-name", monthlyDigest.MonthName);
            template.AddReplacement("app-owner-name", monthlyDigest.AppOwnerName);

            AddFigures(monthlyDigest, template);
            AddExpenses(template, monthlyDigest);

            await this._mailService.SendAsync(to, template);
        }

        private static void AddExpenses(Template template, MonthlyDigestData monthlyDigest) {
            void AddExpenses(ICollection<ExpenseModel> expenses, string sectionName, string rowName) {
                if (expenses.Count == 0) {
                    template.RemoveSection(sectionName);
                    return;
                }

                template.RepeatSection(
                    rowName,
                    expenses,
                    (e, t) => t.Replace("expense-source", e.Source)
                               .Replace("expense-amount", Math.Abs(e.Amount).ToString("C"))
                               .Replace("expense-category", e.CategoryName)
                );
            }

            AddExpenses(monthlyDigest.UpcomingExpenses, "UPCOMING-EXPENSE-TABLE", "UPCOMING-EXPENSE-TABLE-ROW");
            AddExpenses(monthlyDigest.LargestExpenses, "EXPENSE-TABLE", "EXPENSE-TABLE-ROW");
        }

        private static void AddFigures(MonthlyDigestData monthlyDigest, Template template) {
            void AddFigure(MonthlyDigestFigure figure, string id) {
                template.AddReplacement($"fig-{id}", figure.Amount.ToString("C"));

                var changePercentage = figure.ChangeQuotient.ToString("P");
                var changePercentageText =
                    figure.ChangeQuotient < 0 ? $"{changePercentage} minder" : $"{changePercentage} meer";

                template.AddReplacement($"fig-{id}-change-percentage", changePercentageText);
                template.AddReplacement($"comp-fig-{id}", figure.PreviousAmount.ToString("C"));
            }

            AddFigure(monthlyDigest.Expenses, "expense");
            AddFigure(monthlyDigest.Income, "income");
            AddFigure(monthlyDigest.Savings, "savings");
        }
    }
}