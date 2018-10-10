// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : ExpenseModel.cs
//  Project         : App
// ******************************************************************************
namespace App.Jobs.MonthlyDigest {
    public sealed class ExpenseModel {
        public string Source { get; set; }
        public decimal Amount { get; set; }
        public string CategoryName { get; set; }
    }
}