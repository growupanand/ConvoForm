# @convoform/react

This package provides a React hook, `useConvoForm`, for creating conversational
forms using ConvoForm.com. It is headless and allows you to integrate
conversational forms into your React applications seamlessly, providing an engaging
user experience compared to traditional forms.

## Installation

Install the package with your preferred package manager:

```bash
npm install @convoform/react
# or
yarn add @convoform/react
# or 
pnpm install @convoform/react
```

## Usage

Import and use the `useConvoForm` hook in your React components:

```jsx
import { useConvoForm } from "@convoform/react";

function ConversationalForm() {
  const { 
    submitAnswer, 
    currentQuestion, 
    isBusy,
    conversationId,
    isFormSubmissionFinished,
    resetForm
  } = useConvoForm({
    formId: "your-form-id",
    onError: (error) => console.error("Form error:", error)
  });

  // Handle form submission
  const handleSubmit = (answer) => {
    submitAnswer(answer);
  };

  // Show completion message when form is done
  if (isFormSubmissionFinished) {
    return <div>Thank you for completing the form!</div>;
  }

  return (
    <div>
      {currentQuestion && (
        <div>
          <h3>{currentQuestion.text}</h3>
          <input 
            type="text" 
            disabled={isBusy}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e.target.value)}
          />
          <button onClick={() => handleSubmit(/* answer */)} disabled={isBusy}>
            {isBusy ? 'Processing...' : 'Submit'}
          </button>
        </div>
      )}
      <button onClick={resetForm}>Start Over</button>
    </div>
  );
}
```

### API

#### Parameters

`useConvoForm` accepts the following parameters:

- `formId`: (Required) The unique identifier for the form generated on convoform.com.
- `onError?`: (Optional) A callback function to handle errors that occur during form processing.

#### Return Values

It returns an object containing:

- `submitAnswer`: Function to submit the answer to the current question. Takes the user's response as parameter.
- `currentQuestion`: The current question object to be displayed, including question text and any additional metadata.
- `conversationId`: A unique identifier for the current conversation session.
- `isBusy`: Boolean indicating if the form is currently processing a response.
- `isFormSubmissionFinished`: Boolean indicating if the form submission has been completed.
- `resetForm`: Function to reset the form to its initial state, allowing users to start over.

## Example Project

For a complete implementation example, check out the [ConvoForm repository](https://github.com/growupanand/ConvoForm).

## Contributing

Contributions are welcome! Please refer to the repository's issues/PRs sections
to contribute or report a bug. See [CONTRIBUTING.md](https://github.com/growupanand/ConvoForm/blob/main/CONTRIBUTING.md) for more details.

## License

This project is licensed under the MIT License - see the
[LICENSE](https://github.com/growupanand/ConvoForm/blob/main/LICENSE) file for
details.