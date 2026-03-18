import React, { useState } from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { ValidationIssue, ValidationSeverity } from 'lib/glbValidation/types'
import './ValidationIssuesPanel.css'

type Props = {
  issues: ValidationIssue[]
}

export const ValidationIssuesPanel: React.FC<Props> = ({ issues }) => {
  const [isExpanded, setIsExpanded] = useState(true)

  if (issues.length === 0) return null

  const errors = issues.filter(i => i.severity === ValidationSeverity.ERROR)
  const warnings = issues.filter(i => i.severity === ValidationSeverity.WARNING)
  const sortedIssues = [...errors, ...warnings]

  const hasErrors = errors.length > 0

  return (
    <div className={`ValidationIssuesPanel ${hasErrors ? 'has-errors' : 'warnings-only'}`}>
      <div className="ValidationIssuesPanel-header" onClick={() => setIsExpanded(!isExpanded)}>
        <span className="ValidationIssuesPanel-title">
          {hasErrors
            ? t('validation_issues_panel.title_errors', { count: errors.length })
            : t('validation_issues_panel.title_warnings', { count: warnings.length })}
        </span>
        <span className="ValidationIssuesPanel-toggle">{isExpanded ? '\u25B2' : '\u25BC'}</span>
      </div>
      {isExpanded && (
        <ul className="ValidationIssuesPanel-list">
          {sortedIssues.map((issue, index) => (
            <li key={index} className={`ValidationIssuesPanel-issue ${issue.severity}`}>
              <span className="ValidationIssuesPanel-icon">{issue.severity === ValidationSeverity.ERROR ? '\u2716' : '\u26A0'}</span>
              <span className="ValidationIssuesPanel-message">{t(issue.messageKey, issue.messageParams || {})}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ValidationIssuesPanel
