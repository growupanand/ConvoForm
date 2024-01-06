
# Smart form wizard

Imagine Google Forms, but supercharged with AI for an improved user experience, Build engaging and interactive forms that are easy to fill and fun to answer.
You can see live demo here - [convoform.com](https://www.convoform.com/).

## Features

- **User-Friendly Interface:** The interface is designed to be user-friendly, ensuring a seamless and efficient form-building experience.

- **Intelligent Field Input:** Creating form fields is made easy; users can provide the necessary information without worrying about specifying exact field names.

- **Dynamic Form Rendering:** The form view page dynamically displays questions based on the provided form summary, eliminating the need for users to predefine every field.
  
- **Customizable Welcome Screen:** Users have the flexibility to personalize the welcome screen that greets users before they start filling out the form, enhancing the user experience.



## Local Setup

Follow these steps to set up the project locally on your machine.

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18.17.1 or higher)
- [npm](https://www.npmjs.com/) (v9.6.4 or higher)
- [Git](https://git-scm.com/)

### Clone the Repository



```bash
git clone https://github.com/growupanand/smart-form-wizard.git
cd smart-form-wizard
```


### Install Dependencies

```bash
npm install
```

### Configuration

 1. Copy the .env.example file to .env file.
	```bash
	cp .env.example .env
	```
2. Open the `.env` file and update the necessary environment variables.

### Run the Development Server

```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000/) in your browser to see the application.

### Build for Production

```bash
npm run build
```
or

To build the project for Vercel deployment, run:
```bash
npm run vercel-build
```

## Screenshots

Here are some screenshots from the app

| Workspace Page                                             | Form Editor                                                                     |
|------------------------------------------------------------|---------------------------------------------------------------------------------|
| ![Workspace page](https://github.com/growupanand/smart-form-wizard/assets/29487686/a854d340-afd6-477f-a402-c7ce3e8c9787) | ![Form editor](https://github.com/growupanand/smart-form-wizard/assets/29487686/f7916db9-eb6a-433f-ac64-a76601dc99c6) |

| Form Submission                                            | View Submissions                                                                |
|------------------------------------------------------------|---------------------------------------------------------------------------------|
| ![Form submission](https://github.com/growupanand/smart-form-wizard/assets/29487686/06874d85-0920-408b-a84a-5970eb7c1819) | ![View Submissions](https://github.com/growupanand/smart-form-wizard/assets/29487686/8b09c79c-bc58-4e80-b5cb-bc9e378c017f) |






## Contributing
Feel free to contribute to the development by opening issues, providing feedback, or submitting pull requests. Your input is valuable in making Smart Form Wizard even smarter!
