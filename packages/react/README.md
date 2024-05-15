# @convoform/react

This package provides a React hook, `useConvoForm`, for creating conversational
forms using ConvoForm.com . It is headless and allows you to integrate
conversational forms into your React applications seamlessly.

## Installation

Install the package with npm or yarn:

```bash
npm install @convoform/react
# or
yarn add @convoform/react
```

## Usage

Import and use the `useConvoForm` hook in your React components:

```javascript
import { useConvoForm } from "@convoform/react";

function MyComponent() {
  const { submitAnswer, currentQuestion, isBusy } = useConvoForm({
    formId: "your-form-id",
  });

  // Use the hook's returned values and functions to build your UI
}
```

### API

`useConvoForm` accepts the following parameters:

- `formId`: The unique identifier for the form generated on convoform.com .
- `onError?`: An optional callback to handle errors.

It returns an object containing:

- `submitAnswer`: Function to submit answer of current question to the form.
- `currentQuestion`: The current question to be displayed.
- `conversationId`: The ID of the current conversation.
- `isBusy`: Boolean indicating if the form is currently processing.
- `isFormSubmissionFinished`: Boolean indicating if the form submission has
  completed.
- `resetForm`: Function to reset the form to its initial state.

## Contributing

Contributions are welcome! Please refer to the repository's issues/PRs sections
to contribute or report a bug.

## License

This project is licensed under the MIT License - see the
[LICENSE](https://github.com/growupanand/ConvoForm/blob/main/LICENSE) file for
details.
