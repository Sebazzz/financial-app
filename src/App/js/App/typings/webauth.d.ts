interface Navigator {
    credentials: CredentialsContainer;
}

interface Credential {
    id: string;
    type: string;
}

interface PublicKeyCredential extends Credential {
    rawId: ArrayBuffer;
    response: AuthenticatorResponse;
}

interface AuthenticatorResponse {
    clientDataJSON: ArrayBuffer;
}

interface CredentialsContainer {
    create(options?: CredentialCreationOptions): Promise<Credential | null>;
    get(options?: CredentialRequestOptions): Promise<Credential | null>;
}

interface CredentialCreationOptions {
    publicKey: PublicKeyCredentialCreationOptions;
}

interface CredentialRequestOptions {
    publicKey: PublicKeyCredentialRequestOptions;
}

interface PublicKeyCredentialEntity {
    name: string;
    icon?: string;
}

interface PublicKeyCredentialRpEntity extends PublicKeyCredentialEntity {
    id: string;
}

declare const enum PublicKeyCredentialType {
    'public-key'
}

declare const enum AuthenticatorTransport {
    'usb',
    'nfc',
    'ble',
    'internal'
}

declare const enum COSEAlgorithmIdentifier {
    ED256 = -7,
    RS256 = -257
}

interface PublicKeyCredentialParameters {
    type: PublicKeyCredentialType;
    alg: COSEAlgorithmIdentifier;
}

declare const enum UserVerificationRequirement {
    'required',
    'preferred',
    'discouraged'
}

declare const enum AuthenticatorAttachment {
    'platform',
    'cross-platform'
}

interface AuthenticatorSelectionCriteria {
    authenticatorAttachment?: AuthenticatorAttachment;
    requireResidentKey?: boolean;
    userVerification?: UserVerificationRequirement;
}

type AuthenticationExtensionsClientInputs = any;

interface PublicKeyCredentialCreationOptions {
    rp: PublicKeyCredentialRpEntity;
    user: PublicKeyCredentialUserEntity;

    challenge: BufferSource;
    pubKeyCredParams: PublicKeyCredentialParameters[];

    timeout?: number;
    excludeCredentials?: PublicKeyCredentialDescriptor[];
    authenticatorSelection?: AuthenticatorSelectionCriteria;

    attestation?: AttestationConveyancePreference;
    extensions?: AuthenticationExtensionsClientInputs;
}

declare const enum AttestationConveyancePreference {
    'none',
    'indirect',
    'direct'
}

interface PublicKeyCredentialDescriptor {
    type: PublicKeyCredentialType;
    id: BufferSource;
    transports: AuthenticatorTransport[];
}

interface PublicKeyCredentialUserEntity extends PublicKeyCredentialEntity {
    id: BufferSource;
    displayName: string;
}

interface PublicKeyCredentialRequestOptions {
    challenge: BufferSource;
    timeout?: number;
    rpId?: string;
    allowCredentials?: PublicKeyCredentialDescriptor[];
    userVerification?: UserVerificationRequirement;
    extensions?: AuthenticationExtensionsClientInputs;
}
