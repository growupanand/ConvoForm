/**
 * Bun test suite for generateFormMetadata function
 * Tests form metadata generation with various scenarios
 */

import { describe, expect, test } from "bun:test";
import type { GeneratedFormField } from "../src/ai-actions/generateFormFields";
import {
  type GenerateFormMetadataParams,
  generateFormMetadata,
} from "../src/ai-actions/generateFormMetadata";

describe("generateFormMetadata", () => {
  test("should generate metadata for job application form", async () => {
    const selectedFields: GeneratedFormField[] = [
      {
        fieldName: "Full Name",
        fieldDescription: "Candidate's legal name",
        fieldConfiguration: {
          inputType: "text",
          inputConfiguration: {
            placeholder: "Enter your full name",
          },
        },
      },
      {
        fieldName: "Email Address",
        fieldDescription: "Professional email for communication",
        fieldConfiguration: {
          inputType: "text",
          inputConfiguration: {
            placeholder: "your.email@example.com",
          },
        },
      },
      {
        fieldName: "Years of Experience",
        fieldDescription: "Total years of professional software development",
        fieldConfiguration: {
          inputType: "text",
          inputConfiguration: {
            maxLength: 2,
          },
        },
      },
      {
        fieldName: "Resume",
        fieldDescription: "Upload your latest resume",
        fieldConfiguration: {
          inputType: "fileUpload",
          inputConfiguration: {
            maxFileSize: 5242880,
            allowedFileTypes: ["application/pdf"],
            maxFiles: 1,
            allowedExtensions: [".pdf"],
          },
        },
      },
      {
        fieldName: "Cover Letter",
        fieldDescription: "Brief introduction and motivation",
        fieldConfiguration: {
          inputType: "text",
          inputConfiguration: {
            isParagraph: true,
            placeholder: "Tell us why you're interested in this position...",
          },
        },
      },
    ];

    const testParams: GenerateFormMetadataParams = {
      formContext:
        "This is a job application form for a Senior Software Engineer position at our tech startup. We're looking for experienced developers with React and Node.js skills.",
      selectedFields,
      organizationName: "TechStartup Inc",
    };

    const result = await generateFormMetadata(testParams);

    expect(result.object).toHaveProperty("formName");
    expect(result.object).toHaveProperty("formDescription");
    expect(result.object).toHaveProperty("welcomeScreenTitle");
    expect(result.object).toHaveProperty("welcomeScreenMessage");
    expect(result.object).toHaveProperty("endingMessage");
    expect(result.object).toHaveProperty("estimatedCompletionTime");
    expect(result.object).toHaveProperty("tags");
    expect(result.object).toHaveProperty("reasoning");

    // Validate string properties
    expect(typeof result.object.formName).toBe("string");
    expect(result.object.formName.length).toBeGreaterThan(0);
    expect(result.object.formName.length).toBeLessThanOrEqual(60);

    expect(typeof result.object.formDescription).toBe("string");
    expect(result.object.formDescription.length).toBeGreaterThan(0);
    expect(result.object.formDescription.length).toBeLessThanOrEqual(200);

    expect(typeof result.object.welcomeScreenTitle).toBe("string");
    expect(result.object.welcomeScreenTitle.length).toBeGreaterThan(0);

    expect(typeof result.object.welcomeScreenMessage).toBe("string");
    expect(result.object.welcomeScreenMessage.length).toBeGreaterThan(0);

    expect(typeof result.object.endingMessage).toBe("string");
    expect(result.object.endingMessage.length).toBeGreaterThan(0);

    // Validate numeric properties
    expect(typeof result.object.estimatedCompletionTime).toBe("number");
    expect(result.object.estimatedCompletionTime).toBeGreaterThan(0);
    expect(result.object.estimatedCompletionTime).toBeLessThanOrEqual(30); // Reasonable max

    // Validate tags
    expect(Array.isArray(result.object.tags)).toBe(true);
    expect(result.object.tags.length).toBeGreaterThanOrEqual(3);
    expect(result.object.tags.length).toBeLessThanOrEqual(5);

    // Tags should include relevant keywords
    const tagsString = result.object.tags.join(" ").toLowerCase();
    expect(tagsString).toMatch(/job|application|employment|career|hiring/);

    console.log("Generated job application metadata:", {
      formName: result.object.formName,
      estimatedTime: result.object.estimatedCompletionTime,
      tags: result.object.tags,
    });
  }, 15000);

  test("should generate metadata for contact form", async () => {
    const selectedFields: GeneratedFormField[] = [
      {
        fieldName: "Name",
        fieldDescription: "Your full name",
        fieldConfiguration: {
          inputType: "text",
          inputConfiguration: {},
        },
      },
      {
        fieldName: "Email",
        fieldDescription: "Your email address",
        fieldConfiguration: {
          inputType: "text",
          inputConfiguration: {
            placeholder: "your@email.com",
          },
        },
      },
      {
        fieldName: "Subject",
        fieldDescription: "What is this regarding?",
        fieldConfiguration: {
          inputType: "text",
          inputConfiguration: {},
        },
      },
      {
        fieldName: "Message",
        fieldDescription: "Your message or inquiry",
        fieldConfiguration: {
          inputType: "text",
          inputConfiguration: {
            isParagraph: true,
          },
        },
      },
    ];

    const testParams: GenerateFormMetadataParams = {
      formContext:
        "Simple contact form for customer inquiries and support requests.",
      selectedFields,
      organizationName: "CustomerCare Solutions",
    };

    const result = await generateFormMetadata(testParams);

    // Should generate appropriate metadata for contact form
    expect(result.object.formName.toLowerCase()).toMatch(
      /contact|inquiry|support|help/,
    );
    expect(result.object.estimatedCompletionTime).toBeGreaterThan(0);
    expect(result.object.estimatedCompletionTime).toBeLessThanOrEqual(10); // Contact forms should be quick

    // Tags should be relevant to contact/support
    const tagsString = result.object.tags.join(" ").toLowerCase();
    expect(tagsString).toMatch(
      /contact|support|inquiry|customer|communication/,
    );

    // Welcome message should be welcoming
    expect(result.object.welcomeScreenMessage.toLowerCase()).toMatch(
      /welcome|contact|help|reach/,
    );

    // Ending message should set expectations
    expect(result.object.endingMessage.toLowerCase()).toMatch(
      /thank|response|contact|back/,
    );

    console.log("Generated contact form metadata:", {
      formName: result.object.formName,
      welcomeTitle: result.object.welcomeScreenTitle,
      estimatedTime: result.object.estimatedCompletionTime,
    });
  }, 15000);

  test("should handle minimal field set", async () => {
    const selectedFields: GeneratedFormField[] = [
      {
        fieldName: "Email",
        fieldDescription: "Your email address",
        fieldConfiguration: {
          inputType: "text",
          inputConfiguration: {
            placeholder: "your@email.com",
          },
        },
      },
    ];

    const testParams: GenerateFormMetadataParams = {
      formContext: "Newsletter signup form",
      selectedFields,
    };

    const result = await generateFormMetadata(testParams);

    // Should still generate complete metadata even with minimal fields
    expect(result.object.formName.length).toBeGreaterThan(0);
    expect(result.object.formDescription.length).toBeGreaterThan(0);
    expect(result.object.welcomeScreenTitle.length).toBeGreaterThan(0);
    expect(result.object.welcomeScreenMessage.length).toBeGreaterThan(0);
    expect(result.object.endingMessage.length).toBeGreaterThan(0);

    // Should be very quick for single field
    expect(result.object.estimatedCompletionTime).toBeLessThanOrEqual(2);

    // Tags should be relevant to newsletter
    const tagsString = result.object.tags.join(" ").toLowerCase();
    expect(tagsString).toMatch(/newsletter|subscribe|email|signup/);

    console.log("Generated newsletter signup metadata:", {
      formName: result.object.formName,
      estimatedTime: result.object.estimatedCompletionTime,
      tags: result.object.tags,
    });
  }, 15000);

  test("should generate appropriate completion time estimates", async () => {
    const shortFormFields: GeneratedFormField[] = [
      {
        fieldName: "Name",
        fieldDescription: "Your name",
        fieldConfiguration: {
          inputType: "text",
          inputConfiguration: {},
        },
      },
      {
        fieldName: "Rating",
        fieldDescription: "Rate our service",
        fieldConfiguration: {
          inputType: "rating",
          inputConfiguration: {
            maxRating: 5,
            requireConfirmation: false,
            iconType: "STAR",
          },
        },
      },
    ];

    const longFormFields: GeneratedFormField[] = [
      {
        fieldName: "Personal Information",
        fieldDescription: "Detailed personal information",
        fieldConfiguration: {
          inputType: "text",
          inputConfiguration: {
            isParagraph: true,
          },
        },
      },
      {
        fieldName: "Work History",
        fieldDescription: "Complete work history",
        fieldConfiguration: {
          inputType: "text",
          inputConfiguration: {
            isParagraph: true,
          },
        },
      },
      {
        fieldName: "References",
        fieldDescription: "Professional references",
        fieldConfiguration: {
          inputType: "text",
          inputConfiguration: {
            isParagraph: true,
          },
        },
      },
      {
        fieldName: "Portfolio",
        fieldDescription: "Upload your portfolio",
        fieldConfiguration: {
          inputType: "fileUpload",
          inputConfiguration: {
            allowedFileTypes: ["application/pdf", "image/jpeg"],
            maxFileSize: 5242880,
            maxFiles: 1,
            allowedExtensions: [".pdf", ".jpg", ".jpeg"],
          },
        },
      },
      {
        fieldName: "Cover Letter",
        fieldDescription: "Detailed cover letter",
        fieldConfiguration: {
          inputType: "text",
          inputConfiguration: {
            isParagraph: true,
          },
        },
      },
    ];

    const shortFormResult = await generateFormMetadata({
      formContext: "Quick feedback form",
      selectedFields: shortFormFields,
    });

    const longFormResult = await generateFormMetadata({
      formContext: "Comprehensive application form",
      selectedFields: longFormFields,
    });

    // Short form should have lower completion time
    expect(shortFormResult.object.estimatedCompletionTime).toBeLessThan(
      longFormResult.object.estimatedCompletionTime,
    );

    // Long form should account for complex fields
    expect(longFormResult.object.estimatedCompletionTime).toBeGreaterThan(5);

    console.log("Completion time estimates:", {
      shortForm: shortFormResult.object.estimatedCompletionTime,
      longForm: longFormResult.object.estimatedCompletionTime,
    });
  }, 20000);

  test("should incorporate organization name appropriately", async () => {
    const selectedFields: GeneratedFormField[] = [
      {
        fieldName: "Name",
        fieldDescription: "Your name",
        fieldConfiguration: {
          inputType: "text",
          inputConfiguration: {},
        },
      },
      {
        fieldName: "Interest",
        fieldDescription: "What interests you?",
        fieldConfiguration: {
          inputType: "text",
          inputConfiguration: {},
        },
      },
    ];

    const testParams: GenerateFormMetadataParams = {
      formContext: "Interest form for our services",
      selectedFields,
      organizationName: "Acme Corporation",
    };

    const result = await generateFormMetadata(testParams);

    // Organization name might appear in welcome or ending message
    const allText = [
      result.object.welcomeScreenMessage,
      result.object.endingMessage,
      result.object.formDescription,
    ]
      .join(" ")
      .toLowerCase();

    // Should reference the organization in some way
    expect(allText).toMatch(/acme|corporation|we|our|us/);

    console.log("Generated metadata with organization:", {
      formName: result.object.formName,
      hasOrgReference: allText.includes("acme"),
      welcomeMessage: result.object.welcomeScreenMessage,
    });
  }, 15000);

  test("should generate professional and consistent tone", async () => {
    const selectedFields: GeneratedFormField[] = [
      {
        fieldName: "Business Name",
        fieldDescription: "Your company name",
        fieldConfiguration: {
          inputType: "text",
          inputConfiguration: {},
        },
      },
      {
        fieldName: "Industry",
        fieldDescription: "Your industry sector",
        fieldConfiguration: {
          inputType: "multipleChoice",
          inputConfiguration: {
            options: [
              { value: "Technology" },
              { value: "Healthcare" },
              { value: "Finance" },
              { value: "Education" },
              { value: "Other" },
            ],
            allowMultiple: false,
          },
        },
      },
      {
        fieldName: "Requirements",
        fieldDescription: "Your specific requirements",
        fieldConfiguration: {
          inputType: "text",
          inputConfiguration: {
            isParagraph: true,
          },
        },
      },
    ];

    const testParams: GenerateFormMetadataParams = {
      formContext: "Business consultation request form for enterprise clients",
      selectedFields,
      organizationName: "Professional Consulting Group",
    };

    const result = await generateFormMetadata(testParams);

    // All text should maintain professional tone
    const allText = [
      result.object.formName,
      result.object.formDescription,
      result.object.welcomeScreenTitle,
      result.object.welcomeScreenMessage,
      result.object.endingMessage,
    ].join(" ");

    // Should not contain casual language
    expect(allText.toLowerCase()).not.toMatch(
      /hey|hi there|awesome|cool|super/,
    );

    // Should contain professional language
    expect(allText.toLowerCase()).toMatch(
      /professional|business|consultation|service|assistance/,
    );

    console.log("Professional tone test:", {
      formName: result.object.formName,
      welcomeTitle: result.object.welcomeScreenTitle,
      tone: "professional",
    });
  }, 15000);
});
