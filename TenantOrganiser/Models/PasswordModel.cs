using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace TenantOrganiser.Models
{
    public class PasswordModel
    {
        [Required, MinLength(8, ErrorMessage = "Password must be 8 or more characters.")]
        public string Password { get; set; }
    }
}