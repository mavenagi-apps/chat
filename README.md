# Maven AGI Chat Widget

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

### Local Development

1. Add the env variables from [Vercel](https://vercel.com/mavenagi/mavenagi-developer-app-production-internal-snowflake-query/settings/environment-variables) into a `.env.local` file:
* MAVENAGI_APP_ID
* MAVENAGI_APP_SECRET

2. Install dependencies:
```bash
pnpm install
```

3. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

The project uses a monorepo structure managed with pnpm workspaces:

- `packages/widget`: The core chat widget (built with Vite)
- `packages/components`: Reusable React components
- `packages/ui`: Base UI components and utilities

## Widget Integration

### Basic Implementation

Add the following to your HTML:

```html
<script src="https://chat-v2.onmaven.app/js/widget.js" defer></script>
<script>
addEventListener("load", function () {
  Maven.ChatWidget.load({
    orgFriendlyId: "your-org-id",
    agentFriendlyId: "your-agent-id",
    bgColor: "#00202b",
  })
});
</script>
```

### Configuration Options

```typescript
interface WidgetConfig {
  envPrefix?: string;              // Environment prefix for API endpoints
  bgColor?: string;               // Widget background color
  textColor?: string;             // Widget text color (default: 'white')
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

## Internationalization

The widget supports multiple languages through `next-intl`. Currently supported languages:

- English (en)
- Spanish (es)
- French (fr)
- Italian (it)

### Adding New Languages

1. Create a new translation file in `messages/<locale>.json`
2. Follow the existing structure in other language files
3. Messages are organized by feature:

```json
{
  "chat": {
    "ChatPage": {
      "default_welcome_message": "Your translated message",
      // ... other translations
    }
  }
}
```

4. Update the `PERMITTED_LOCALES` constant in `i18n.ts`

## Building the Widget

The widget is built using Vite and outputs a UMD bundle:

```bash
cd packages/widget
pnpm build
```

This creates `public/js/widget.js` which can be served from your Next.js application.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
