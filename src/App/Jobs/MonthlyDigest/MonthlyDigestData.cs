// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : MonthlyDigestData.cs
//  Project         : App
// ******************************************************************************
namespace App.Jobs.MonthlyDigest {
    using System.Collections.Generic;

    public sealed class MonthlyDigestData {
        public string AppOwnerName { get; set; }
        public string MonthName { get; set; }

        public MonthlyDigestFigure Income { get; } = new MonthlyDigestFigure();
        public MonthlyDigestFigure Expenses { get; } = new MonthlyDigestFigure();
        public MonthlyDigestFigure Savings { get; } = new MonthlyDigestFigure();

        public List<ExpenseModel> UpcomingExpenses { get; } = new List<ExpenseModel>();
        public List<ExpenseModel> LargestExpenses { get; } = new List<ExpenseModel>();

        public MonthlyDigestWealthData Wealth { get; } = new MonthlyDigestWealthData();
    }
}