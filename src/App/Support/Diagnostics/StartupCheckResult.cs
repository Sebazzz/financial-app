// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : StartupCheckResult.cs
//  Project         : App
// ******************************************************************************
namespace App.Support.Diagnostics {
    using System;


    internal sealed class StartupCheckResult {
        public Exception Exception { get; }

        public string Message { get; }

        public bool IsSuccess { get; }

        private StartupCheckResult(bool isSuccess, string message, Exception exception) {
            this.IsSuccess = isSuccess;
            this.Message = message;
            this.Exception = exception;
        }

        public static StartupCheckResult Success(string message = null) => new StartupCheckResult(true, message, null);
        public static StartupCheckResult Failure(string message, Exception exception = null) => new StartupCheckResult(false, message, exception);
    }
}