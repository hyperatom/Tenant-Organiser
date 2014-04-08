using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TenantOrganiser
{
    public class Message
    {
        public Message() 
        {
            DateSent = DateTime.UtcNow;
        }

        [Key]
        public int Id { get; set; }

        [Required]
        public string Content { get; set; }

        [Required]
        public DateTime DateSent { get; set; }
        
        public int UserId { get; set; }

        public int ConversationId { get; set; }

        [ForeignKey("UserId")]
        public virtual User UserSent { get; set; }

        [ForeignKey("ConversationId")]
        [InverseProperty("Messages")]
        public virtual Conversation Conversation { get; set; }
    }
}