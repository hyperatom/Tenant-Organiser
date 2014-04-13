using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TenantOrganiser
{
    public class CleaningLog
    {
        public CleaningLog() 
        {
            Date = DateTime.Now;
        }

        [Key]
        public int Id { get; set; }

        [Required]
        public DateTime Date { get; set; }
        
        public int UserId { get; set; }

        public int CleaningRotaId { get; set; }

        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        [ForeignKey("CleaningRotaId")]
        public virtual CleaningRota CleaningRota { get; set; }
    }
}