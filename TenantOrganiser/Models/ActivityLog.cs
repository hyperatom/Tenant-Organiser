using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TenantOrganiser
{
    public class Log
    {
        public static string BIN_ROTA = "Bin Rota";
        public static string CLEANING_ROTA = "Cleaning Rota";
        public static string MESSAGE = "Message";
        public static string TENANT = "Tenant";
        public static string BILL = "Bill";
        public static string WISH_LIST = "Wish List";
    }

    public class ActivityLog
    {
        public ActivityLog() 
        {
            Date = DateTime.Now;
        }

        [Key]
        public int Id { get; set; }

        // Can be null because we want to maintain a log if
        // user deletes their account
        public int? UserId { get; set; }

        public int HouseId { get; set; }

        // E.g. Bill/Wish List/Message/Cleaning Rota/Bin Rota
        // Used to generate related icons in feed
        [Required]
        public string LogName { get; set; }

        // E.g. "Paid the water bill"
        [Required]
        public string ActionMessage { get; set; }

        [Required]
        public DateTime Date { get; set; }

        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        [ForeignKey("HouseId")]
        public virtual House House { get; set; }
    }
}