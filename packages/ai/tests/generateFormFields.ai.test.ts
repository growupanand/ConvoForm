/**
 * Bun test suite for generateFormFields function
 * Tests form field generation with various scenarios
 */

import { describe, expect, test } from "bun:test";
import {
  type GenerateFormFieldsParams,
  generateFormFields,
  generatedFormFieldSchema,
} from "../src/ai-actions/generateFormFields";

describe("generateFormFields", () => {
  test("should generate form fields for job application context", async () => {
    const testParams: GenerateFormFieldsParams = {
      formContext:
        "This is a job application form for a software engineer position. We need to collect candidate information including personal details, work experience, technical skills, and resume upload. We require at least 3 years of experience in React and Node.js.",
      maxFields: 6,
      templateType: "job-application",
    };

    const result = await generateFormFields(testParams);

    expect(result.object).toHaveProperty("formName");
    expect(result.object).toHaveProperty("formDescription");
    expect(result.object).toHaveProperty("fields");
    expect(result.object).toHaveProperty("reasoning");
    expect(result.object).toHaveProperty("confidence");
    expect(result.object).toHaveProperty("estimatedCompletionTime");

    // Validate form metadata
    expect(typeof result.object.formName).toBe("string");
    expect(result.object.formName.length).toBeGreaterThan(0);
    expect(typeof result.object.formDescription).toBe("string");
    expect(result.object.formDescription.length).toBeGreaterThan(0);

    // Validate fields array
    expect(Array.isArray(result.object.fields)).toBe(true);
    expect(result.object.fields.length).toBeGreaterThan(0);
    expect(result.object.fields.length).toBeLessThanOrEqual(6);

    // Validate each field structure
    for (const field of result.object.fields) {
      expect(() => generatedFormFieldSchema.parse(field)).not.toThrow();
      expect(field.fieldName.length).toBeGreaterThan(0);
      expect(field.fieldDescription.length).toBeGreaterThan(0);
      expect(field.fieldConfiguration).toHaveProperty("inputType");
      expect(field.fieldConfiguration).toHaveProperty("inputConfiguration");
    }

    // Validate confidence and timing
    expect(result.object.confidence).toBeGreaterThanOrEqual(0);
    expect(result.object.confidence).toBeLessThanOrEqual(1);
    expect(result.object.estimatedCompletionTime).toBeGreaterThan(0);

    console.log("Generated job application form:", {
      name: result.object.formName,
      fields: result.object.fields.map(
        (f) => `${f.fieldName} (${f.fieldConfiguration.inputType})`,
      ),
      confidence: result.object.confidence,
    });
  }, 15000);

  test("should generate form fields for contact form context", async () => {
    const testParams: GenerateFormFieldsParams = {
      formContext:
        "This is a contact form where customers can reach out to us. We need their name, email, phone number, subject, and message describing their inquiry or request.",
      maxFields: 5,
      templateType: "contact-form",
    };

    const result = await generateFormFields(testParams);

    expect(result.object.fields.length).toBeGreaterThan(0);
    expect(result.object.fields.length).toBeLessThanOrEqual(5);

    // Should include text field for email (as email is handled as text field now)
    const hasEmailField = result.object.fields.some(
      (field) =>
        field.fieldConfiguration.inputType === "text" &&
        field.fieldName.toLowerCase().includes("email"),
    );
    expect(hasEmailField).toBe(true);

    // Should include text field for message
    const hasMessageField = result.object.fields.some(
      (field) =>
        field.fieldConfiguration.inputType === "text" &&
        field.fieldName.toLowerCase().includes("message"),
    );
    expect(hasMessageField).toBe(true);

    console.log("Generated contact form:", {
      name: result.object.formName,
      fields: result.object.fields.map(
        (f) => `${f.fieldName} (${f.fieldConfiguration.inputType})`,
      ),
    });
  }, 15000);

  test("should respect maxFields limit", async () => {
    const testParams: GenerateFormFieldsParams = {
      formContext:
        "This is a comprehensive survey form about user preferences, demographics, usage patterns, satisfaction levels, and feedback across multiple categories.",
      maxFields: 3,
    };

    const result = await generateFormFields(testParams);

    expect(result.object.fields.length).toBeLessThanOrEqual(3);
    expect(result.object.fields.length).toBeGreaterThan(0);

    console.log("Generated limited survey form:", {
      name: result.object.formName,
      fieldCount: result.object.fields.length,
      fields: result.object.fields.map((f) => f.fieldName),
    });
  }, 15000);

  test("should generate different input types appropriately", async () => {
    const testParams: GenerateFormFieldsParams = {
      formContext:
        "This is an event registration form where participants can sign up for our workshop. We need their name, email, phone, age, dietary preferences from multiple options, attendance confirmation (yes/no), and any special requirements.",
      maxFields: 8,
    };

    const result = await generateFormFields(testParams);

    const inputTypes = result.object.fields.map(
      (field) => field.fieldConfiguration.inputType,
    );
    const uniqueTypes = new Set(inputTypes);

    // Should have variety of input types
    expect(uniqueTypes.size).toBeGreaterThan(1);

    // Check for expected types based on context - email should be text field
    const hasTextForEmail = result.object.fields.some(
      (field) =>
        field.fieldConfiguration.inputType === "text" &&
        field.fieldName.toLowerCase().includes("email"),
    );
    expect(hasTextForEmail).toBe(true);

    // Should have at least one multipleChoice field for dietary preferences
    const hasChoiceField = inputTypes.includes("multipleChoice");
    expect(hasChoiceField).toBe(true);

    console.log("Generated event registration form:", {
      name: result.object.formName,
      inputTypes: [...uniqueTypes],
      fields: result.object.fields.map(
        (f) => `${f.fieldName} (${f.fieldConfiguration.inputType})`,
      ),
    });
  }, 15000);

  test("should handle minimal context", async () => {
    const testParams: GenerateFormFieldsParams = {
      formContext:
        "Simple feedback form to collect user opinions about our service.",
      maxFields: 4,
    };

    const result = await generateFormFields(testParams);

    expect(result.object.fields.length).toBeGreaterThan(0);
    expect(result.object.fields.length).toBeLessThanOrEqual(4);
    expect(result.object.formName.length).toBeGreaterThan(0);
    expect(result.object.confidence).toBeGreaterThanOrEqual(0.5); // Should be reasonably confident even with minimal context

    console.log("Generated minimal feedback form:", {
      name: result.object.formName,
      fields: result.object.fields.map((f) => f.fieldName),
      confidence: result.object.confidence,
    });
  }, 15000);

  test("should include proper validation rules", async () => {
    const testParams: GenerateFormFieldsParams = {
      formContext:
        "User registration form requiring username, password, email, age (18+), and profile bio.",
      maxFields: 5,
    };

    const result = await generateFormFields(testParams);

    // Check for fields with configuration (all fields should have this)
    expect(result.object.fields.length).toBeGreaterThan(0);

    // All fields should have proper fieldConfiguration
    for (const field of result.object.fields) {
      expect(field.fieldConfiguration).toHaveProperty("inputType");
      expect(field.fieldConfiguration).toHaveProperty("inputConfiguration");
    }

    // Email field should be text type
    const emailField = result.object.fields.find(
      (field) =>
        field.fieldConfiguration.inputType === "text" &&
        field.fieldName.toLowerCase().includes("email"),
    );
    expect(emailField).toBeDefined();

    // Age field should be text type - validation is now in fieldConfiguration
    const ageField = result.object.fields.find(
      (field) =>
        field.fieldName.toLowerCase().includes("age") &&
        field.fieldConfiguration.inputType === "text",
    );
    expect(ageField).toBeDefined();

    console.log("Generated registration form:", {
      name: result.object.formName,
      fields: result.object.fields.map((f) => ({
        name: f.fieldName,
        type: f.fieldConfiguration.inputType,
      })),
    });
  }, 15000);

  test("should generate consistent results for same input", async () => {
    const testParams: GenerateFormFieldsParams = {
      formContext:
        "Newsletter subscription form collecting email and preferences.",
      maxFields: 3,
    };

    const result1 = await generateFormFields(testParams);
    const result2 = await generateFormFields(testParams);

    // Both should generate valid forms
    expect(result1.object.fields.length).toBeGreaterThan(0);
    expect(result2.object.fields.length).toBeGreaterThan(0);

    // Should respect the field limit
    expect(result1.object.fields.length).toBeLessThanOrEqual(3);
    expect(result2.object.fields.length).toBeLessThanOrEqual(3);

    // Both should include text field for email in newsletter signup
    const hasEmail1 = result1.object.fields.some(
      (f) =>
        f.fieldConfiguration.inputType === "text" &&
        f.fieldName.toLowerCase().includes("email"),
    );
    const hasEmail2 = result2.object.fields.some(
      (f) =>
        f.fieldConfiguration.inputType === "text" &&
        f.fieldName.toLowerCase().includes("email"),
    );
    expect(hasEmail1).toBe(true);
    expect(hasEmail2).toBe(true);

    console.log("Consistency test results:", {
      form1: {
        name: result1.object.formName,
        fieldCount: result1.object.fields.length,
      },
      form2: {
        name: result2.object.formName,
        fieldCount: result2.object.fields.length,
      },
    });
  }, 20000);
});
