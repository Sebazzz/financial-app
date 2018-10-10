// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : BudgetRetrievalService.cs
//  Project         : App
// ******************************************************************************
using System.Data.Common;
using System.Linq;
using System.Threading.Tasks;
using App.Models.DTO;
using Dapper;

namespace App.Models.Domain.Services
{
    public sealed class BudgetRetrievalService
    {
        private readonly DbConnection _dbConnection;

        public BudgetRetrievalService(DbConnection dbConnection)
        {
            this._dbConnection = dbConnection;
        }

        public async Task<Budget> Calculate(int month, int year, int ownerId)
        {
            const string sql = @"
DECLARE @currentMonth DATETIME2(0) = DATETIME2FROMPARTS(@year, @month, 1, 0, 0, 0, 0, 0);
DECLARE @lastMonth DATETIME2(0) = DATEADD(month, -1, @currentMonth);
DECLARE @sixMonth DATETIME2(0) = DATEADD(month, -6, @currentMonth);

WITH 
cteCategories AS (
	SELECT *
	FROM Category c
	WHERE c.OwnerId = @ownerId
	AND c.MonthlyBudget IS NOT NULL
),
cteCurrentMonth AS (
	SELECT CategoryId = c.Id,
		   [Value] = SUM(sheetEntry.Delta)
	FROM cteCategories c
	INNER JOIN SheetEntry sheetEntry ON sheetEntry.CategoryId = c.Id
	INNER JOIN Sheet sheet ON sheetEntry.SheetId = sheet.Id
	WHERE sheet.[Subject] = @currentMonth
	GROUP BY c.Id
),
cteLastMonth AS (
	SELECT CategoryId = c.Id,
		   [Value] = SUM(sheetEntry.Delta)
	FROM cteCategories c
	INNER JOIN SheetEntry sheetEntry ON sheetEntry.CategoryId = c.Id
	INNER JOIN Sheet sheet ON sheetEntry.SheetId = sheet.Id
	WHERE sheet.[Subject] = @lastMonth
	GROUP BY c.Id
),
cteSumPerSheetSixMonths AS (
	SELECT CategoryId = c.Id,
		   SheetId = sheet.Id,
		   [Value] = SUM(sheetEntry.Delta)
	FROM cteCategories c
	INNER JOIN SheetEntry sheetEntry ON sheetEntry.CategoryId = c.Id
	INNER JOIN Sheet sheet ON sheetEntry.SheetId = sheet.Id
	WHERE sheet.[Subject] <= @currentMonth AND sheet.[Subject] >= @sixMonth
	GROUP BY c.Id, sheet.Id
),
cteAverageSixMonths AS (
	SELECT CategoryId,
		   [Value] = AVG([Value])
	FROM cteSumPerSheetSixMonths
	GROUP BY CategoryId
),
cteTotalSixMonths AS (
	SELECT CategoryId,
		   [Value] = SUM([Value])
	FROM cteSumPerSheetSixMonths
	GROUP BY CategoryId
),
cteSumPerSheetYear AS (
	SELECT CategoryId = c.Id,
		   SheetId = sheet.Id,
		   [Value] = SUM(sheetEntry.Delta)
	FROM cteCategories c
	INNER JOIN SheetEntry sheetEntry ON sheetEntry.CategoryId = c.Id
	INNER JOIN Sheet sheet ON sheetEntry.SheetId = sheet.Id
	WHERE DATEPART(year, sheet.[Subject]) = @year
	GROUP BY c.Id, sheet.Id
),
cteAverageYear AS (
	SELECT CategoryId,
		   [Value] = AVG([Value])
	FROM cteSumPerSheetYear
	GROUP BY CategoryId
),
cteTotalYear AS (
	SELECT CategoryId,
		   [Value] = SUM([Value])
	FROM cteSumPerSheetYear
	GROUP BY CategoryId
)
SELECT 
	CategoryId = c.Id,
	CategoryName = c.Name,
	MonthlyBudget = c.MonthlyBudget,

	CurrentMonth = ISNULL(cteCurrentMonth.[Value], 0),
	LastMonth = ISNULL(cteLastMonth.[Value], 0),

	AverageSixMonths = ISNULL(cteAverageSixMonths.[Value], 0),
	TotalSixMonths = ISNULL(cteTotalSixMonths.[Value], 0),

	AverageYear = ISNULL(cteAverageYear.[Value], 0),
	TotalYear = ISNULL(cteTotalYear.[Value], 0)
FROM cteCategories c
LEFT JOIN cteCurrentMonth ON cteCurrentMonth.CategoryId = c.Id
LEFT JOIN cteLastMonth ON cteLastMonth.CategoryId = c.Id
LEFT JOIN cteAverageSixMonths ON cteAverageSixMonths.CategoryId = c.Id
LEFT JOIN cteTotalSixMonths ON cteTotalSixMonths.CategoryId = c.Id
LEFT JOIN cteAverageYear ON cteAverageYear.CategoryId = c.Id
LEFT JOIN cteTotalYear ON cteTotalYear.CategoryId = c.Id
ORDER BY c.Name";

            var param = new {ownerId, month, year};
            var rows = (await this._dbConnection.QueryAsync<CategoryBudgetRow>(sql, param)).ToArray();

            return new Budget
            {
                Rows = rows,
                Totals = new TotalBudgetRow
                {
                    BudgetTotal = rows.Sum(x => x.MonthlyBudget),
                    CurrentMonth = rows.Sum(x => x.CurrentMonth),
                    LastMonth = rows.Sum(x => x.LastMonth),
                    AverageSixMonths = rows.Sum(x => x.AverageSixMonths),
                    TotalSixMonths = rows.Sum(x => x.TotalSixMonths),
                    AverageYear = rows.Sum(x => x.AverageYear),
                    TotalYear = rows.Sum(x => x.TotalYear),
                }
            };
        }
    }
}