#if SIGNALR
namespace App.Support.Integration {
    using System;
    using System.Reflection;
    using Microsoft.AspNet.SignalR.Infrastructure;
    using Newtonsoft.Json;
    using Newtonsoft.Json.Serialization;

    /// <summary>
    /// Allow camelcase in client code. Adapted from https://github.com/SignalR/SignalR/issues/500#issuecomment-7453751
    /// </summary>
    public sealed class SignalRContractResolver : IContractResolver {
        private readonly Assembly _assembly;
        private readonly IContractResolver _camelCaseContractResolver;
        private readonly IContractResolver _defaultContractSerializer;

        public SignalRContractResolver() {
            this._defaultContractSerializer = new DefaultContractResolver();
            this._camelCaseContractResolver = new CamelCasePropertyNamesContractResolver();
            this._assembly = typeof (Connection).GetTypeInfo().Assembly;
        }

        #region IContractResolver Members

        public JsonContract ResolveContract(Type type) {
            if (type.GetTypeInfo().Assembly.Equals(this._assembly)) {
                return this._defaultContractSerializer.ResolveContract(type);
            }

            return this._camelCaseContractResolver.ResolveContract(type);
        }

        #endregion
    }

    public sealed class SignalRJsonSerializer : JsonSerializer {
        public SignalRJsonSerializer() {
            this.ContractResolver = new SignalRContractResolver();
        }
    }
}

#endif