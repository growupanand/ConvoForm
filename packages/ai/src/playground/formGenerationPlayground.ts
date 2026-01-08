/**
 * Playground for testing the complete AI form generation flow
 * This script demonstrates the end-to-end process of generating a form using AI
 *
 * Usage: bun run packages/ai/src/playground/formGenerationPlayground.ts
 */

import { generateFormFields } from "../ai-actions/generateFormFields";
import { generateFormMetadata } from "../ai-actions/generateFormMetadata";

// Test scenarios for different form types
const testScenarios = [
  {
    name: "Job Application Form",
    context:
      "This is a job application form for a Senior Full Stack Developer position at our tech startup. We're looking for candidates with 5+ years of experience in React, Node.js, and TypeScript. The role involves building scalable web applications and mentoring junior developers.",
    maxFields: 8,
    templateType: "job-application",
    organizationName: "TechStartup Inc",
  },
  {
    name: "Event Registration Form",
    context:
      "This is a registration form for our annual tech conference 'DevCon 2024'. Attendees need to provide personal information, dietary preferences, session preferences, and accommodation needs. We expect 500+ participants.",
    maxFields: 10,
    templateType: "event-registration",
    organizationName: "DevCon Organizers",
  },
  {
    name: "Customer Feedback Form",
    context:
      "This is a feedback form for our SaaS product users. We want to collect their experience, satisfaction ratings, feature requests, and suggestions for improvement. The form should be quick to fill but comprehensive.",
    maxFields: 6,
    templateType: "feedback-form",
    organizationName: "SaaS Solutions Ltd",
  },
  {
    name: "Lead Generation Form",
    context:
      "This is a lead generation form for our B2B marketing agency. We need to qualify potential clients by collecting company information, budget range, project timeline, and specific marketing needs.",
    maxFields: 7,
    templateType: "lead-generation",
    organizationName: "Marketing Pro Agency",
  },
  {
    name: "Simple Contact Form",
    context:
      "This is a basic contact form for our website visitors. We need essential contact information and their inquiry details so our support team can respond appropriately.",
    maxFields: 4,
    templateType: "contact-form",
    organizationName: "WebCorp Solutions",
  },
];

/**
 * Generates a complete form for a given scenario
 */
async function generateCompleteForm(scenario: (typeof testScenarios)[0]) {
  console.log(`\n🚀 Generating ${scenario.name}...`);
  console.log(`📝 Context: ${scenario.context.substring(0, 100)}...`);
  console.log(`⚡ Max Fields: ${scenario.maxFields}`);

  try {
    // Step 1: Generate form fields
    console.log("\n📋 Step 1: Generating form fields...");
    const startTime = process.hrtime.bigint();
    const fieldsResult = await generateFormFields({
      formContext: scenario.context,
      maxFields: scenario.maxFields,
      templateType: scenario.templateType,
    });
    const endTime = process.hrtime.bigint();
    const deltaTime = Number(endTime - startTime) / 1_000_000; // Convert nanoseconds to milliseconds
    console.log(
      `✅ Generated ${fieldsResult.object.fields.length} fields in ${deltaTime.toFixed(1)}ms`,
    );

    const generatedFields = fieldsResult.object;
    console.log(
      `📊 Confidence: ${(generatedFields.confidence * 100).toFixed(1)}%`,
    );
    console.log(
      `⏱️ estimated completion: ${generatedFields.estimatedCompletionTime} minutes`,
    );

    // Display generated fields
    console.log("\n📋 Generated Fields:");
    generatedFields.fields.forEach((field, index) => {
      console.log(
        `  ${index + 1}. ${field.fieldName} (${field.fieldConfiguration.inputType})`,
      );
      console.log(`     └─ ${field.fieldDescription}`);
      const config = field.fieldConfiguration.inputConfiguration;
      if ("placeholder" in config && config.placeholder) {
        console.log(`     └─ Placeholder: "${config.placeholder}"`);
      }
      if ("options" in config && config.options) {
        console.log(
          `     └─ Options: ${config.options.map((opt: any) => opt.value || opt).join(", ")}`,
        );
      }
      if (
        ("maxLength" in config && config.maxLength) ||
        ("minDate" in config && config.minDate)
      ) {
        console.log(`     └─ Configuration: ${JSON.stringify(config)}`);
      }
    });

    // Step 2: Generate form metadata
    console.log("\n🎨 Step 2: Generating form metadata...");
    const startTime2 = process.hrtime.bigint();
    const metadataResult = await generateFormMetadata({
      formContext: scenario.context,
      selectedFields: generatedFields.fields,
      organizationName: scenario.organizationName,
    });
    const endTime2 = process.hrtime.bigint();
    const deltaTime2 = Number(endTime2 - startTime2) / 1_000_000; // Convert nanoseconds to milliseconds
    console.log(`✅ Generated form metadata in ${deltaTime2.toFixed(1)}ms`);

    const metadata = metadataResult.object;
    console.log("Complete form structure:");
    console.log(`Form Name: ${metadata.formName}`);
    console.log(`Description: ${metadata.formDescription}`);
    console.log(`Welcome Title: ${metadata.welcomeScreenTitle}`);
    console.log(`Welcome Message: ${metadata.welcomeScreenMessage}`);
    console.log(`Ending Message: ${metadata.endingMessage}`);
    console.log(`Completion Time: ${metadata.estimatedCompletionTime} minutes`);
    console.log(`Tags: ${metadata.tags.join(", ")}`);
    return {
      fields: generatedFields,
      metadata: metadata,
      scenario: scenario,
    };
  } catch (error) {
    console.error(`❌ Error generating ${scenario.name}:`, error);
    throw error;
  }
}
/**
 * Tests field generation with various limits
 */
async function testFieldLimits() {
  console.log("\n🔬 Testing Field Generation Limits...");

  const testContext =
    "This is a comprehensive user onboarding form that collects personal information, preferences, skills, experience, goals, and contact details for our platform.";

  const limits = [3, 5, 8, 12];

  for (const limit of limits) {
    console.log(`\n📊 Testing with ${limit} field limit:`);

    try {
      const result = await generateFormFields({
        formContext: testContext,
        maxFields: limit,
      });

      console.log(
        `  Generated: ${result.object.fields.length} fields (requested max: ${limit})`,
      );
      console.log(
        `  Fields: ${result.object.fields.map((f) => f.fieldName).join(", ")}`,
      );
      console.log(
        `  Confidence: ${(result.object.confidence * 100).toFixed(1)}%`,
      );
    } catch (error) {
      console.error(`  ❌ Error with ${limit} fields:`, error);
    }
  }
}

/**
 * Tests different input types generation
 */
async function testInputTypeVariety() {
  console.log("\n🎨 Testing Input Type Variety...");

  const contexts = [
    {
      name: "Data Collection Form",
      context:
        "Comprehensive form requiring text input, email validation, phone numbers, dates, file uploads, multiple choice selections, ratings, and yes/no questions.",
    },
    {
      name: "Survey Form",
      context:
        "Survey form with rating scales, multiple choice questions, single choice selections, and open-ended text responses.",
    },
    {
      name: "Registration Form",
      context:
        "User registration requiring username, email, password confirmation, date of birth, profile picture upload, and agreement checkboxes.",
    },
  ];

  for (const test of contexts) {
    console.log(`\n📋 ${test.name}:`);

    try {
      const result = await generateFormFields({
        formContext: test.context,
        maxFields: 8,
      });

      const inputTypes = result.object.fields.map(
        (f) => f.fieldConfiguration.inputType,
      );
      const uniqueTypes = [...new Set(inputTypes)];

      console.log(`  Input types used: ${uniqueTypes.join(", ")}`);
      console.log(
        `  Type variety: ${uniqueTypes.length}/${inputTypes.length} unique`,
      );

      // Count each type
      const typeCounts = inputTypes.reduce(
        (acc, type) => {
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      console.log(`  Type distribution: ${JSON.stringify(typeCounts)}`);
    } catch (error) {
      console.error("  ❌ Error:", error);
    }
  }
}

/**
 * Performance testing
 */
async function testPerformance() {
  console.log("\n⚡ Performance Testing...");

  const testContext =
    "Customer satisfaction survey form with ratings, feedback, and contact information.";
  const iterations = 3;

  console.log(`Running ${iterations} iterations...`);

  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const startTime = Date.now();

    try {
      await generateFormFields({
        formContext: testContext,
        maxFields: 6,
      });

      const endTime = Date.now();
      const duration = endTime - startTime;
      times.push(duration);

      console.log(`  Iteration ${i + 1}: ${duration}ms`);
    } catch (error) {
      console.error(`  ❌ Iteration ${i + 1} failed:`, error);
    }
  }

  if (times.length > 0) {
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    console.log("\n📊 Performance Results:");
    console.log(`  Average: ${avgTime.toFixed(0)}ms`);
    console.log(`  Min: ${minTime}ms`);
    console.log(`  Max: ${maxTime}ms`);
  }
}

/**
 * Main playground function
 */
async function runPlayground() {
  console.log("🎮 AI Form Generation Playground");
  console.log("================================");

  try {
    // Test all scenarios
    console.log("\n🧪 Testing Different Form Types...");
    for (const scenario of testScenarios) {
      await generateCompleteForm(scenario);
      console.log(`\n${"─".repeat(60)}`);
    }

    // Test field limits
    await testFieldLimits();
    console.log(`\n${"─".repeat(60)}`);

    // Test input type variety
    await testInputTypeVariety();
    console.log(`\n${"─".repeat(60)}`);

    // Performance testing
    await testPerformance();

    console.log("\n✅ Playground completed successfully!");
  } catch (error) {
    console.error("\n❌ Playground failed:", error);
    process.exit(1);
  }
}

// Run playground if this file is executed directly
if (import.meta.main) {
  runPlayground().catch(console.error);
}

export { runPlayground, generateCompleteForm, testScenarios };
