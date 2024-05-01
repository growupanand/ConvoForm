console.log("Running custom script...");

async function main() {
  //   const conversations = await db.query.conversation.findMany();
  //   for await (const conversationDoc of conversations) {
  //     console.log("current conversation: " + conversationDoc.id);
  //     const fieldsData = conversationDoc.fieldsData;

  //     let updatedFieldsData = fieldsData;

  //     if (fieldsData === null) {
  //       updatedFieldsData = [];
  //     }

  //     if (
  //       fieldsData !== null &&
  //       typeof fieldsData[0] === "object" &&
  //       Array.isArray(fieldsData[0])
  //     ) {
  //       updatedFieldsData = fieldsData[0];
  //     }

  //     console.log("updating conversation: " + conversationDoc.id);
  //     const [updatedSuccess] = await db
  //       .update(conversation)
  //       .set({
  //         fieldsData: updatedFieldsData,
  //       })
  //       .where(eq(conversation.id, conversationDoc.id))
  //       .returning();
  //     if (!updatedSuccess) {
  //       console.error("Failed to update conversation: " + conversationDoc.id);
  //     } else {
  //       console.log("Successfully updated conversation: " + conversationDoc.id);
  //     }
  //   }
  process.exit(0);
}

main();
