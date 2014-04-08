using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TenantOrganiser
{
    public class BinRota
    {
        public BinRota() { }

        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }

        public string Colour { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public int FrequencyDays { get; set; }

        public int HouseId { get; set; }

        [ForeignKey("HouseId")]
        public virtual House House { get; set; }
    }
}