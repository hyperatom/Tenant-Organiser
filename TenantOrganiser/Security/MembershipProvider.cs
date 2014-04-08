using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using WebMatrix.WebData;

namespace TenantOrganiser.Security
{
    public class MembershipProvider : SimpleMembershipProvider
    {
        public override bool ValidateUser(string email, string password)
        {
            try
            {
                User user = new TenantOrganiserDbContext().Users.Where(u => u.Email == email && u.Password == password).SingleOrDefault();

                if (user != null)
                    return true;
            }
            catch(Exception)
            {
                // Exception thrown so user does not exist
                return false;
            }

            // If we get this far, a user was not found
            return false;
        }
    }
}