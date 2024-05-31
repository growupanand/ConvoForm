
# Learn.md ✍
# ConvoForm 
[ConvoForm.com](https://www.convoform.com/?utm_source=genai_works&utm_medium=social&utm_campaign=github_launch) transforms traditional forms into interactive conversational experiences, powered by AI for an enhanced user journey. Think Google Forms, but more engaging and intuitive.

#### Features:

- **AI-Powered Form Generation:** Automatically generate comprehensive forms by describing your needs, streamlining the creation process.
- **Real-time Form Editing and Preview:** Edit forms with live changes previewed on the same page, providing immediate feedback.
- **Customizable Submission Pages:** Tailor the submission page with your organization's branding and personalized messages.

# Table of Contents 
1. [Introduction](#introduction-)
2. [Tech Stack](#tech-stack-)
3. [Contributing](#contributing-)
   - [Development Workflow](#development-workflow)
   - [Issue Report Process](#issue-report-process)
   - [Pull Request Process](#pull-request-process-)
4. [Setting Up on your machine](#setting-up-on-your-machine-)
5. . [Resources for Beginners](#resources-for-beginners-)
   - [Basics of Git and GitHub](#basics-of-git-and-github-)
6. [Documentation](#documentation-)
7. . [Code Reviews](#code-reviews-)
8. . [Feature Requests](#feature-requests-)
9. [Spreading the Word](#spreading-the-word-)

## Introduction 🖥️
ConvoForm.com transforms traditional forms into interactive conversational experiences, powered by AI for an enhanced user journey.

## Tech Stack 🗃️
- **Frontend**: [Next.js](https://nextjs.org) for optimized server and client rendering.
- **Backend**: [tRPC](https://trpc.io) for type-safe API development.
- **AI Integration**: [GPT-3.5-Turbo](https://platform.openai.com/docs/models/gpt-3-5-turbo) for dynamic form generation and response analysis.
- **Real-time updates**: [Socket.io](https://socket.io/) for live form progress tracking.

## Contributing 📝
Raise and issue; Get assigned and then work on fixing the issue.
We welcome contributions to ConvoForm! Follow these steps to contribute:

1. **Fork the Repository**: Create your own copy of the repository on your GitHub account.
![image](https://github.com/debangi29/ConvoForm/assets/117537653/6d2e24ee-f64e-44cd-afe2-3425102ae1a0)



2. **Clone the Repository** : Clone the repository for making commits.
   ```bash
   git clone https://github.com/growupanand/ConvoForm.git
   ```
      <br>
   
![image](https://github.com/debangi29/ConvoForm/assets/117537653/4437eec7-1bbb-4699-ab3f-c88f4c44b7b9)

3. **Create a New Branch** for your feature or bug fix: Make a separate branch to work on specific features or fixes and switch to the correct branch.
```bash
git checkout -b <new-branch-name>
```
4. **Make Changes** and commit them: Implement your changes and save them with a descriptive commit message.
```bash
git add .
git commit -m "Describe your changes"
```
5. **Push Your Changes** to your fork: Upload your committed changes to your GitHub fork.
   ```bash
   git push origin <branch_name>
   ```
6. **Create a Pull Request ✅**: Propose your changes to be merged into the original repository.
   <br>
   
![image](https://github.com/debangi29/ConvoForm/assets/117537653/8803d568-0c43-4972-8a95-b9b91b9bf77e)


### Development Workflow
- Always work on a new branch for each issue or feature.
- Keep your branch up to date with the main repository's master branch.
- Write clear and descriptive commit messages.
- Test your changes thoroughly before submitting a pull request.

### Issue Report Process
1. Go to the project's issues section.
2. Select the appropriate template for your issue.
3. Provide a detailed description of the issue.
4. Wait for the issue to be assigned before starting to work on it.

### **Pull Request Process 🚀**

1. Ensure that you have self-reviewed your code.
2. Make sure you have added the proper description for the functionality of the code.
3. I have commented on my code, particularly in hard-to-understand areas.
4. Add screenshots it helps in review.
5. Submit your PR by giving the necesarry information in PR template and hang tight we will review it really soon.

# Setting Up on your machine ⚙️

Follow these steps to set up the project locally on your machine.

### Prerequisites

- Make sure you have the following installed:

    - [Node.js](https://nodejs.org/) (v18.17.1 or higher)
    - [pnpm](https://pnpm.io/) (v8.14.3 or higher)
    - [Git](https://git-scm.com/)

- You need a PostgreSQL database instance to store the customer data. Create a free superbase Postgres instance at [Supabase](https://supabase.com).

- [Clerk](clerk.com) is used for Authentication and User Management. Please make sure you Enable organizations in Organizations Settings within Clerk settings.

- Get your OpenAI key at [OpenAI Dashboard](https://platform.openai.com/api-keys)

- You need a Redis Database from [Upstash](https://upstash.com) (Optional if you want rate limiting)

- Application Performance Monitoring & Error Tracking is done using [Sentry](https://sentry.io)

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

## Resources for Beginners 📚
### Basics of Git and GitHub 📂
- [Forking a Repo](https://help.github.com/en/articles/fork-a-repo)
- [Cloning a Repo](https://help.github.com/en/articles/cloning-a-repository)
- [Creating a Pull Request](https://help.github.com/en/articles/creating-a-pull-request)
- [Getting Started with Git and GitHub](https://guides.github.com/introduction/git-handbook/)
- [Learn GitHub from Scratch](https://www.youtube.com/watch?v=w3jLJU7DT5E)


## 📍Documentation
- Document any significant changes or additions to the codebase.
- Provide clear explanations of the functionality, usage, and any relevant considerations.

## Code Reviews 🔎
- Be open to feedback and constructive criticism from other contributors.
- Participate in code reviews by reviewing and providing feedback.

## Feature Requests 🔥
- Suggest new features or improvements that would enhance the project.

## Spreading the Word 👐
- Share your experience and the project with others.
- Spread the word about the project on social media, developer forums, or any relevant community platforms.

Thank you for contributing to ConvoForm! Together, we can make a significant impact. Happy coding! 🚀
## Don't forget to ⭐ the repository!
