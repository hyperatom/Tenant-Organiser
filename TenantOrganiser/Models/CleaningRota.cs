using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TenantOrganiser
{
    public class CleaningRota
    {
        public CleaningRota() { } 

        // One cleaning rota per communal area
        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public string Occurance { get; set; }

        public int HouseId { get; set; }

        [ForeignKey("HouseId")]
        public virtual House House { get; set; }

        public virtual ICollection<CleaningLog> CleaningLogs { get; set; }
    }
}