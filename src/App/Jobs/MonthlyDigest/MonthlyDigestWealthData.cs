// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : MonthlyDigestWealthData.cs
//  Project         : App
// ******************************************************************************
namespace App.Jobs.MonthlyDigest {
    public sealed class MonthlyDigestWealthData {
        public MonthlyDigestFigure BankAccount { get; } = new MonthlyDigestFigure();
        public MonthlyDigestFigure SavingsAccount { get; } = new MonthlyDigestFigure();
    }
}