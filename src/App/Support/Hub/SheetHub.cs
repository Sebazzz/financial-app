// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : SheetHub.cs
//  Project         : App
// ******************************************************************************
#if SIGNALR
namespace App.Support.Hub {
    using System;
    using System.Collections.Generic;
    using System.Diagnostics.CodeAnalysis;
    using System.Linq;
    using System.Threading;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.SignalR;
    using System.Runtime.Serialization;
    using Models.DTO;

    public class SheetHub : Hub {
        private readonly GroupContext<SheetContext> _sheetContext = new GroupContext<SheetContext>(_ => new SheetContext(), c=>c.Clone());

        public override Task OnConnected() {
            this.Groups.Add(this.Context.ConnectionId, this.GetGroupName());

            return base.OnConnected();
        }

        public override Task OnDisconnected(bool stopCalled) {
            string group = this.GetGroupName();

            // trash just everything, if the client reconnects the updates will be added back
            this._sheetContext.Alter(group, s => s.Delete(this.Context.ConnectionId));

            return base.OnDisconnected(stopCalled);
        }

        public override Task OnReconnected() {
            this.Groups.Add(this.Context.ConnectionId, this.GetGroupName());

            return base.OnReconnected();
        }

        public int AddOrUpdatePendingSheetEntry(RealtimeSheetEntry input) {
            string group = this.GetGroupName();

            input.ConnectionId = input.ConnectionId;
            input.UserName = this.Context.User.Identity.Name;

            if (input.RealtimeId == 0) {
                this._sheetContext.Alter(group, s => s.Add(input));
            } else {
                this._sheetContext.Alter(group, s => s.Update(input));
            }

            this.Clients.OthersInGroup(group).pushSheetEntry(input);

            return input.RealtimeId;
        }

        public void FinalizeSheetEntry(FinalizeSheetEntry input) {
            string group = this.GetGroupName();
            
            this._sheetContext.Alter(group, s => s.Remove(input.RealtimeId));

            this.Clients.OthersInGroup(group).finalizeSheetEntry(input);
        }


        private string GetGroupName() {
            return GroupName(this.Context.QueryString["sheetId"]);
        }

        public static string GroupName(string sheetId) {
            return $"Sheet{sheetId}";
        }
    }

    public sealed class SheetContext {
        private readonly HashSet<RealtimeSheetEntry> _entries;
        private int _uniqueId = 0;

        public SheetContext() {
            this._entries = new HashSet<RealtimeSheetEntry>();
        }

        private SheetContext(IEnumerable<RealtimeSheetEntry> entries) {
            // note: not a deep copy, but since the items inside 
            // will not be modified it is 'good enough'
            this._entries = new HashSet<RealtimeSheetEntry>(entries);
        }

        public void Add(RealtimeSheetEntry entry) {
            int newId = Interlocked.Increment(ref this._uniqueId);

            entry.RealtimeId = newId;

            this._entries.Add(entry);
        }

        public void Update(RealtimeSheetEntry entry) {
            this._entries.RemoveWhere(x => x.RealtimeId == entry.RealtimeId);
            this._entries.Add(entry);
        }

        public void Delete(string connectionId) {
            this._entries.RemoveWhere(x => x.ConnectionId == connectionId);
        }

        public IEnumerable<RealtimeSheetEntry> GetAll() {
            return this._entries.OrderBy(x => x.SortOrder);
        }

        public void Remove(int id) {
            this._entries.RemoveWhere(x => x.RealtimeId == id);
        }

        public SheetContext Clone() {
            return new SheetContext(this._entries);
        }
    }

    [DataContract]
    public sealed class RealtimeSheetEntry : SheetEntry, IEquatable<RealtimeSheetEntry> {
        [DataMember]
        public int RealtimeId { get; set; }

        [DataMember]
        public string ConnectionId { get; set; }
        [DataMember]
        public string UserName { get; set; }

        public bool Equals(RealtimeSheetEntry other) {
            if (ReferenceEquals(null, other)) {
                return false;
            }
            if (ReferenceEquals(this, other)) {
                return true;
            }
            return this.RealtimeId == other.RealtimeId;
        }

        public override bool Equals(object obj) {
            if (ReferenceEquals(null, obj)) {
                return false;
            }
            if (ReferenceEquals(this, obj)) {
                return true;
            }
            return obj is RealtimeSheetEntry && this.Equals((RealtimeSheetEntry) obj);
        }

        [SuppressMessage("ReSharper", "NonReadonlyMemberInGetHashCode", Justification = "RealTimeId needs to be r/w for serialization")]
        public override int GetHashCode() {
            return this.RealtimeId;
        }
    }

    [DataContract]
    public sealed class FinalizeSheetEntry : SheetEntry {
        [DataMember]
        public int RealtimeId { get; set; }
        [DataMember]
        public bool Committed { get; set; }
    }
}
#endif