import type { ValidationIssue } from 'lib/glbValidation/types'

export type Props = {
  issues?: ValidationIssue[]
  /** Show the spinner while the model or the validation results are still loading. */
  isWaiting: boolean
}
