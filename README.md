
# Smart form wizard

Modern form builder powered by AI

## Live Demo
[convoform.com](https://www.convoform.com)

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

| Workspace Page             | Form Editor                |
|----------------------------|----------------------------|
| ![Workspace Page](https://github.com/growupanand/smart-form-wizard/assets/29487686/624637aa-0541-4e6c-aa2b-9ab54153c607) | ![Form Editor](https://github.com/growupanand/smart-form-wizard/assets/29487686/dca44247-6ca6-4196-9b81-176c77b2fb8a) |

| Form Submit                | View Submission            |
|----------------------------|----------------------------|
| ![Form Submit](https://github.com/growupanand/smart-form-wizard/assets/29487686/25e8a856-5ed1-42a7-980d-6c4535e08664) | ![View Submission](https://github.com/growupanand/smart-form-wizard/assets/29487686/5438bc71-aa71-457e-b4e2-3b7b3ba8e662) |









## Contributing
Feel free to contribute to the development by opening issues, providing feedback, or submitting pull requests. Your input is valuable in making Smart Form Wizard even smarter!
