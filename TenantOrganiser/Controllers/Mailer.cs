using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Web;

namespace TenantOrganiser.Controllers
{
    public class Mailer : MailMessage
    {

        private SmtpClient _client;

        private static string _fromName = "Tenant Organiser";
        private static string _fromEmail = "notify@tenantorganiser.com";
        private static string _password = "kingedward51";
        private static string _host = "smtpout.europe.secureserver.net";

        public Mailer(string toEmail)
            : base(_fromName + " " +_fromEmail, toEmail)
        {
            _client = new SmtpClient();
            
            _client.Port = 25;
            _client.DeliveryMethod = SmtpDeliveryMethod.Network;
            _client.Host = _host;
            _client.UseDefaultCredentials = false;
            _client.Credentials = new System.Net.NetworkCredential(_fromEmail, _password);
        }

        public void Send()
        {
            _client.Send(this);
        }
    }
}