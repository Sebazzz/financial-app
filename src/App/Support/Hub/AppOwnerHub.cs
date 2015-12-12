#if SIGNALR
namespace App.Support.Hub {
    using System.Threading.Tasks;
    using Api.Extensions;
    using Microsoft.AspNet.SignalR;

    public sealed class AppOwnerHub : Hub {
        private string GetGroupName() {
            return "AppOwner" + this.Context.User.Identity.GetOwnerGroupId();
        }

        public override Task OnConnected() {
            string group = this.GetGroupName();

            this.Groups.Add(this.Context.ConnectionId, group);

            this.Clients.OthersInGroup(group).pushClient(this.Context.User.Identity.Name);

            return base.OnConnected();
        }

        /// <summary>
        /// Called when a connection disconnects from this hub gracefully or due to a timeout.
        /// </summary>
        /// <param name="stopCalled">true, if stop was called on the client closing the connection gracefully;
        ///             false, if the connection has been lost for longer than the
        ///             <see cref="!:Configuration.IConfigurationManager.DisconnectTimeout"/>.
        ///             Timeouts can be caused by clients reconnecting to another SignalR server in scaleout.
        ///             </param>
        /// <returns>
        /// A <see cref="T:System.Threading.Tasks.Task"/>
        /// </returns>
        public override Task OnDisconnected(bool stopCalled) {
            string group = this.GetGroupName();

            this.Clients.OthersInGroup(group).popClient(this.Context.User.Identity.Name);

            return base.OnDisconnected(stopCalled);
        }

        /// <summary>
        /// Called when the connection reconnects to this hub instance.
        /// </summary>
        /// <returns>
        /// A <see cref="T:System.Threading.Tasks.Task"/>
        /// </returns>
        public override Task OnReconnected() {
            string group = this.GetGroupName();

            this.Clients.OthersInGroup(group).pushClient(this.Context.User.Identity.Name);

            return base.OnReconnected();
        }
    }
}

#endif