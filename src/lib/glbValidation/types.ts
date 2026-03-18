export enum ValidationSeverity {
  ERROR = 'error',
  WARNING = 'warning'
}

export type ValidationIssue = {
  code: string
  severity: ValidationSeverity
  messageKey: string
  messageParams?: Record<string, string | number>
}

export type ValidationResult = {
  issues: ValidationIssue[]
  isValid: boolean
}

export function combineResults(...results: ValidationResult[]): ValidationResult {
  const issues = results.flatMap(r => r.issues)
  return {
    issues,
    isValid: issues.every(i => i.severity !== ValidationSeverity.ERROR)
  }
}
