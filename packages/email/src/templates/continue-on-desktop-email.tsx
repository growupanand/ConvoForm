import { Heading } from "@react-email/components";

import {
  CONTINUE_ON_DESKTOP_SUBJECT,
  CONTINUE_ON_DESKTOP_URL,
} from "../continueOnDesktop";
import { Button } from "../ui/button";
import { Layout } from "../ui/layout";
import { Text } from "../ui/text";

export function ContinueOnDesktopEmail() {
  return (
    <Layout preview={CONTINUE_ON_DESKTOP_SUBJECT}>
      <Heading
        style={{
          color: "#111827",
          fontSize: "24px",
          fontWeight: 700,
          lineHeight: "32px",
          margin: "0 0 16px",
        }}
      >
        Your workspace is ready
      </Heading>
      <Text>
        ConvoForm turns a static form into a conversation people actually finish.
      </Text>
      <Button href={CONTINUE_ON_DESKTOP_URL} style={{ margin: "8px 0 24px" }}>
        Open ConvoForm
      </Button>
      <Text>Create your first form in 2 minutes</Text>
    </Layout>
  );
}
