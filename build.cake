#addin nuget:?package=Cake.Compression&version=0.1.4
#addin nuget:?package=SharpZipLib

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
	
void CheckToolVersion(string name, string executable, string argument, Version wantedVersion) {
	try {
		Information($"Checking {name} version...");
	
		var processSettings = new ProcessSettings()
			.WithArguments(args => args.Append("/C").AppendQuoted(executable + " " + argument))
			.SetRedirectStandardOutput(true)
		;
		
		var process = StartAndReturnProcess("cmd", processSettings);
		
		process.WaitForExit();
		
		string line = null;
		foreach (var output in process.GetStandardOutput()) {
			line = output;
			Debug(output);
		}
		
		if (String.IsNullOrEmpty(line)) {
			throw new CakeException("Didn't get any output from " + executable);
		}
	
		Version actualVersion = Version.Parse(line.Trim('v'));
		
		Information("Got version {0} - we want at least version {1}", actualVersion, wantedVersion);
		if (wantedVersion > actualVersion) {
			throw new CakeException($"{name} version {actualVersion} does not satisfy the requirement of {name}>={wantedVersion}");
		}
	} catch (Exception e) when (!(e is CakeException)) {
		throw new CakeException($"Unable to check {name} version. Please check whether {name} is available in the current %PATH%.", e);
	}
}
	
Task("Check-Node-Version")
	.Does(() => {
	CheckToolVersion("node.js", "node", "--version", new Version(6,1,0));
});

Task("Check-Yarn-Version")
	.Does(() => {
	CheckToolVersion("yarn package manager", "yarn", "--version", new Version(1,3,2));
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
	.IsDependentOn("Check-Yarn-Version")
	.Does(() => {
	
	int exitCode;
	
	Information("Trying to restore packages using yarn");
	
	exitCode = 
			StartProcess("cmd", new ProcessSettings()
			.UseWorkingDirectory(mainProjectPath)
			.WithArguments(args => args.Append("/C").AppendQuoted("yarn --production=false --frozen-lockfile --non-interactive")));
		
	if (exitCode != 0) {
		throw new CakeException($"'yarn' returned exit code {exitCode} (0x{exitCode:x2})");
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

void PublishSelfContained(string platform, string folder) {
	Information("Publishing self-contained for platform {0}", platform);

	var settings = new DotNetCorePublishSettings
			 {
				 Configuration = configuration,
				 OutputDirectory = publishDir + Directory(folder ?? platform),
				 Runtime = platform
			 };
	
        DotNetCorePublish($"./src/App/App.csproj", settings);
}

Task("Build-MailTemplates")
	.IsDependentOn("Restore-Node-Packages")
	.IsDependentOn("Set-NodeEnvironment")
	.Does(() => {
		var exitCode = 
			StartProcess("cmd", new ProcessSettings()
			.UseWorkingDirectory(mainProjectPath)
			.WithArguments(args => args.Append("/C").AppendQuoted("yarn run build-mailtemplates")));
		
		if (exitCode != 0) {
			throw new CakeException($"'yarn run build-mailtemplates' returned exit code {exitCode} (0x{exitCode:x2})");
		}
	});

Task("Run-Webpack")
	.IsDependentOn("Restore-Node-Packages")
	.IsDependentOn("Set-NodeEnvironment")
	.Does(() => {
		var exitCode = 
			StartProcess("cmd", new ProcessSettings()
			.UseWorkingDirectory(mainProjectPath)
			.WithArguments(args => args.Append("/C").AppendQuoted("yarn run build")));
		
		if (exitCode != 0) {
			throw new CakeException($"'yarn run build' returned exit code {exitCode} (0x{exitCode:x2})");
		}
	});

Task("Publish-Common")
	.Description("Internal task - do not use")
    .IsDependentOn("Rebuild")
    .IsDependentOn("Generate-MigrationScript")
	.IsDependentOn("Run-Webpack")
	.IsDependentOn("Build-MailTemplates");

var windowsAllPublishTask = Task("Publish-Windows");

void WindowsPublishTask(string taskId, string versionId, string description) {
	string internalTaskName = $"Publish-Windows-Core-{taskId}";
	string taskName = $"Publish-Windows-{taskId}";

	Task(internalTaskName)
		.Description("Internal task - do not use")
		.IsDependentOn("Publish-Common")
		.Does(() => PublishSelfContained(versionId, $"{versionId}/app"));

	var output = publishDir + File($"financial-app-{versionId}.zip");
	Task(taskName)
		.IsDependentOn(internalTaskName)
		.Description($"Publish for {description}, output to {output}")
		.Does(() => {
		   ZipCompress(publishDir + Directory($"{versionId}/"), output);
		});
	
	windowsAllPublishTask.IsDependentOn(taskName);
}

WindowsPublishTask("10-x64", "win10-x64", "Windows 10 / Windows Server 2016 64-bit");

var ubuntuAllPublishTask = Task("Publish-Ubuntu");

void UbuntuPublishTask(string taskId, string versionId, string description) {
	string internalTaskName = $"Publish-Ubuntu-Core-{taskId}";
	string taskName = $"Publish-Ubuntu-{taskId}";

	Task(internalTaskName)
		.Description("Internal task - do not use")
		.IsDependentOn("Publish-Common")
		.Does(() => PublishSelfContained(versionId, $"{versionId}/app"));

	var output = publishDir + File($"financial-app-{versionId}.tar.gz");
	Task(taskName)
		.IsDependentOn(internalTaskName)
		.Description($"Publish for {description}, output to {output}")
		.Does(() => {
		   CopyFile(File("./tools/launchscripts/ubuntu/launch"), publishDir + File($"{versionId}/launch"));
		   CopyFile(File("./tools/launchscripts/ubuntu/launch.conf"), publishDir + File($"{versionId}/launch.conf.example"));
		   GZipCompress(publishDir + Directory($"{versionId}/"), output);
		});
	
	ubuntuAllPublishTask.IsDependentOn(taskName);
}

UbuntuPublishTask("14.04-x64", "ubuntu.14.04-x64", "Ubuntu 14.04 64-bit");
UbuntuPublishTask("16.10-x64", "ubuntu.16.10-x64", "Ubuntu 16.10/17.04 64-bit");
//UbuntuPublishTask("16.10-x64-ngen", "ubuntu.16.10-x64-corert", "Ubuntu 16.10/17.04 64-bit - experimental ahead-of-time compiled version");

Task("Publish")
    .IsDependentOn("Publish-Windows")
    .IsDependentOn("Publish-Ubuntu");

Task("Test-JS")
    .IsDependentOn("Run-Webpack")
    .Description("Test javascript front-end code")
    .Does(() => {
		var exitCode = 
			StartProcess("cmd", new ProcessSettings()
			.UseWorkingDirectory(mainProjectPath)
			.WithArguments(args => args.Append("/C").AppendQuoted("yarn run test")));
		
		if (exitCode != 0) {
			throw new CakeException($"'yarn run test' returned exit code {exitCode} (0x{exitCode:x2})");
		}
	});

Task("Test")
    .IsDependentOn("Test-JS")
    .Description("Run all tests");

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