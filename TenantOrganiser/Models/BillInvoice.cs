using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TenantOrganiser
{
    public class BillInvoice
    {
        public BillInvoice() 
        {
            Recipients = new List<InvoiceRecipient>();
        }

        [Key]
        public int Id { get; set; }

        [Required]
        public DateTime DueDate { get; set; }

        public int BillTypeId { get; set; }

        [ForeignKey("BillTypeId")]
        public virtual BillType BillType { get; set; }

        [InverseProperty("BillInvoice")]
        public virtual ICollection<InvoiceRecipient> Recipients { get; set; }
    }
}