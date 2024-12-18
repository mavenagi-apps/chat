# Introduction

This guide provides instructions for surfacing Maven AGI Chat via the JavaScript widget.

# Prerequisites

- Install the `chat` app via Agent Designer
  - Navigate to the Agent Designer [dashboard](https://app.mavenagi.com/dashboard)
  - Select `Apps` \> `App Directory` \> `Browse & Install`
  - Install the official `Chat V2` app (created by Maven AGI)
  - Provide the required settings, including the logo URL and brand color hex code

# Deploying the App Via JS Widget

1. Update the Content Security Protocol to allow content from `chat.onmaven.app`.
2. Launch the \`widget.js\` script on the host site.

```
<script src='https://chat.onmaven.app/js/widget.js' defer></script>
```

3. Initialize the widget and provide configuration settings:

```javascript
addEventListener("load", function () {
  Maven.ChatWidget.load({
    orgFriendlyId: "replace-with-org-id",
    agentFriendlyId: "replace-with-agent-id",
    bgColor: "#004f32",
    signedUserData: "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9...",
  });
});
```

NOTE: The ID values for the organization and agent are the plain-text versions.

## Configuration Options

```typescript
interface WidgetConfig {
  bgColor?: string; // Widget background color
  textColor?: string; // Widget text color (default: 'white')
  horizontalPosition?: "left" | "right"; // Widget position (default: 'right')
  verticalPosition?: "top" | "bottom"; // Widget position (default: 'bottom')
  signedUserData: string;
  orgFriendlyId: string; // Required: Your organization ID
  agentFriendlyId: string; // Required: Your agent ID
  signedUserData?: string; // See below
}
```

NOTE: The ID values for the organization and agent are the plain-text versions.

## Encrypting and Signing User Data

When integrating Maven's widget, you'll need to securely transmit user data using a two-step process: signing and encryption. First, configure your app settings by adding your encryption secret and public key during the app installation. Then, implement a server-side function similar to this example:

```typescript
import { SignJWT, EncryptJWT } from "jose";

async function secureUserData(
  userData: Record<string, string> & {
    id: string;
    firstName: string;
    lastName: string;
  } & (
      | { email: string; phoneNumber?: string }
      | { email?: string; phoneNumber: string }
    ),
) {
  // 1. Sign the user data with your private key (ES256 algorithm)
  const signedJWT = await new SignJWT(userData)
    .setProtectedHeader({ alg: "ES256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(yourPrivateKey);

  // 2. Encrypt the signed JWT using your encryption secret
  const encryptedJWT = await new EncryptJWT({ jwt: signedJWT })
    .setProtectedHeader({ alg: "dir", enc: "A128CBC-HS256" })
    .encrypt(base64url.decode(encryptionSecret));

  return encryptedJWT;
}
```

NOTE: User data must include:

- `firstName`
- `lastName`
- `id`
- One of:
  - `phoneNumber`
  - `email`
