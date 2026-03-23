export enum ValidationSeverity {
  ERROR = 'error',
  WARNING = 'warning'
}

/** A single validation issue found during GLB inspection. */
export type ValidationIssue = {
  code: string
  severity: ValidationSeverity
  messageKey: string
  messageParams?: Record<string, string | number>
}

/** Aggregated result of one or more validation checks. */
export type ValidationResult = {
  issues: ValidationIssue[]
  isValid: boolean
}

/**
 * Merges multiple {@link ValidationResult}s into a single result.
 * The combined result is valid only when none of the merged issues are errors.
 */
export function combineResults(...results: ValidationResult[]): ValidationResult {
  const issues = results.flatMap(r => r.issues)
  return {
    issues,
    isValid: issues.every(i => i.severity !== ValidationSeverity.ERROR)
  }
}
