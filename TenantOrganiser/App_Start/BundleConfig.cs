using System;
using System.Web.Optimization;

namespace TenantOrganiser
{
    public class BundleConfig
    {
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.IgnoreList.Clear();
            AddDefaultIgnorePatterns(bundles.IgnoreList);

            // Include third party javascript libraries
            bundles.Add(
              new ScriptBundle("~/scripts/vendor")
                .Include("~/scripts/knockout-{version}.js")
                .Include("~/scripts/jquery-{version}.js")
                .Include("~/scripts/toastr.js")
                .Include("~/scripts/Q.js")
                .Include("~/scripts/breeze.debug.js")
                .Include("~/scripts/bootstrap.js")
                .Include("~/scripts/bootstrap-datepicker.js")
                .Include("~/scripts/moment.js")
                .Include("~/scripts/less-{version}.min.js")
                .Include("~/scripts/sha256.js")
              );

            // Include style sheets
            bundles.Add(
              new StyleBundle("~/Content/styles")
                .Include("~/Content/vendor/ie10mobile.css")
                .Include("~/Content/vendor/bootstrap.css")
                .Include("~/Content/vendor/bootstrap-theme.css")
                .Include("~/Content/vendor/datepicker.css")
                .Include("~/Content/vendor/datepicker3.css")
                .Include("~/Content/vendor/durandal.css")
                .Include("~/Content/vendor/toastr.css")
                .Include("~/Content/css/*.css")
              );
        }

        public static void AddDefaultIgnorePatterns(IgnoreList ignoreList)
        {
            if (ignoreList == null)
            {
                throw new ArgumentNullException("ignoreList");
            }

            ignoreList.Ignore("*.intellisense.js");
            ignoreList.Ignore("*-vsdoc.js");

            //ignoreList.Ignore("*.debug.js", OptimizationMode.WhenEnabled);
            //ignoreList.Ignore("*.min.js", OptimizationMode.WhenDisabled);
            //ignoreList.Ignore("*.min.css", OptimizationMode.WhenDisabled);
        }
    }
}