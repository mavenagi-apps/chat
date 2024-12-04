# Maven AGI Chat App

## Getting Started

### Local Development

1. Add the env variables from [Vercel](https://vercel.com/mavenagi/mavenagi-developer-app-production-internal-snowflake-query/settings/environment-variables) into a `.env.local` file:

- MAVENAGI_APP_ID
- MAVENAGI_APP_SECRET

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

[INSTALL.md](INSTALL.md)

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
