# Intercom Discord Serverless

A serverless function that forwards Intercom webhooks to Discord.

## Setup

1. Create a Discord webhook in your server
2. Deploy this to Vercel
3. Configure your Intercom webhook to point to your deployed function with the Discord webhook ID and token as query parameters:

```
https://your-vercel-deployment.vercel.app/api/v2?id=WEBHOOK_ID&token=WEBHOOK_TOKEN
```

## Features

- Forwards Intercom conversation events to Discord
- Displays conversation details including:
  - Conversation state and priority
  - Customer information
  - Custom attributes
  - Message content
  - Author details

## Development

```bash
yarn install
yarn d
```

## License

MIT
