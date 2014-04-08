using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TenantOrganiser
{
    public class HouseJoinRequest
    {
        public HouseJoinRequest() { }


        //[DatabaseGenerated(DatabaseGeneratedOption.None)]
        [Key, Column(Order = 0)]
        public int UserId { get; set; }

        //[DatabaseGenerated(DatabaseGeneratedOption.None)]
        [Key, Column(Order = 1)]
        public int HouseId { get; set; }

        //[Required]
        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        [ForeignKey("HouseId")]
        public virtual House House { get; set; }
    }
}