# Introduction

This guide provides instructions for surfacing Maven AGI Chat via the JavaScript widget.

# Prerequisites

* Install the `chat` app via Agent Designer  
  * Navigate to the Agent Designer [dashboard](https://app.mavenagi.com/dashboard)  
  * Select `Apps` \> `App Directory` \> `Browse & Install`  
  * Install the official `Chat V2` app (created by Maven AGI)  
  * Provide the required settings, including the logo URL and brand color hex code  
* Download the public `widget.js` [script](https://chat-v2.onmaven.app/js/widget.js)

# Deploying the App Via JS Widget

1. Update the Content Security Protocol to allow content from `chat-v2.onmaven.app`.  
2. Upload and launch the \`widget.js\` script on the page you want the chat widget to appear on.

```
<script src='/js/widget.js' defer></script>
```

3. Initialize the widget and provide configuration settings:

```javascript
addEventListener("load", function () {
  Maven.ChatWidget.load({
    orgFriendlyId: "replace-with-org-id",
    agentFriendlyId: "replace-with-agent-id",
    bgColor: "#004f32",
    personalizationData: {
      firstName: "Jane",
      lastName: "Doe",
      userId: "replace-with-end-user-id",
      email: "jane.doe@example.com",
    },
  })
});
```

NOTE: The ID values for the organization and agent are the plain-text versions.

## Configuration Options

```typescript
interface WidgetConfig {
  envPrefix?: string;                     // Environment prefix for API endpoints
  bgColor?: string;                       // Widget background color
  textColor?: string;                     // Widget text color (default: 'white')
  horizontalPosition?: 'left' | 'right';  // Widget position (default: 'right')
  verticalPosition?: 'top' | 'bottom';    // Widget position (default: 'bottom')
  unverifiedUserInfo?: {
    firstName?: string;
    lastName?: string;
    userId?: string;
    email?: string;
    businessName?: string;
  };
  orgFriendlyId: string;          // Required: Your organization ID
  agentFriendlyId: string;        // Required: Your agent ID
}
```

NOTE: The ID values for the organization and agent are the plain-text versions.