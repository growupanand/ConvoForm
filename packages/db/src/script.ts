console.log("Running custom script...");

async function main() {
  // const conversations = await db.query.conversation.findMany();
  // for await (const conversationDoc of conversations) {
  //   console.log("current conversation: " + conversationDoc.id);
  //   const collectedData = conversationDoc.collectedData;

  //   let updatedFieldsData = collectedData;

  //   if (collectedData === null) {
  //     updatedFieldsData = [];
  //   }

  //   updatedFieldsData = updatedFieldsData.map((i) => ({
  //     ...i,
  //     fieldDescription: i.fieldName,
  //   }));

  //   console.log("updating conversation: " + conversationDoc.id);
  //   const [updatedSuccess] = await db
  //     .update(conversation)
  //     .set({
  //       collectedData: updatedFieldsData,
  //     })
  //     .where(eq(conversation.id, conversationDoc.id))
  //     .returning();
  //   if (!updatedSuccess) {
  //     console.error("Failed to update conversation: " + conversationDoc.id);
  //   } else {
  //     console.log("Successfully updated conversation: " + conversationDoc.id);
  //   }
  // }
  process.exit(0);
}

main();
