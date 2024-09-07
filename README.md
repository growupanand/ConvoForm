# About ConvoForm

[ConvoForm.com](https://www.convoform.com/?utm_source=genai_works&utm_medium=social&utm_campaign=github_launch)
transforms traditional forms into interactive conversational experiences,
powered by AI for an enhanced user journey. Think Google Forms, but more
engaging and intuitive.

#### Features:


- **AI-Powered Form Generation:** Automatically generate comprehensive forms by describing your needs, streamlining the creation process.
- **Real-time Form Editing and Preview:** Edit forms with live changes previewed on the same page, providing immediate feedback.
- **Customizable Submission Pages:** Tailor the submission page with your organization's branding and personalized messages.

#### Learnings

In the course of building it from scratch, I penned down some insightful pieces on Medium reflecting on my journey and learning, I hope these articles provide value to your coding journey.

- [A Comprehensive Guide to Easily Switch from Prisma to Drizzle ORM](https://medium.com/@growupanand/a-comprehensive-guide-to-easily-switch-from-prisma-to-drizzle-orm-c290f8ed8ef3)
- [Transitioning from Monorepo to Turborepo: My Development Journey with ConvoForm.com](https://medium.com/@growupanand/transitioning-from-monorepo-to-turborepo-my-development-journey-with-convoform-com-691b9d19f397)

## Tech Stack

- **Frontend**: [Next.js](https://nextjs.org) for optimized server and client
  rendering.
- **Backend**: [tRPC](https://trpc.io) for type-safe API development.

- **AI Integration**: [GPT-3.5-Turbo](https://platform.openai.com/docs/models/gpt-3-5-turbo) for dynamic form generation and response analysis.
- **Real-time updates**: [Socket.io](https://socket.io/) for live form progress tracking.

## Local Setup

Follow these steps to set up the project locally on your machine.

### Prerequisites

- Make sure you have the following installed:

  - [Node.js](https://nodejs.org/) (v18.17.1 or higher)
  - [pnpm](https://pnpm.io/) (v8.14.3 or higher)
  - [Git](https://git-scm.com/)

- You need a PostgreSQL database instance to store the customer data. Create a free superbase Postgres instance at [Supabase](https://supabase.com).

- [Clerk](clerk.com) is used for Authentication and User Management. Please make sure you Enable organizations in Organizations Settings within Clerk settings.

- You need a PostgreSQL database instance to store the customer data. Create a
  free superbase Postgres instance at [Supabase](https://supabase.com).

- [Clerk](clerk.com) is used for Authentication and User Management. Please make
  sure you Enable organizations in Organizations Settings within Clerk settings.

- Get your OpenAI key at
  [OpenAI Dashboard](https://platform.openai.com/api-keys)


1. #### Clone the Repository

```bash
git clone https://github.com/growupanand/ConvoForm.git
cd ConvoForm
```

2. #### Install Dependencies

```bash
pnpm install
```

3. #### Configuration environment

   1. Copy the .env.example file to .env.local file.
      ```bash
      cp .env.example .env.local
      ```
   2. Open the `.env.local` file and update the necessary environment variables.
   3. Setup database by running migrations
      ```
      pnpm drizzle:apply-migration
      ```

4. #### Run the Development Server

```bash
pnpm run dev
```

Visit [http://localhost:3000](http://localhost:3000/) in your browser to see the
application.

5. #### Build for Production

```bash
pnpm run build
```

## Community and Support


Join our community on [Discord](https://discord.gg/aeYtKyn2E2) to get support, share feedback, and connect with other users and developers:

## Contributing

Feel free to contribute to the development by opening issues, providing
feedback, or submitting pull requests. see the
[CONTRIBUTING.md](https://github.com/growupanand/ConvoForm/blob/main/CONTRIBUTING.md)
for more details.

## License

This project is licensed under the
[MIT License](https://github.com/growupanand/ConvoForm/blob/main/LICENSE).
