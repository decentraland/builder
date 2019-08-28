import * as React from 'react'
import * as crypto from 'crypto'
import uuidv4 from 'uuid/v4'
import JSZip from 'jszip'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import Icon from 'components/Icon'
import FileImport from 'components/FileImport'
import { Asset } from 'modules/asset/types'

import { Props, State, ImportedFile } from './AssetImport.types'
import './AssetImport.css'
import { cleanFileName, getExtension } from './utils'
import { getModelData } from 'lib/getModelData'

export const getSHA256 = (data: string) => {
  return crypto
    .createHash('sha256')
    .update(data)
    .digest('hex')
}

const ASSET_MANIFEST = 'asset.json'

export default class AssetImport extends React.Component<Props, State> {
  state: State = {
    assetPackId: uuidv4(),
    files: {},
    canImport: false
  }

  componentDidMount() {
    this.setState({
      assetPackId: uuidv4()
    })
  }

  renderFiles = () => {
    const files = Object.values(this.state.files)

    return (
      <>
        {files.length === 1 && <div className="single-project">{this.renderFile(files[0])}</div>}
        {files.length > 1 && <div className="multiple-projects">{(files as ImportedFile[]).map(saved => this.renderFile(saved))} </div>}
      </>
    )
  }

  renderFile = (file: ImportedFile) => {
    if (file.isCorrupted || !file.asset) {
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
      <div className="project-card" key={file.id}>
        <div className="close-button" onClick={() => this.handleRemoveProject(file.id)}>
          <Icon name="close" />
        </div>
        <img src={file.asset.thumbnail} />
        <span className="title" title={file.asset.name}>
          {file.asset.name}
        </span>
      </div>
    )
  }

  handleZipFile = async (file: File, extension: string) => {
    const { assetPackId } = this.state
    const zip: JSZip = await JSZip.loadAsync(file)
    const manifestRaw = zip.file(ASSET_MANIFEST)
    let manifestParsed: Asset | null = null

    if (manifestRaw) {
      const content = await manifestRaw.async('text')
      manifestParsed = JSON.parse(content)
    }

    if (manifestParsed && !manifestParsed.name) {
      throw new Error('Invalid project')
    }

    const assetModel = zip.file(/\.(glb|gltf)$/g).pop()
    const fileNames: string[] = []

    zip.forEach(fileName => {
      if (fileName !== ASSET_MANIFEST) {
        fileNames.push(fileName)
      }
    })

    const files = await Promise.all(
      fileNames.map(async fileName => {
        const file = zip.file(fileName)
        const blob = await file.async('blob')
        return {
          name: fileName,
          blob
        }
      })
    )

    const contents = files.reduce<Record<string, Blob>>((contents, file) => {
      contents[file.name] = file.blob
      return contents
    }, {})

    const id = getSHA256(file.name)

    return {
      id,
      fileName: file.name,
      asset: {
        id,
        assetPackId,
        name: manifestParsed ? manifestParsed.name : cleanFileName(file.name, extension),
        tags: manifestParsed ? manifestParsed.tags : [],
        category: manifestParsed ? manifestParsed.category : 'decorations',
        url: assetModel!.name || '',
        contents
      }
    } as ImportedFile
  }

  handleModelFile = (file: File, extension: string) => {
    const { assetPackId } = this.state
    const id = getSHA256(file.name)
    return {
      id,
      fileName: file.name,
      asset: {
        id,
        assetPackId,
        name: cleanFileName(file.name, extension),
        url: file.name,
        contents: {
          [file.name]: file
        }
      }
    } as ImportedFile
  }

  handleDropAccepted = async (acceptedFiles: File[]) => {
    const { files, assetPackId } = this.state
    let newFiles: Record<string, ImportedFile> = {}

    for (let file of acceptedFiles) {
      let outFile: ImportedFile | null = null
      const extension = getExtension(file.name)

      try {
        if (!extension) {
          throw new Error('Invalid project')
        }

        if (extension === '.zip') {
          outFile = await this.handleZipFile(file, extension)
        } else if (extension === '.gltf' || extension === '.glb') {
          outFile = this.handleModelFile(file, extension)
        }

        if (outFile) {
          let mappings: Record<string, string> = {}

          Object.keys(outFile.asset.contents).map(key => {
            mappings[key] = URL.createObjectURL(outFile!.asset.contents[key])
          })

          const { image } = await getModelData(mappings[outFile.asset.url], { mappings })

          outFile.asset.thumbnail = image
        }
      } catch (e) {
        console.log(e)
        // TODO: analytics

        outFile = {
          id: getSHA256(file.name),
          fileName: file.name,
          isCorrupted: true
        } as ImportedFile
      }

      if (outFile && !outFile.isCorrupted) {
        newFiles[outFile!.id] = outFile
      }
    }

    const fileRecord = { ...files, ...newFiles }

    this.setState({ files: fileRecord, canImport: true })

    this.props.onAssetPack({
      id: assetPackId,
      title: '',
      thumbnail: '',
      url: '',
      isLoaded: false,
      assets: Object.values(fileRecord).map(file => (file.asset as unknown) as Asset)
    })
  }

  handleDropRejected = (rejectedFiles: File[]) => {
    console.log('rejected', rejectedFiles)
  }

  handleRemoveProject = (id: string) => {
    const { [id]: _, ...files } = this.state.files
    this.setState({ files, canImport: Object.keys(files).length > 0 })
  }

  render() {
    const { files } = this.state
    return (
      <div className="AssetImport">
        <FileImport<ImportedFile>
          accept={['.zip', '.gltf', '.glb']}
          items={Object.values(files)}
          renderFiles={this.renderFiles}
          onAcceptedFiles={this.handleDropAccepted}
          onRejectedFiles={this.handleDropRejected}
        />
      </div>
    )
  }
}
