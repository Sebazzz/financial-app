// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : WebAuthnService.cs
//  Project         : App
// ******************************************************************************
namespace App.Support {
    using System;
    using System.Security.Cryptography;
    using Models.Domain.Identity;
    using Models.DTO.WebAuthn;

    public sealed class WebAuthenticationService : IDisposable {
        private readonly ISiteUrlDetectionService _siteUrlDetectionService;

        private const int ChallengeSize = 32;

        private RandomNumberGenerator _secureRng;

        public WebAuthenticationService(ISiteUrlDetectionService siteUrlDetectionService) {
            this._siteUrlDetectionService = siteUrlDetectionService;

            this._secureRng = RandomNumberGenerator.Create();
        }

        public PublicKeyCredentialCreationOptions CreateRegistration(AppUser appUser) {
            // Create challenge
            byte[] challenge = new byte[ChallengeSize];
            this._secureRng.GetBytes(challenge);

            // Information for relying party information
            Uri uri = new Uri(this._siteUrlDetectionService.GetSiteUrl());

            return new PublicKeyCredentialCreationOptions {
                RelyingParty = new PublicKeyCredentialRpEntity {
                    Name = uri.Host,
                    Id = uri.Host
                },
                User = new PublicKeyCredentialUserEntity {
                    DisplayName = $"{appUser.UserName} [{appUser.Email}]",
                    Name = appUser.UserName,
                    Id = appUser.UserName
                },
                Challenge = challenge,
                PublicKeyCredentialParameters = new[] {
                    PublicKeyCredentialParameters.ES256,
                    PublicKeyCredentialParameters.RS256,
                    PublicKeyCredentialParameters.PS256,
                    PublicKeyCredentialParameters.ES384,
                    PublicKeyCredentialParameters.RS384,
                    PublicKeyCredentialParameters.PS384,
                    PublicKeyCredentialParameters.ES512,
                    PublicKeyCredentialParameters.RS512,
                    PublicKeyCredentialParameters.PS512,
                    PublicKeyCredentialParameters.RS1
                },
            };
        }

        public void Dispose() {
            this._secureRng?.Dispose();
            this._secureRng = null;
        }
    }
}
