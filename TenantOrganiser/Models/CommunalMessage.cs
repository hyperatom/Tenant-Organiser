using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TenantOrganiser
{
    public class CommunalMessage
    {
        public CommunalMessage() 
        {
            SentDate = DateTime.UtcNow;
        }

        [Key]
        public int Id { get; set; }

        [Required]
        public string Content { get; set; }

        [Required]
        public DateTime SentDate { get; set; }
        
        public int UserId { get; set; }
        
        public int HouseId { get; set; }

        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        [ForeignKey("HouseId")]
        public virtual House House { get; set; }
    }
}