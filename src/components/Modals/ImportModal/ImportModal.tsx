import * as React from 'react'
import { Button } from 'decentraland-ui'
import JSZip from 'jszip'
import uuidv4 from 'uuid/v4'

import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'
import Modal from 'decentraland-dapps/dist/containers/Modal'
import { migrations } from 'modules/migrations/manifest'
import { Manifest } from 'modules/project/types'
import { EXPORT_PATH } from 'modules/project/export'
import { runMigrations } from 'modules/migrations/utils'
import FileImport from 'components/FileImport'
import Icon from 'components/Icon'

import { Props, State, ImportedFile } from './ImportModal.types'
import './ImportModal.css'

export default class ImportModal extends React.PureComponent<Props, State> {
  state: State = {
    acceptedProjects: [],
    canImport: false
  }

  analytics = getAnalytics()

  renderProject = (file: ImportedFile) => {
    if (file.isCorrupted || !file.manifest || !file.manifest.project || !file.manifest.scene) {
      if (file.fileName) {
        const key = `${file.fileName}-${Math.random()}`.replace(/\s/g, '_')
        return (
          <div className="project-card error" key={key}>
            <div className="close-button" onClick={() => this.handleRemoveProject(file.id)}>
              <Icon name="close" />
            </div>
            <div className="error-icon" />
            <span className="title" title={file.fileName}>
              {file.fileName}
            </span>
            <span className="error">{t('import_modal.invalid_file')}</span>
          </div>
        )
      } else {
        // Hide any weird cases where no fileName is available
        this.handleRemoveProject(file.id)
        return null
      }
    }

    return (
      <div className="project-card" key={file.manifest.project.id}>
        <div className="close-button" onClick={() => this.handleRemoveProject(file.id)}>
          <Icon name="close" />
        </div>
        <img src={file.manifest.project.thumbnail} />
        <span className="title" title={file.manifest.project.title}>
          {file.manifest.project.title}
        </span>
      </div>
    )
  }

  renderProjects = () => {
    const { acceptedProjects } = this.state
    return (
      <>
        {acceptedProjects.length === 1 && <div className="single-project">{this.renderProject(acceptedProjects[0])}</div>}
        {acceptedProjects.length > 1 && (
          <div className="multiple-projects">{(acceptedProjects as ImportedFile[]).map(saved => this.renderProject(saved))} </div>
        )}
      </>
    )
  }

  renderDropzoneCTA = (open: () => void) => {
    return (
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

        migrated.project.createdAt = new Date().toISOString()
        migrated.project.updatedAt = new Date().toISOString()

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
          <FileImport<ImportedFile>
            accept=".zip"
            items={acceptedProjects}
            renderFiles={this.renderProjects}
            onAcceptedFiles={this.handleDropAccepted}
            onRejectedFiles={this.handleDropRejected}
            renderAction={this.renderDropzoneCTA}
          />
        </Modal.Content>
        <Modal.Actions>
          <Button secondary onClick={onClose}>
            {t('global.cancel')}
          </Button>
          <Button primary onClick={this.handleImport} disabled={!canImport || this.hasCorruptedProjects()}>
            {acceptedProjects.length > 1 ? t('import_modal.action_many', { count: acceptedProjects.length }) : t('import_modal.action')}
          </Button>
        </Modal.Actions>
      </Modal>
    )
  }
}
