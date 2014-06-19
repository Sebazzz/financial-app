namespace App.Models.DTO {
    using System.Runtime.Serialization;

    [DataContract]
    public sealed class InsertId {
        [DataMember(name="id")]
        public int Id { get; set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="T:System.Object"/> class.
        /// </summary>
        public InsertId() {}

        /// <summary>
        /// Initializes a new instance of the <see cref="T:System.Object"/> class.
        /// </summary>
        public InsertId(int id) {
            this.Id = id;
        }

        public static implicit operator InsertId(int id) {
            return new InsertId(id);
        }
    }
}