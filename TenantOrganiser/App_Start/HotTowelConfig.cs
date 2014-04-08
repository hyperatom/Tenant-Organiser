using System;
using System.Web.Optimization;
using System.Linq;

[assembly: WebActivator.PostApplicationStartMethod(
    typeof(TenantOrganiser.App_Start.HotTowelConfig), "PreStart")]

namespace TenantOrganiser.App_Start
{
    public static class HotTowelConfig
    {
        public static void PreStart()
        {
            // Add your start logic here
            BundleConfig.RegisterBundles(BundleTable.Bundles);
        }
    }
}