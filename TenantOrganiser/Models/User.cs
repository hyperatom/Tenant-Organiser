using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TenantOrganiser
{
    public class User
    {
        public User() 
        {
            EmailNotifications = false;
        }

        [Key]
        public int Id { get; set; }

        [Required]
        public string FirstName { get; set; }

        [Required]
        public string LastName { get; set; }

        [Required]
        
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }

        public bool EmailNotifications { get; set; }

        // User may choose not to have a display picture
        public string DisplayPictureFileName { get; set; }

        // User doesn't have to join a house
        public int? HouseId { get; set; }

        [ForeignKey("HouseId")]
        public virtual House House { get; set; }
        
        public int UserSettingsId { get; set; }

        [ForeignKey("UserSettingsId")]
        public virtual UserSettings UserSettings { get; set; }

        //[InverseProperty("Users")]
        //public virtual ICollection<ConversationGroup> ConversationGroups { get; set; }
    }
}