import React, { useState } from 'react'
import classnames from 'classnames'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { ValidationIssue, ValidationSeverity } from 'lib/glbValidation/types'
import styles from './ValidationIssuesPanel.module.css'

/** Props for the {@link ValidationIssuesPanel} component. */
export type Props = {
  /** List of validation issues to display. The panel hides itself when empty. */
  issues: ValidationIssue[]
  /** Whether the list can be collapsed by clicking the header. Defaults to true. */
  collapsible?: boolean
}

/**
 * Panel that displays GLB validation errors and warnings.
 * Errors are listed first, followed by warnings. The panel header shows
 * a summary count. When `collapsible` is true (the default), the list
 * can be toggled open or closed by clicking the header.
 */
export const ValidationIssuesPanel: React.FC<Props> = ({ issues, collapsible = true }) => {
  const [isExpanded, setIsExpanded] = useState(true)

  if (issues.length === 0) return null

  const errors = issues.filter(i => i.severity === ValidationSeverity.ERROR)
  const warnings = issues.filter(i => i.severity === ValidationSeverity.WARNING)
  const sortedIssues = [...errors, ...warnings]

  const hasErrors = errors.length > 0
  const isListVisible = !collapsible || isExpanded

  return (
    <div className={classnames(styles.panel, hasErrors ? styles.hasErrors : styles.warningsOnly)}>
      <div
        className={classnames(styles.header, { [styles.headerCollapsible]: collapsible })}
        onClick={collapsible ? () => setIsExpanded(!isExpanded) : undefined}
      >
        <span className={styles.title}>
          {hasErrors
            ? t('validation_issues_panel.title_errors', { count: errors.length })
            : t('validation_issues_panel.title_warnings', { count: warnings.length })}
        </span>
        {collapsible && <span className={styles.toggle}>{isExpanded ? '\u25B2' : '\u25BC'}</span>}
      </div>
      {isListVisible && (
        <ul className={classnames(styles.list, { [styles.listModal]: !collapsible })}>
          {sortedIssues.map((issue, index) => (
            <li
              key={index}
              className={classnames(styles.issue, {
                [styles.issueError]: issue.severity === ValidationSeverity.ERROR,
                [styles.issueWarning]: issue.severity === ValidationSeverity.WARNING
              })}
            >
              <span className={styles.icon}>{issue.severity === ValidationSeverity.ERROR ? '\u2716' : '\u26A0'}</span>
              <span className={styles.message}>{t(issue.messageKey, issue.messageParams || {})}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ValidationIssuesPanel
