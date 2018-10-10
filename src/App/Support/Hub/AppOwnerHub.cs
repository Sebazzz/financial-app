// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : AppOwnerHub.cs
//  Project         : App
// ******************************************************************************
namespace App.Support.Hub
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using Api.Extensions;
    using Microsoft.AspNetCore.SignalR;
    using Microsoft.Extensions.Logging;

    public sealed class AppOwnerHub : Hub
    {
        private static readonly GroupContext<HashSet<string>> GroupContext = new GroupContext<HashSet<string>>(_ => new HashSet<string>(), s => new HashSet<string>(s));

        private readonly ILogger _logger;

        private string GetGroupName()
        {
            return "AppOwner" + this.Context.User.Identity.GetOwnerGroupId();
        }

        public override async Task OnConnectedAsync()
        {
            string identity = this.Context.User.Identity.Name;
            string group = this.GetGroupName();

            this._logger.LogInformation("Connection incoming, user: {0} of group {1}", identity, group);

            await this.Clients.Group(group).SendAsync("pushClient", this.Context.User.Identity.Name);
            await this.Groups.AddToGroupAsync(this.Context.ConnectionId, group);

            string[] groupInfo = GroupContext.AlterAndReturn(group, s => s.Add(identity)).ToArray();
            await this.Clients.Client(this.Context.ConnectionId).SendAsync("setInitialClientList", new object[] { groupInfo });

            await base.OnConnectedAsync();
        }

        /// <summary>
        /// Called when a connection disconnects from this hub gracefully or due to a timeout.
        /// </summary>
        public override async Task OnDisconnectedAsync(Exception exception)
        {
            string identity = this.Context.User.Identity.Name;
            string group = this.GetGroupName();

            this._logger.LogInformation("Disconnecting, user: {0} of group {1}", identity, group);

            GroupContext.AlterAndReturn(group, s => s.Remove(group));
            await this.Clients.Group(group).SendAsync("popClient", this.Context.User.Identity.Name);

            await base.OnDisconnectedAsync(exception);
        }

        public AppOwnerHub(ILoggerFactory loggerFactory)
        {
            this._logger = loggerFactory.CreateLogger<AppOwnerHub>();
        }
    }
}
