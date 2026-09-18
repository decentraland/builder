import * as React from 'react'
import { useCallback, useState } from 'react'
import { Icon, Loader, Modal, ModalNavigation, Popup } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { ValidationSeverity } from 'lib/glbValidation/types'
import { ValidationIssuesPanel } from 'components/ValidationIssuesPanel'
import { Props } from './ValidationStatusBadge.types'

export default function ValidationStatusBadge({ issues, isWaiting }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const hasErrors = issues?.some(issue => issue.severity === ValidationSeverity.ERROR) ?? false
  const hasWarnings = issues?.some(issue => issue.severity === ValidationSeverity.WARNING) ?? false
  const hasIssues = hasErrors || hasWarnings
  // Issues still undefined means validation hasn't produced a result yet, even if no run is in flight.
  const isPending = isWaiting || issues === undefined
  const isPass = !isPending && !hasIssues
  const isClickable = hasIssues

  const handleOpenModal = useCallback(() => {
    if (issues && issues.length > 0) {
      setIsModalOpen(true)
    }
  }, [issues])
  const handleCloseModal = useCallback(() => setIsModalOpen(false), [])

  let statusClass = ''
  if (hasErrors) statusClass = 'validation-fail'
  else if (hasWarnings) statusClass = 'validation-warn'
  else if (isPass) statusClass = 'validation-pass'

  let tooltipContent: string
  if (isPending) {
    tooltipContent = t('item_editor.center_panel.validation_running')
  } else if (isPass) {
    tooltipContent = t('item_editor.center_panel.validation_pass')
  } else if (hasErrors) {
    tooltipContent = t('item_editor.center_panel.validation_fail')
  } else if (hasWarnings) {
    tooltipContent = t('item_editor.center_panel.validation_warnings')
  } else {
    tooltipContent = t('item_editor.center_panel.validation_tooltip')
  }

  let iconElement: React.ReactNode
  if (isPending) {
    iconElement = <Loader active inline size="tiny" inverted />
  } else if (isPass) {
    iconElement = <Icon name="check circle" className="validation-icon pass" />
  } else if (hasErrors) {
    iconElement = <Icon name="times circle" className="validation-icon fail" />
  } else {
    iconElement = <Icon name="exclamation circle" className="validation-icon warn" />
  }

  return (
    <>
      <Popup
        content={tooltipContent}
        position="top center"
        trigger={
          <div
            className={`option validation-status ${statusClass}`}
            onClick={isClickable ? handleOpenModal : undefined}
            style={{ cursor: isClickable ? 'pointer' : 'default' }}
          >
            {iconElement}
          </div>
        }
        hideOnScroll
        on="hover"
        inverted
      />
      {isModalOpen && issues && (
        <Modal open size="small" onClose={handleCloseModal}>
          <ModalNavigation title={t('item_editor.center_panel.validation_modal_title')} onClose={handleCloseModal} />
          <Modal.Content>
            <ValidationIssuesPanel issues={issues} collapsible={false} />
          </Modal.Content>
        </Modal>
      )}
    </>
  )
}
