using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TenantOrganiser
{
    public class CleaningLog
    {
        public CleaningLog() { }

        [Key]
        public int Id { get; set; }

        [Required]
        public DateTime Date { get; set; }

        public int CleaningRotaId { get; set; }

        [Required]
        public int RotaGroup { get; set; }

        [ForeignKey("CleaningRotaId")]
        public virtual CleaningRota CleaningRota { get; set; }
    }
}