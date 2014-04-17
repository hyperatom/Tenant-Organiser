using System;
using System.Collections.Generic;
using System.Linq;
using System.Transactions;
using System.Web.Mvc;
using System.Web.Security;
using WebMatrix.WebData;
using TenantOrganiser.Filters;
using TenantOrganiser.Models;
using System.Net;
using Newtonsoft.Json.Linq;
namespace TenantOrganiser.Controllers
{
    [Authorize]
    [InitializeSimpleMembership]
    public class AccountController : Controller
    {
        //
        // GET: /Account/Session

        [AllowAnonymous]
        [HttpGet]
        public JsonResult UserSession()
        {
            string email = User.Identity.Name.ToString();

            User loggedInUser = null;

            // If session exists
            if (!String.IsNullOrEmpty(email))
            {
                loggedInUser = new TenantOrganiserDbContext().Users.Where(p => p.Email == email).SingleOrDefault();
                loggedInUser.Password = "";

                // Return logged in user as JSON object
                return Json(loggedInUser, JsonRequestBehavior.AllowGet);
            }

            // If we get this far, no session exists so return false
            return Json(false, JsonRequestBehavior.AllowGet);
        }

        [AllowAnonymous]
        [HttpGet]
        public ActionResult RefreshToken()
        {
            return PartialView("_AntiForgeryToken");
        }

        //
        // POST: /Account/FacebookLogin

        [AllowAnonymous]
        [HttpPost]
        public JsonResult FacebookLogin(string token)
        {
            String data = "";

            try
            {
                WebClient client = new WebClient();
                data = client.DownloadString("https://graph.facebook.com/me?access_token=" + token);
            }
            catch (Exception e)
            {
                return Json(false);
            }

            JObject jArray = JObject.Parse(data);

            // If the token was invalid or the facebook user had no email, return false
            if (jArray["error"] != null || jArray["email"] == null)
            {
                return Json(false);
            }

            // Get facebook user data
            String id = jArray["id"].ToString();
            String email = jArray["email"].ToString();
            String firstName = jArray["first_name"].ToString();
            String lastName = jArray["last_name"].ToString();

            // If email exists in database, set auth cookie
            TenantOrganiserDbContext ctx = new TenantOrganiserDbContext();

            User existingUser = ctx.Users.Where(u => u.Email == email).SingleOrDefault();

            // If user exists in the db but signed up manually
            if (existingUser != null && !existingUser.IsFacebookUser)
                return Json(false);

            // If the email already exists set auth token
            if (existingUser != null)
            {
                FormsAuthentication.SetAuthCookie(email, false);
                return Json(true);
            }

            using (WebClient Client = new WebClient())
            {
                Client.DownloadFile(
                    "https://graph.facebook.com/" + id + "/picture?type=normal",
                    Server.MapPath("~/Content/images/profile_pictures/" + id + ".jpg"));
            }

            // Else register a new account with IsFacebookUser true and empty password
            User newUser = new User
            {
                Email = email,
                Password = "",
                FirstName = firstName,
                LastName = lastName,
                UserSettings = new UserSettings { EmailNotifications = true },
                IsFacebookUser = true,
                DisplayPictureFileName = id.ToString() + ".jpg"
            };

            ctx.Users.Add(newUser);
            ctx.SaveChanges();

            FormsAuthentication.SetAuthCookie(email, false);

            return Json(true);
        }

        [AllowAnonymous]
        [HttpPost]
        public JsonResult Login(string email, string password)
        {
            if (ModelState.IsValid)
            {
                if (WebSecurity.Login(email, password))
                {
                    FormsAuthentication.SetAuthCookie(email, false);

                    return Json(true);
                }
                else
                {
                    ModelState.AddModelError("", "The user name or password provided is incorrect.");
                }
            }

            // If we got this far, something failed
           // return Json(new { errors = GetErrorsFromModelState() });
            return Json(false);
        }

        //
        // POST: /Account/LogOff

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult LogOff()
        {
            WebSecurity.Logout();

            return RedirectToAction("Index", "HotTowel");
        }

        //
        // POST: /Account/ChangePassword

        [HttpPost]
        [ValidateAntiForgeryToken]
        public JsonResult ChangePassword(PasswordModel passwordModel)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    TenantOrganiserDbContext ctx = new TenantOrganiserDbContext();

                    User user = ctx.Users.Where(u => u.Email == User.Identity.Name).SingleOrDefault();

                    user.Password = passwordModel.Password;

                    ctx.SaveChanges();
                }
                catch (Exception e)
                {
                    return Json(new { errors = e });
                }
            }
            else
            {
                return Json(new { errors = GetErrorsFromModelState() });
            }

            // If we get this far, it was successful
            return Json(true);
        }

        //
        // POST: /Account/Register
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public ActionResult Register(RegisterUser user)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    CreateNewUser(user, false);

                    WebSecurity.Login(user.Email, user.Password);

                    FormsAuthentication.SetAuthCookie(user.Email, createPersistentCookie: false);

                    return Json(true);
                }
                catch (MembershipCreateUserException e)
                {
                    ModelState.AddModelError("", ErrorCodeToString(e.StatusCode));
                }
            }

            // If we got this far, something failed
            return Json(new { errors = GetErrorsFromModelState() });
        }

        /// <summary>
        /// Create a new user in the database.
        /// </summary>
        /// <param name="user">Object representing the registering user.</param>
        private static void CreateNewUser(RegisterUser user, bool isFacebookUser)
        {
            TenantOrganiserDbContext ctx = new TenantOrganiserDbContext();

            // If the email already exists
            if (ctx.Users.Any(u => u.Email == user.Email))
            {
                throw new MembershipCreateUserException(MembershipCreateStatus.DuplicateEmail);
            }

            User newUser = new User { 
                Email = user.Email, 
                Password = user.Password, 
                FirstName = user.FirstName, 
                LastName = user.LastName, 
                UserSettings = new UserSettings { EmailNotifications = true },
                IsFacebookUser = isFacebookUser
            };

            ctx.Users.Add(newUser);
            ctx.SaveChanges();
        }

        private IEnumerable<string> GetErrorsFromModelState()
        {
            return ModelState.SelectMany(x => x.Value.Errors.Select(error => error.ErrorMessage));
        }

        private static string ErrorCodeToString(MembershipCreateStatus createStatus)
        {
            // See http://go.microsoft.com/fwlink/?LinkID=177550 for
            // a full list of status codes.
            switch (createStatus)
            {
                case MembershipCreateStatus.DuplicateUserName:
                    return "User name already exists. Please enter a different user name.";

                case MembershipCreateStatus.DuplicateEmail:
                    return "A user name for that e-mail address already exists. Please enter a different e-mail address.";

                case MembershipCreateStatus.InvalidPassword:
                    return "The password provided is invalid. Please enter a valid password value.";

                case MembershipCreateStatus.InvalidEmail:
                    return "The e-mail address provided is invalid. Please check the value and try again.";

                case MembershipCreateStatus.InvalidAnswer:
                    return "The password retrieval answer provided is invalid. Please check the value and try again.";

                case MembershipCreateStatus.InvalidQuestion:
                    return "The password retrieval question provided is invalid. Please check the value and try again.";

                case MembershipCreateStatus.InvalidUserName:
                    return "The user name provided is invalid. Please check the value and try again.";

                case MembershipCreateStatus.ProviderError:
                    return "The authentication provider returned an error. Please verify your entry and try again. If the problem persists, please contact your system administrator.";

                case MembershipCreateStatus.UserRejected:
                    return "The user creation request has been canceled. Please verify your entry and try again. If the problem persists, please contact your system administrator.";

                default:
                    return "An unknown error occurred. Please verify your entry and try again. If the problem persists, please contact your system administrator.";
            }
        }
    }
}