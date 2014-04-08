using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TenantOrganiser
{
    public class CommunalArea
    {
        public CommunalArea() { }

        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }

        public int HouseId { get; set; }
        
        public int? CleaningRotaId { get; set; }

        [ForeignKey("HouseId")]
        public virtual House House { get; set; }

        [ForeignKey("CleaningRotaId")]
        public virtual CleaningRota CleaningRota { get; set; }
    }
}