using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TenantOrganiser
{
    public class House
    {
        public House() 
        {
            //Tenants = new List<User>();
        }

        [Key]
        public int Id { get; set; }

        [Required]
        public string HouseName { get; set; }

        [Required]
        public string HouseCode { get; set; }

        //public virtual ICollection<CommunalArea> CommunalAreas { get; set; }

        //public virtual ICollection<User> Tenants { get; set; }
    }
}