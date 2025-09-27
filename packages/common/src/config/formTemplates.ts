import { z } from "zod/v4";

/**
 * Schema for form template definition
 */
export const formTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  context: z.string(),
});

export type FormTemplate = z.infer<typeof formTemplateSchema>;

/**
 * Predefined form templates for AI generation
 * These templates provide context and examples for common use cases
 */
export const FORM_TEMPLATES: FormTemplate[] = [
  {
    id: "job-application",
    name: "Job Application Form",
    description:
      "Collect applications for open positions with candidate information, experience, and documents",
    context:
      "This is a job application form for collecting candidate information including personal details, work experience, skills, and resume upload. We need to gather comprehensive information to evaluate potential candidates.",
  },
  {
    id: "contact-form",
    name: "Contact Form",
    description: "Simple contact form for customer inquiries",
    context:
      "This is a contact form where customers can reach out to us. We need their name, email, phone number, and message describing their inquiry or request.",
  },
  {
    id: "feedback-form",
    name: "Product Feedback Form",
    description: "Gather customer feedback and suggestions",
    context:
      "This is a feedback form where customers can submit their thoughts about our product. We want to collect their contact information, product usage details, satisfaction rating, and detailed feedback.",
  },
  {
    id: "event-registration",
    name: "Event Registration Form",
    description: "Registration form for events and workshops",
    context:
      "This is an event registration form where participants can sign up for our events. We need their personal information, dietary preferences, accessibility needs, and payment details.",
  },
  {
    id: "lead-generation",
    name: "Lead Generation Form",
    description: "Capture sales leads and potential customers",
    context:
      "This is a lead generation form to capture potential customers. We need company information, contact details, budget range, project timeline, and specific requirements.",
  },
  {
    id: "survey-form",
    name: "Customer Survey Form",
    description: "Comprehensive customer survey for insights and analytics",
    context:
      "This is a customer survey form to gather insights about customer satisfaction, preferences, and demographics. We want to collect rating scales, multiple choice responses, and open-ended feedback.",
  },
  {
    id: "support-ticket",
    name: "Support Request Form",
    description: "Technical support and help desk request form",
    context:
      "This is a support ticket form where customers can report issues and request help. We need to collect their contact information, problem description, urgency level, and relevant system details.",
  },
];

/**
 * Get template by ID
 */
export function getTemplateById(id: string): FormTemplate | undefined {
  return FORM_TEMPLATES.find((template) => template.id === id);
}

/**
 * Get all available templates
 */
export function getAllTemplates(): FormTemplate[] {
  return FORM_TEMPLATES;
}
