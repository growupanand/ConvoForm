# ConvoForm

<div align="center">

**Turn Forms into Conversations with AI**

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Discord](https://img.shields.io/discord/1250384369118347376?logo=discord&label=Discord)](https://discord.gg/aeYtKyn2E2)

[Documentation](https://docs.convoform.com)

</div>

## 🚀 About

ConvoForm transforms traditional, static forms into interactive, AI-powered conversational experiences. It makes data collection engaging and intuitive—like talking to a human, but scalable.

### Key Features

- **AI-Powered Generation**: Describe your needs, and let AI build the form for you.
- **Conversational Interface**: Users answer questions in a chat format rather than filling out input fields.
- **Smart Validation**: AI validates responses in real-time and asks follow-up questions if needed.
- **Real-Time Editor**: See changes instantly as you edit your form.
- **Customizable**: Brand your submission pages to match your identity.

## 📚 Documentation

Visit our **[Documentation Site](https://docs.convoform.com)** for detailed guides, concepts, and API references.

- **[Getting Started / Self Hosting](apps/docs/pages/getting-started/self-hosting.mdx)**
- **[Conversation Flow Concepts](apps/docs/pages/concepts/conversation-flow.mdx)**

## 🛠️ Quick Start (Local Development)

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/) (v8+)
- [Docker](https://www.docker.com/) (optional, for self-hosting)

### Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/growupanand/ConvoForm.git
   cd ConvoForm
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Update .env with your API keys (OpenAI, Clerk, etc.)
   # IMPORTANT: generate a strong ENCRYPTION_KEY for securing integration tokens.
   # You can generate one using `openssl rand -hex 32`
   ```

4. **Run Development Server**
   ```bash
   pnpm run dev
   ```

Visit `http://localhost:3000` for the web app and `http://localhost:3001` for the documentation.

## 🤝 Contributing

We love contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is open-sourced under the [Apache License 2.0](LICENSE).

