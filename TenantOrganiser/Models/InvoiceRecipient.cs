using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TenantOrganiser
{
    public class InvoiceRecipient
    {
        public InvoiceRecipient() { }

        [Key, Column(Order = 0)]
        public int UserId { get; set; }

        [Key, Column(Order = 1)]
        public int BillInvoiceId { get; set; }

        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        [ForeignKey("BillInvoiceId")]
        public virtual BillInvoice BillInvoice { get; set; }

        [Required]
        public double Amount { get; set; }

        [Required]
        public bool Paid { get; set; }
    }
}