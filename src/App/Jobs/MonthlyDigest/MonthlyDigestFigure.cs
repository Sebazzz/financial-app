// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : MonthlyDigestFigure.cs
//  Project         : App
// ******************************************************************************
namespace App.Jobs.MonthlyDigest {
    public sealed class MonthlyDigestFigure {
        public decimal Amount { get; set; }

        public decimal ChangeQuotient
        {
            get
            {
                if (this.PreviousAmount == 0) {
                    return 1;
                }

                return (this.Amount / this.PreviousAmount) - 1;
            }
        }

        public decimal Difference => this.Amount - this.PreviousAmount;

        public decimal PreviousAmount { get; set; }
    }
}