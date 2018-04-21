namespace App.Support.Mailing {

    public sealed class MailSettings {
        public int Port{get;set;}
        public string HostName{get;set;}
        public string FromAddress{get;set;}
        public string UserName{get;set;}
        public string Password{get;set;}
    }
}