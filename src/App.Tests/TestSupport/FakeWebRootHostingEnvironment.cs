// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : FakeWebRootHostingEnvironment.cs
//  Project         : App.Tests
// ******************************************************************************

using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.FileProviders;

namespace App.Tests.TestSupport
{
    using Microsoft.Extensions.Hosting;

    internal sealed class FakeWebRootHostingEnvironment : IWebHostEnvironment
    {
        /// <inheritdoc />
        public string EnvironmentName
        {
            get => Environments.Production;
            set => throw new System.NotImplementedException();
        }

        /// <inheritdoc />
        public string ApplicationName
        {
            get => throw new System.NotImplementedException();
            set => throw new System.NotImplementedException();
        }

        /// <inheritdoc />
        public string WebRootPath
        {
            get => throw new System.NotImplementedException();
            set => throw new System.NotImplementedException();
        }

        /// <inheritdoc />
        public string ContentRootPath
        {
            get => throw new System.NotImplementedException();
            set => throw new System.NotImplementedException();
        }

        /// <inheritdoc />
        public IFileProvider ContentRootFileProvider
        {
            get => throw new System.NotImplementedException();
            set => throw new System.NotImplementedException();
        }

        /// <inheritdoc />
        public IFileProvider WebRootFileProvider { get; set; }

        /// <inheritdoc />
        public FakeWebRootHostingEnvironment(IFileProvider webRootFileProvider)
        {
            this.WebRootFileProvider = webRootFileProvider;
        }
    }
}
