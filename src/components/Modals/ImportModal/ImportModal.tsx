import * as React from 'react'
import { Button } from 'decentraland-ui'
import JSZip from 'jszip'
import uuidv4 from 'uuid/v4'

import Dropzone, { DropzoneState } from 'react-dropzone'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { migrations } from 'modules/migrations/manifest'
import { Manifest } from 'modules/project/types'
import { EXPORT_PATH } from 'modules/project/export'
import { runMigrations } from 'modules/migrations/utils'
import Icon from 'components/Icon'

import { Props, State, ImportedFile } from './ImportModal.types'

import './ImportModal.css'

export default class ImportModal extends React.PureComponent<Props, State> {
  state: State = {
    acceptedProjects: [],
    canImport: false
  }

  analytics = getAnalytics()

  renderProject = (saved: ImportedFile) => {
    if (!saved.manifest) return null

    if (!saved.manifest.project || !saved.manifest.scene) {
      if (saved.fileName) {
        const key = `${saved.fileName}-${Math.random()}`.replace(/\s/g, '_')
        return (
          <div className="project-card error" key={key}>
            <div className="close-button" onClick={() => this.handleRemoveProject(saved.id)}>
              <Icon name="close" />
            </div>
            <div className="error-icon" />
            <span className="title" title={saved.fileName}>
              {saved.fileName}
            </span>
            <span className="error">{t('import_modal.invalid_file')}</span>
          </div>
        )
      } else {
        // Hide any weird cases where no fileName is available
        this.handleRemoveProject(saved.id)
        return null
      }
    }

    return (
      <div className="project-card" key={saved.manifest.project.id}>
        <div className="close-button" onClick={() => this.handleRemoveProject(saved.id)}>
          <Icon name="close" />
        </div>
        <img src={saved.manifest.project.thumbnail} />
        <span className="title" title={saved.manifest.project.title}>
          {saved.manifest.project.title}
        </span>
      </div>
    )
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

        {acceptedProjects.length === 1 && <div className="single-project">{this.renderProject(acceptedProjects[0])}</div>}

        {acceptedProjects.length > 1 && (
          <div className="multiple-projects">{(acceptedProjects as ImportedFile[]).map(saved => this.renderProject(saved))} </div>
        )}

        {acceptedProjects.length === 0 && (
          <span className="cta">
            <div className="image" />
            <T
              id="import_modal.cta"
              values={{
                action: (
                  <span className="action" onClick={open}>
                    {t('import_modal.upload_manually')}
                  </span>
                )
              }}
            />
          </span>
        )}
      </div>
    )
  }

  handleDropAccepted = async (acceptedFiles: File[]) => {
    const { acceptedProjects } = this.state

    let projects = []

    for (let file of acceptedFiles) {
      try {
        const zip: JSZip = await JSZip.loadAsync(file)
        const contentRaw = zip.file(EXPORT_PATH.MANIFEST_FILE)
        const content = await contentRaw.async('text')
        const req = new Response(content)
        const parsed: Manifest = await req.json()

        if (!parsed || !parsed.scene) {
          throw new Error('Invalid project')
        }

        const migrated = runMigrations<Manifest>(parsed, migrations)

        if (!migrated.project || !migrated.scene) {
          throw new Error('Invalid project')
        }

        let importedFile: ImportedFile = {
          id: uuidv4(),
          fileName: file.name,
          manifest: {
            ...migrated
          }
        }

        importedFile.manifest!.project.id = uuidv4()
        importedFile.manifest!.scene.id = uuidv4()
        importedFile.manifest!.project.sceneId = parsed.scene.id

        projects.push(importedFile)
      } catch (e) {
        this.analytics.track('Import project failure', {
          fileName: file.name
        })

        projects.push({
          id: uuidv4(),
          fileName: file.name,
          isCorrupted: true
        } as ImportedFile)
      }
    }

    this.setState({ acceptedProjects: [...acceptedProjects, ...projects], canImport: true })
  }

  handleDropRejected = (rejectedFiles: File[]) => {
    console.log('rejected', rejectedFiles)
  }

  handleImport = () => {
    // At this point we are sure that the accepted projects are all valid
    const manifests = this.state.acceptedProjects.map(p => p.manifest!)
    this.props.onImport(manifests)
    this.props.onClose()
  }

  handleRemoveProject = (id: string) => {
    const acceptedProjects = this.state.acceptedProjects.filter(proj => proj.id !== id)
    this.setState({ acceptedProjects, canImport: acceptedProjects.length > 0 })
  }

  hasCorruptedProjects = () => {
    return this.state.acceptedProjects.some(proj => proj.isCorrupted === true)
  }

  render() {
    const { name, onClose } = this.props
    const { acceptedProjects, canImport } = this.state
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
          <Button primary onClick={this.handleImport} disabled={!canImport || this.hasCorruptedProjects()}>
            {acceptedProjects.length > 1 ? t('import_modal.action_many', { count: acceptedProjects.length }) : t('import_modal.action')}
          </Button>
          <Button secondary onClick={onClose}>
            {t('global.cancel')}
          </Button>
        </Modal.Actions>
      </Modal>
    )
  }
}
