//////////////////////////////////////////////////////////////////////
// ARGUMENTS
//////////////////////////////////////////////////////////////////////

var target = Argument("target", "Default");
var configuration = Argument("configuration", "Release");
var verbosity = Argument<Verbosity>("verbosity", Verbosity.Minimal);

//////////////////////////////////////////////////////////////////////
// PREPARATION
//////////////////////////////////////////////////////////////////////

var baseName = "FinancialApp";
var buildDir = Directory("./build") + Directory(configuration);
var publishDir = Directory("./build/publish");
var assemblyInfoFile = Directory($"./src/{baseName}/Properties") + File("AssemblyInfo.cs");
var nodeEnv = configuration == "Release" ? "production" : "development";
var mainProjectPath = Directory("./src/App");

//////////////////////////////////////////////////////////////////////
// TASKS
//////////////////////////////////////////////////////////////////////

Task("Clean")
    .Does(() => {
    CleanDirectory(buildDir);
	CleanDirectory(publishDir);
	CleanDirectories("./src/App/bin");
	CleanDirectories("./src/App/obj");
});

Task("Rebuild")
	.IsDependentOn("Clean")
	.IsDependentOn("Build");
	
Task("Check-Node-Version")
	.Does(() => {
	try {
		Information("Checking node.js version...");
	
		var processSettings = new ProcessSettings()
			.WithArguments(args => args.Append("--version"))
			.SetRedirectStandardOutput(true)
		;
		
		var process = StartAndReturnProcess("node", processSettings);
		
		process.WaitForExit();
		
		string line = null;
		foreach (var output in process.GetStandardOutput()) {
			line = output;
			Debug(output);
		}
		
		if (String.IsNullOrEmpty(line)) {
			throw new CakeException("Didn't get any output from Node.js");
		}
	
		Version actualVersion = Version.Parse(line.Substring(1));
		Version wantedVersion = new Version(6,1,0);
		
		Information("Got version {0} - we want at least version {1}", actualVersion, wantedVersion);
		if (wantedVersion > actualVersion) {
			throw new CakeException($"Node version {actualVersion} does not satisfy the requirement of Node>={wantedVersion}");
		}
	} catch (Exception e) when (!(e is CakeException)) {
		throw new CakeException("Unable to check Node.js version");
	}
});

Task("Restore-NuGet-Packages")
    .Does(() => {
    DotNetCoreRestore(new DotNetCoreRestoreSettings {
		IgnoreFailedSources = true
	});
});

Task("Generate-MigrationScript")
	.Does(() => {
		string workingDirectory = System.Environment.CurrentDirectory;
		
		// Work around the fact that Cake is not applying the working directory to the dotnet core executable
		try {
			System.Environment.CurrentDirectory = MakeAbsolute(mainProjectPath).ToString();
			
			DotNetCoreTool(
				"App.csproj", 
				"ef", 
				new ProcessArgumentBuilder()
					.Append("migrations")
					.Append("script")
					.Append("-o ../../build/publish/MigrationScript.sql"), 
				new DotNetCoreToolSettings  {
					WorkingDirectory = mainProjectPath, 
					DiagnosticOutput = true
				});
		} finally {
			System.Environment.CurrentDirectory = workingDirectory;
		}
	
	}
	
	);
	//.Does(() => StartProcess());

Task("Set-NodeEnvironment")
	.Does(() => {
		Information("Setting NODE_ENV to {0}", nodeEnv);
		
		System.Environment.SetEnvironmentVariable("NODE_ENV", nodeEnv);
	});

Task("Restore-Node-Packages")
	.IsDependentOn("Check-Node-Version")
	.Does(() => {
	
	var exitCode = 
		StartProcess("cmd", new ProcessSettings()
		.UseWorkingDirectory(mainProjectPath)
		.WithArguments(args => args.Append("/C").AppendQuoted("npm install")));
		
	if (exitCode != 0) {
		throw new CakeException($"'npm install' returned exit code {exitCode} (0x{exitCode:x2})");
	}
});

Task("Build")
	.IsDependentOn("Set-NodeEnvironment")
    .IsDependentOn("Restore-NuGet-Packages")
    .IsDependentOn("Restore-Node-Packages")
    .Does(() => {
        DotNetCoreBuild($"./{baseName}.sln");
});

Task("Run")
    .IsDependentOn("Build")
    .Does(() => {
        DotNetCoreRun($"App.csproj", null, new DotNetCoreRunSettings { WorkingDirectory = "./src/App" });
});

Action<String> PublishSelfContained = (string platform) => {
	Information("Publishing self-contained for platform {0}", platform);

	var settings = new DotNetCorePublishSettings
			 {
				 Configuration = configuration,
				 OutputDirectory = publishDir + Directory(platform),
				 Runtime = platform
			 };
	
        DotNetCorePublish($"./src/App/App.csproj", settings);
};

Task("Publish-Win10")
    .IsDependentOn("Rebuild")
	.IsDependentOn("Generate-MigrationScript")
    .Does(() => PublishSelfContained("win10-x64"));

Task("Publish-Ubuntu")
    .IsDependentOn("Rebuild")
	.IsDependentOn("Generate-MigrationScript")
    .Does(() => PublishSelfContained("ubuntu.14.04-x64"));
	
Task("Publish")
    .IsDependentOn("Publish-Win10")
    .IsDependentOn("Publish-Ubuntu");



//////////////////////////////////////////////////////////////////////
// TASK TARGETS
//////////////////////////////////////////////////////////////////////

Task("None");

Task("Default")
    .IsDependentOn("Build");

//////////////////////////////////////////////////////////////////////
// EXECUTION
//////////////////////////////////////////////////////////////////////

RunTarget(target);