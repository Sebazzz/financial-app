// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : SortOrderComparer.cs
//  Project         : App
// ******************************************************************************
namespace App.Models.Domain.Services {
    using System.Collections.Generic;

    internal class SortOrderComparer<T> : Comparer<T> where T : class, IHasSortOrder {
        public static readonly SortOrderComparer<T> Instance = new SortOrderComparer<T>();

        /// <summary>
        /// When overridden in a derived class, performs a comparison of two objects of the same type and returns a value indicating whether one object is less than, equal to, or greater than the other.
        /// </summary>
        /// <returns>
        /// A signed integer that indicates the relative values of <paramref name="x"/> and <paramref name="y"/>, as shown in the following table.Value Meaning Less than zero <paramref name="x"/> is less than <paramref name="y"/>.Zero <paramref name="x"/> equals <paramref name="y"/>.Greater than zero <paramref name="x"/> is greater than <paramref name="y"/>.
        /// </returns>
        /// <param name="x">The first object to compare.</param><param name="y">The second object to compare.</param><exception cref="T:System.ArgumentException">Type <paramref name="T"/> does not implement either the <see cref="T:System.IComparable`1"/> generic interface or the <see cref="T:System.IComparable"/> interface.</exception>
        public override int Compare(T x, T y) {
            if (x == null && y == null) {
                return 0;
            }

            if (x == null) {
                return -1;
            }

            if (y == null) {
                return 1;
            }

            return x.SortOrder - y.SortOrder;
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="T:System.Collections.Generic.Comparer`1"/> class.
        /// </summary>
        private SortOrderComparer() {}
    }

    /// <summary>
    /// Classes implementing this specify an sorting preference
    /// </summary>
    public interface IHasSortOrder {
        int SortOrder { get; }
    }
}