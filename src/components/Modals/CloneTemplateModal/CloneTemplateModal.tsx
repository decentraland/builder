import React, { useCallback, useEffect, useState } from 'react'
import classNames from 'classnames'
import { Button, Field, ModalNavigation, TextAreaField, InputOnChangeData, TextAreaProps } from 'decentraland-ui'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { PreviewType } from 'modules/editor/types'
import { Props } from './CloneTemplateModal.types'

import './CloneTemplateModal.css'

const CloneTemplateModal: React.FC<Props> = ({ metadata, name, isLoading, onDuplicate, onClose }) => {
  const [title, setTitle] = useState<string>(metadata.template.title)
  const [description, setDescription] = useState<string>('')

  useEffect(() => {
    setTitle(metadata.template.title)
  }, [metadata])

  const handleClose = useCallback(() => {
    if (isLoading) {
      return
    }
    onClose()
  }, [isLoading, onClose])

  const handleCloneTemplate = useCallback(() => {
    const project = { ...metadata.template, title, description }
    onDuplicate(project, PreviewType.TEMPLATE)
  }, [title, description, metadata, onDuplicate])

  const handleOnTitleChange = useCallback((_: React.ChangeEvent<HTMLInputElement>, { value }: InputOnChangeData) => {
    setTitle(value)
  }, [])

  const handleOnDescriptionChange = useCallback((_: React.ChangeEvent<HTMLTextAreaElement>, { value }: TextAreaProps) => {
    setDescription(value as string)
  }, [])

  return (
    <Modal name={name} onClose={handleClose}>
      <div className={classNames('modal-navigation-container', { disabled: isLoading })}>
        <ModalNavigation title={t('clone_template_modal.title')} onClose={handleClose} />
      </div>
      <Modal.Content>
        <Field
          label={t('clone_template_modal.name_label')}
          placeholder={t('global.new_scene')}
          message={t('clone_template_modal.name_max_length')}
          value={title}
          maxLength={32}
          kind="full"
          onChange={handleOnTitleChange}
        />
        <TextAreaField
          label={t('clone_template_modal.description_label')}
          placeholder={t('clone_template_modal.description_placeholder')}
          value={description}
          rows={5}
          kind="full"
          onChange={handleOnDescriptionChange}
        />
      </Modal.Content>
      <Modal.Actions>
        <Button primary className="next-action-button" disabled={!name || isLoading} loading={isLoading} onClick={handleCloneTemplate}>
          {t('global.next')}
        </Button>
      </Modal.Actions>
    </Modal>
  )
}

export default React.memo(CloneTemplateModal)
