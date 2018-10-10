// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : GroupContext.cs
//  Project         : App
// ******************************************************************************
namespace App.Support.Hub {
    using System;
    using System.Collections.Concurrent;
    using GroupName=System.String;

    public class GroupContext<TContext> where TContext : class {
        private readonly Func<string, TContext> _contextFactory;
        private readonly Func<TContext, TContext> _cloneFunctor;
        private readonly ConcurrentDictionary<GroupName, TContext> _contextByGroupName;

        public GroupContext(Func<GroupName, TContext> contextFactory, Func<TContext, TContext> cloneFunctor) {
            this._contextFactory = contextFactory;
            this._cloneFunctor = cloneFunctor;
            this._contextByGroupName = new ConcurrentDictionary<string, TContext>();
        }

        public TContext GetContext(GroupName key) {
            TContext ctx = this._contextByGroupName.GetOrAdd(key, this._contextFactory);

            lock (ctx) {
                return this._cloneFunctor.Invoke(ctx);
            }
        }

        public void Alter(GroupName key, Action<TContext> alterFunction) {
            TContext ctx = this._contextByGroupName.GetOrAdd(key, this._contextFactory);

            lock (ctx) {
                alterFunction.Invoke(ctx);
            }
        }

        public TContext AlterAndReturn(GroupName key, Action<TContext> alterFunction) {
            TContext ctx = this._contextByGroupName.GetOrAdd(key, this._contextFactory);

            lock (ctx) {
                alterFunction.Invoke(ctx);
                return this._cloneFunctor.Invoke(ctx);
            }
        }
    }
}