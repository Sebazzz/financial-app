// ******************************************************************************
//  © 2018 Sebastiaan Dammann | damsteen.nl
// 
//  File:           : PublicKeyCredentialParameters.cs
//  Project         : App
// ******************************************************************************

namespace App.Models.DTO.WebAuthn {
    using System.Runtime.Serialization;

    [DataContract]
    public class PublicKeyCredentialParameters {
        public static PublicKeyCredentialParameters ES256 = new PublicKeyCredentialParameters {
            // External authenticators support the ES256 algorithm

            Type = "public-key",

            Algorithm = -7
        };

        public static PublicKeyCredentialParameters ES384 = new PublicKeyCredentialParameters {
            Type = "public-key",

            Algorithm = -35
        };

        public static PublicKeyCredentialParameters ES512 = new PublicKeyCredentialParameters {
            Type = "public-key",

            Algorithm = -36
        };

        public static PublicKeyCredentialParameters RS1 = new PublicKeyCredentialParameters {
            Type = "public-key",

            Algorithm = -65535
        };

        public static PublicKeyCredentialParameters RS256 = new PublicKeyCredentialParameters {
            // Windows Hello supports the RS256 algorithm

            Type = "public-key",

            Algorithm = -257
        };

        public static PublicKeyCredentialParameters RS384 = new PublicKeyCredentialParameters {
            Type = "public-key",

            Algorithm = -258
        };

        public static PublicKeyCredentialParameters RS512 = new PublicKeyCredentialParameters {
            Type = "public-key",

            Algorithm = -259
        };

        public static PublicKeyCredentialParameters PS256 = new PublicKeyCredentialParameters {
            Type = "public-key",

            Algorithm = -37
        };

        public static PublicKeyCredentialParameters PS384 = new PublicKeyCredentialParameters {
            Type = "public-key",

            Algorithm = -38
        };

        public static PublicKeyCredentialParameters PS512 = new PublicKeyCredentialParameters {
            Type = "public-key",

            Algorithm = -39
        };

        [DataMember(Name = "type")]
        public string Type { get; set; }

        [DataMember(Name = "alg")]
        public int Algorithm { get; set; }
    }
}