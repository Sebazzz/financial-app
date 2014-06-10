using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Routing;

namespace AngularJSTest
{
    using App_Start;

    public class WebApiApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            MvcConfig.Register();
            GlobalConfiguration.Configure(WebApiConfig.Register);
            BundleConfig.Register();
        }


        protected void Application_Error() {
            
        }
    }
}
