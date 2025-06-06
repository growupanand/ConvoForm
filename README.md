# About ConvoForm

[ConvoForm.com](https://www.convoform.com/?utm_source=genai_works&utm_medium=social&utm_campaign=github_launch) transforms traditional forms into interactive conversational experiences, powered by AI for an enhanced user journey. Think Google Forms, but more engaging and intuitive.

#### Features:

- **AI-Powered Form Generation:** Automatically generate comprehensive forms by describing your needs, streamlining the creation process.
- **Real-time Form Editing and Preview:** Edit forms with live changes previewed on the same page, providing immediate feedback.
- **Customizable Submission Pages:** Tailor the submission page with your organization's branding and personalized messages.

#### Learnings

In the course of building it from scratch, I penned down some insightful pieces on Medium reflecting on my journey and learning, I hope these articles provide value to your coding journey.

- [A Comprehensive Guide to Easily Switch from Prisma to Drizzle ORM](https://medium.com/@growupanand/a-comprehensive-guide-to-easily-switch-from-prisma-to-drizzle-orm-c290f8ed8ef3)
- [Transitioning from Monorepo to Turborepo: My Development Journey with ConvoForm.com](https://medium.com/@growupanand/transitioning-from-monorepo-to-turborepo-my-development-journey-with-convoform-com-691b9d19f397)

## Tech Stack

- **Frontend**: [Next.js](https://nextjs.org) for optimized server and client rendering.
- **Backend**: [tRPC](https://trpc.io) for type-safe API development.
- **AI Integration**: [gpt-4o-mini](https://platform.openai.com/docs/models/gpt-4o-mini) for generate form, conversation with user to collect required form information
- **Real-time updates**: [Socket.io](https://socket.io/) for live form progress tracking.

## Community and Support

Join our community on [Discord](https://discord.gg/aeYtKyn2E2) to get support, share feedback, and connect with other users and developers:

## Contributing

Feel free to contribute to the development by opening issues, providing feedback, or submitting pull requests. see the [CONTRIBUTING.md](https://github.com/growupanand/ConvoForm/blob/main/CONTRIBUTING.md) for more details.


## Local Setup

Follow these steps to set up the project locally on your machine.

### Prerequisites

- Make sure you have the following installed:

  - [Node.js](https://nodejs.org/) (v18.17.1 or higher)
  - [pnpm](https://pnpm.io/) (v8.14.3 or higher)
  - [Git](https://git-scm.com/)

- Make sure you [Enable organizations](https://clerk.com/docs/organizations/overview#enable-organizations-in-your-application) in Clerk settings.

- Get your OpenAI key at [OpenAI Dashboard](https://platform.openai.com/api-keys)

### Steps

1. Clone the Repository

```bash
git clone https://github.com/growupanand/ConvoForm.git
cd ConvoForm
```

2. Install Dependencies

```bash
pnpm install
```

3. Configuration environment

Copy the .env.example file to .env file and open the `.env` file and update the necessary environment variables.
```bash
cp .env.example .env
```

4. Setup Database
```bash
pnpm drizzle:apply-migration
```
### Once all steps done

#### Run the Development Server

```bash
pnpm run dev
```

Visit [http://localhost:3000](http://localhost:3000/) in your browser to see the
application.

#### Build for Production

```bash
pnpm run build
```

### Docker Setup

#### Prerequisites
- [Docker](https://www.docker.com/get-started) installed on your machine
- Ensure all the necessary environment variables are set in the `.env` file.

Build and run the Docker container
```bash
docker-compose up --build
```

Visit [http://localhost:3000](http://localhost:3000/) in your browser to see the application running in Docker.

## License

This project is licensed under the [Apache License 2.0 License](https://github.com/growupanand/ConvoForm/blob/main/LICENSE).
