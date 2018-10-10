// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : BudgetController.cs
//  Project         : App
// ******************************************************************************
using System.Threading.Tasks;
using App.Models.Domain.Services;
using App.Models.DTO;
using Microsoft.AspNetCore.Mvc;

namespace App.Api
{
    [Route("api/budget")]
    public class BudgetController : BaseEntityController
    {
        private readonly BudgetRetrievalService _budgetRetrievalService;

        public BudgetController(EntityOwnerService entityOwnerService, BudgetRetrievalService budgetRetrievalService) : base(entityOwnerService)
        {
            this._budgetRetrievalService = budgetRetrievalService;
        }
        
        [HttpGet("anchor/{year:int}-{month:int}")]
        public Task<Budget> Get(int month, int year)
        {
            return this._budgetRetrievalService.Calculate(month, year, this.OwnerId);
        }
    }
}