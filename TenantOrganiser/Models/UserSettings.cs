using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TenantOrganiser
{
    public class UserSettings
    {

        public UserSettings() { }

        [Key]
        public int Id { get; set; }

        // Optional group memberships
        public int? CleaningRotaGroup { get; set; }

        public int? BinCollectionRotaGroup { get; set; }
    }
}