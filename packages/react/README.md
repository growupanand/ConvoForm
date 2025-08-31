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
    initializeConversation,
    submitAnswer, 
    resetConversation,
    currentQuestionText,
    conversationState,
    chatStatus,
    progress,
    conversation,
    error
  } = useConvoForm({
    formId: "your-form-id",
    onError: (error) => console.error("Form error:", error),
    onFinish: (conversation) => console.log("Form completed:", conversation)
  });

  // Initialize conversation when component mounts
  useEffect(() => {
    if (conversationState === "idle") {
      initializeConversation();
    }
  }, [conversationState, initializeConversation]);

  // Handle form submission
  const handleSubmit = (answer) => {
    if (conversationState === "inProgress") {
      submitAnswer(answer);
    }
  };

  // Show completion message when form is done
  if (conversationState === "completed") {
    return <div>Thank you for completing the form!</div>;
  }

  // Show loading state during initialization
  if (conversationState === "initializing") {
    return <div>Starting conversation...</div>;
  }

  return (
    <div>
      {/* Progress indicator */}
      <div>Progress: {Math.round(progress * 100)}%</div>
      
      {/* Current question */}
      {currentQuestionText && (
        <div>
          <h3>{currentQuestionText}</h3>
          <input 
            type="text" 
            disabled={chatStatus === "streaming"}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                handleSubmit(e.target.value);
                e.target.value = '';
              }
            }}
          />
          <button 
            onClick={() => {
              const input = document.querySelector('input');
              if (input?.value.trim()) {
                handleSubmit(input.value);
                input.value = '';
              }
            }} 
            disabled={chatStatus === "streaming"}
          >
            {chatStatus === "streaming" ? 'Processing...' : 'Submit'}
          </button>
        </div>
      )}
      
      {/* Error display */}
      {error && (
        <div style={{ color: 'red' }}>
          Error: {error.message}
        </div>
      )}
      
      {/* Reset button */}
      <button onClick={resetConversation}>Start Over</button>
    </div>
  );
}
```

### API

#### Parameters

`useConvoForm` accepts the following parameters:

- `formId`: (Required) The unique identifier for the form generated on convoform.com.
- `apiEndpoint?`: (Optional) Custom API endpoint for the conversation service.
- `onError?`: (Optional) A callback function to handle errors that occur during form processing.
- `onFinish?`: (Optional) A callback function called when the conversation is completed.

#### Return Values

It returns an object containing:

**Methods:**
- `initializeConversation`: Function to create a new conversation and start the form flow.
- `submitAnswer`: Function to submit an answer to the current question. Takes the user's response text as parameter.
- `resetConversation`: Function to reset the conversation to its initial state, allowing users to start over.

**State:**
- `conversation`: The complete conversation object from the database, including all form field responses.
- `currentQuestionText`: The current question text being displayed to the user.
- `conversationState`: Current state of the conversation (`"idle"`, `"initializing"`, `"inProgress"`, or `"completed"`).
- `progress`: A number between 0 and 1 indicating the completion progress of the form.
- `chatStatus`: The streaming status of the chat (`"idle"`, `"submitted"`, `"streaming"`, etc.).
- `messages`: Array of conversation messages exchanged during the session.
- `error`: Any error that occurred during form processing.
- `currentFieldId`: The ID of the current field being processed.

## Example Project

For a complete implementation example, check out the [ConvoForm repository](https://github.com/growupanand/ConvoForm).

## Contributing

Contributions are welcome! Please refer to the repository's issues/PRs sections
to contribute or report a bug. See [CONTRIBUTING.md](https://github.com/growupanand/ConvoForm/blob/main/CONTRIBUTING.md) for more details.

## License

This project is licensed under the MIT License - see the
[LICENSE](https://github.com/growupanand/ConvoForm/blob/main/LICENSE) file for
details.