# **App Name**: TripGenius

## Core Features:

- Chat UI: Implement a single-page chat interface with distinct styling for user inputs and AI responses, ensuring a clean and intuitive conversation flow.
- Webhook Integration: Establish a webhook that sends user messages to `https://flowsy.app.n8n.cloud/webhook-test/Trip_Guide` and awaits a response before rendering the AI's reply, ensuring no placeholder messages are used.
- Responsive Design: Design a fully responsive layout that adapts seamlessly to both desktop and mobile devices, ensuring usability and accessibility through keyboard navigation and screen reader compatibility.

## Style Guidelines:

- Primary color: Neutral grays for a clean, modern look.
- Secondary color: Soft blues for AI responses to differentiate from user inputs.
- Accent: Teal (#008080) for interactive elements and highlights.
- Single-column layout for focused interaction, optimized for both desktop and mobile.
- Subtle loading animations to indicate processing when awaiting responses from the webhook.
- Use simple, intuitive icons from shadcn/ui to represent actions and information.