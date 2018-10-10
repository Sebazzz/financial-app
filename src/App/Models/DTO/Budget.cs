// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : Budget.cs
//  Project         : App
// ******************************************************************************
namespace App.Models.DTO
{
    public class Budget
    {
        public CategoryBudgetRow[] Rows { get; set; }

        public TotalBudgetRow Totals { get;set; }
    }

    public class BudgetRow
    {
        public decimal CurrentMonth { get; set; }
        public decimal LastMonth { get; set; }
        public decimal AverageSixMonths { get; set; }
        public decimal TotalSixMonths { get; set; }
        public decimal AverageYear { get; set; }
        public decimal TotalYear { get; set; }
    }

    public class TotalBudgetRow : BudgetRow
    {
        public decimal BudgetTotal { get; set; }
    }

    public class CategoryBudgetRow : BudgetRow {
        public int CategoryId { get; set; }
        public decimal MonthlyBudget { get; set; }
        public string CategoryName { get; set; }

        public bool IsOverBudget => this.MonthlyBudget < this.CurrentMonth;
    }
}