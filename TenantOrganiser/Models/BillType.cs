using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TenantOrganiser
{
    public class BillType
    {
        public BillType() { }

        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }

        public int ManagerId { get; set; }

        [ForeignKey("ManagerId")]
        public virtual User Manager { get; set; }
    }
}