using System.Reflection;
using System.Runtime.InteropServices;

[assembly: AssemblyTitle("Financial app")]
[assembly: AssemblyDescription("Financial application")]

#if DEBUG
[assembly: AssemblyConfiguration("DEBUG")]
#else
[assembly: AssemblyConfiguration("RELEASE")]
#endif

[assembly: AssemblyCompany("")]
[assembly: AssemblyProduct("Financial app")]
[assembly: AssemblyCopyright("Copyright © Sebastiaan Dammann and contributors 2014")]
[assembly: AssemblyTrademark("")]
[assembly: AssemblyCulture("")]

[assembly: ComVisible(false)]

[assembly: Guid("236e088f-5658-46b1-85c8-f834e766dddd")]

[assembly: AssemblyVersion("1.0.0.1")]
[assembly: AssemblyFileVersion("1.0.0.1")]
[assembly: AssemblyInformationalVersion("%version%-rev%githash%")]