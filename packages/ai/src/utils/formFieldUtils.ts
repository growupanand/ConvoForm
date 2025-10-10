/**
 * Helper to extract field type from field configuration
 * @param fieldConfig Field configuration object
 * @returns Field type string
 */
export function extractFieldInputType(fieldConfig: any): string | undefined {
  if (!fieldConfig?.fieldConfiguration?.inputType) {
    return undefined;
  }

  return fieldConfig.fieldConfiguration.inputType;
}
