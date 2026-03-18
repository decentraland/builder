/** Severity level for a GLB validation issue. */
export enum ValidationSeverity {
  /** A blocking issue that prevents the item from being submitted. */
  ERROR = 'error',
  /** A non-blocking issue that the creator should be aware of. */
  WARNING = 'warning'
}

/** A single validation issue found during GLB inspection. */
export type ValidationIssue = {
  /** Machine-readable identifier for the issue (e.g. "TRIANGLE_COUNT_EXCEEDED"). */
  code: string
  /** Whether this issue blocks submission or is informational. */
  severity: ValidationSeverity
  /** i18n translation key used to render a human-readable message. */
  messageKey: string
  /** Interpolation parameters for the translation key. */
  messageParams?: Record<string, string | number>
}

/** Aggregated result of one or more validation checks. */
export type ValidationResult = {
  /** All issues found during validation. */
  issues: ValidationIssue[]
  /** `true` when no issues have ERROR severity. */
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
