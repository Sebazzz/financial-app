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