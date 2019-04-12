import * as React from 'react'
import { Button } from 'decentraland-ui'
import Dropzone, { DropzoneState } from 'react-dropzone'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import JSZip from 'jszip'
import uuidv4 from 'uuid/v4'

import { BUILDER_FILE_NAME } from 'modules/project/sagas'
import { SavedProject } from 'modules/project/types'
import { Props, State } from './ImportModal.types'
import './ImportModal.css'

export default class ImportModal extends React.PureComponent<Props, State> {
  state: State = {
    acceptedProjects: []
  }

  renderDropZone = (props: DropzoneState) => {
    const { open, isDragActive, getRootProps, getInputProps } = props
    const { acceptedProjects } = this.state
    let classes = 'dropzone'

    if (isDragActive) {
      classes += ' active'
    }

    return (
      <div {...getRootProps()} className={classes}>
        <input {...getInputProps()} />

        {acceptedProjects.length ? (
          (acceptedProjects as SavedProject[]).map(saved => <div key={saved.project.id}>{saved.project.title}</div>)
        ) : (
          <>
            <div className="image" />
            Drag and drop your .zip file or
            <span className="action" onClick={open}>
              Upload manually
            </span>
          </>
        )}
      </div>
    )
  }

  handleDropAccepted = async (acceptedFiles: File[]) => {
    const { acceptedProjects } = this.state

    let projects = []
    for (let file of acceptedFiles) {
      const zip: JSZip = await JSZip.loadAsync(file)
      const content = await zip.file(BUILDER_FILE_NAME).async('text')
      const parsed: SavedProject = JSON.parse(content)
      parsed.project.id = uuidv4()
      parsed.scene.id = uuidv4()
      parsed.project.sceneId = parsed.scene.id

      projects.push(parsed)
    }
    this.setState({ acceptedProjects: [...acceptedProjects, ...projects] })
  }

  handleDropRejected = (rejectedFiles: File[]) => {
    console.log('rejected', rejectedFiles)
  }

  handleImport = () => {
    this.props.onImport(this.state.acceptedProjects)
    this.props.onClose()
  }

  render() {
    const { name, onClose } = this.props

    return (
      <Modal name={name}>
        <Modal.Header>{t('import_modal.title')}</Modal.Header>
        <Modal.Content>
          <div className="details">{t('import_modal.description')}</div>
          <Dropzone
            children={this.renderDropZone}
            onDropAccepted={this.handleDropAccepted}
            onDropRejected={this.handleDropRejected}
            accept=".zip"
            noClick
          />
        </Modal.Content>
        <Modal.Actions>
          <Button primary onClick={this.handleImport}>
            {t('import_modal.action')}
          </Button>
          <Button secondary onClick={onClose}>
            {t('global.cancel')}
          </Button>
        </Modal.Actions>
      </Modal>
    )
  }
}
