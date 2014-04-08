using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TenantOrganiser
{
    public class Conversation
    {
        public Conversation() 
        {
            Messages = new List<Message>();
            ConversationUsers = new List<ConversationUser>();
            DateStarted = DateTime.UtcNow;
        }

        [Key]
        public int Id { get; set; }

        public DateTime? DateStarted { get; set; }

        // A conversation must have recipients
        [Required]
        [InverseProperty("Conversation")]
        public virtual ICollection<ConversationUser> ConversationUsers { get; set; }

        // Messages can be null or empty - initially no messages in conversation
        public virtual ICollection<Message> Messages { get; set; }
    }
}