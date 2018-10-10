// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : AccountType.cs
//  Project         : App
// ******************************************************************************
namespace App.Models.Domain.Services {
    using System.Runtime.Serialization;

    [DataContract]
    public enum AccountType {
        [DataMember]
        Invalid = 0,

        [DataMember]
        BankAccount,

        [DataMember]
        SavingsAccount
    }
}