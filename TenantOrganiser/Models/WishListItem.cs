using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TenantOrganiser
{
    public class WishListItem
    {
        public WishListItem() { }

        [Key]
        public int Id { get; set; }

        [Required]
        public string ItemName { get; set; }

        public DateTime? AquiredOn { get; set; }
        
        public int? UserAcquiredId { get; set; }
 
        public int UserAddedId { get; set; }

        public int HouseId { get; set; }

        [ForeignKey("UserAcquiredId")]
        public virtual User UserAcquired { get; set; }

        [ForeignKey("UserAddedId")]
        public virtual User UserAdded { get; set; }

        [ForeignKey("HouseId")]
        public virtual House House { get; set; }
    }
}