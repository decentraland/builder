import * as React from 'react'
import { basename } from 'path'
import * as crypto from 'crypto'
import uuidv4 from 'uuid/v4'
import JSZip from 'jszip'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import FileImport from 'components/FileImport'
import AssetThumbnail from 'components/AssetThumbnail'
import { Asset, GROUND_CATEGORY } from 'modules/asset/types'
import { EXPORT_PATH } from 'modules/project/export'
import { CategoryName } from 'modules/ui/sidebar/utils'
import { cleanAssetName, rawMappingsToObjectURL, revokeMappingsObjectURL } from 'modules/asset/utils'
import { getModelData } from 'lib/getModelData'
import { getExtension } from './utils'

import { Props, State, ImportedFile } from './AssetImporter.types'
import './AssetImporter.css'

export const getSHA256 = (data: string) => {
  return crypto
    .createHash('sha256')
    .update(data)
    .digest('hex')
}

const ASSET_MANIFEST = 'asset.json'

export default class AssetImport extends React.PureComponent<Props, State> {
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
    if (!file.fileName) {
      // Hide any weird cases where no fileName is available
      this.handleRemoveProject(file.id)
      return null
    }

    const id = !file.isCorrupted ? file.asset.id : file.id
    return (
      <AssetThumbnail
        key={id}
        asset={{
          id,
          name: !file.isCorrupted ? file.asset.name : file.fileName,
          thumbnail: !file.isCorrupted ? file.asset.thumbnail! : ''
        }}
        error={!!file.isCorrupted}
        onRemove={this.handleRemoveProject}
      />
    )
  }

  renderDropzoneCTA = (open: () => void) => {
    return (
      <T
        id="asset_pack.import.cta"
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

  handleZipFile = async (file: File) => {
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

    const fileNames: string[] = []

    zip.forEach(fileName => {
      if (fileName === EXPORT_PATH.MANIFEST_FILE) {
        throw new Error(t('asset_pack.import.invalid'))
      }

      if (fileName !== ASSET_MANIFEST || !basename(fileName).startsWith('.')) {
        fileNames.push(fileName)
      }
    })

    const assetModel = fileNames.find(fileName => fileName.endsWith('.gltf') || fileName.endsWith('.glb'))

    if (!assetModel) {
      throw new Error(t('asset_pack.import.invalid'))
    }

    const files = await Promise.all(
      fileNames
        .map(fileName => zip.file(fileName))
        .filter(file => !!file)
        .map(async file => {
          const blob = await file.async('blob')
          return {
            name: file.name,
            blob
          }
        })
    )

    const contents = files.reduce<Record<string, Blob>>((contents, file) => {
      contents[file.name] = file.blob
      return contents
    }, {})

    const id = getSHA256(`${assetPackId}/${file.name}`)

    return {
      id,
      fileName: file.name,
      asset: {
        id,
        assetPackId,
        name: manifestParsed ? manifestParsed.name : cleanAssetName(file.name),
        tags: manifestParsed ? manifestParsed.tags : [],
        category: manifestParsed ? manifestParsed.category : 'decorations',
        url: assetModel,
        contents,
        metadata: {
          metrics: {
            triangles: 0,
            materials: 0,
            geometries: 0,
            bodies: 0,
            entities: 0,
            textures: 0
          }
        }
      }
    } as ImportedFile
  }

  handleModelFile = (file: File) => {
    const { assetPackId } = this.state
    const id = getSHA256(`${assetPackId}/${file.name}`)
    return {
      id,
      fileName: file.name,
      asset: {
        id,
        assetPackId,
        thumbnail: '',
        name: cleanAssetName(file.name),
        category: CategoryName.DECORATIONS_CATEGORY,
        url: file.name,
        contents: {
          [file.name]: file
        },
        metadata: {
          metrics: {
            triangles: 0,
            materials: 0,
            geometries: 0,
            bodies: 0,
            entities: 0,
            textures: 0
          }
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
          throw new Error(t('asset_pack.import.invalid'))
        }

        if (extension === '.zip') {
          outFile = await this.handleZipFile(file)
        } else if (extension === '.gltf' || extension === '.glb') {
          outFile = this.handleModelFile(file)
        }

        if (outFile) {
          let mappings = rawMappingsToObjectURL(outFile.asset.contents)
          const { image, info } = await getModelData(mappings[outFile.asset.url], {
            mappings,
            thumbnailType: outFile.asset.category === GROUND_CATEGORY ? '2d' : '3d'
          })
          revokeMappingsObjectURL(mappings)

          outFile.asset.thumbnail = image
          outFile.asset.metadata.metrics = info
        }
      } catch (e) {
        // TODO: analytics

        outFile = {
          id: getSHA256(file.name),
          fileName: file.name,
          isCorrupted: true
        } as ImportedFile
      }

      if (outFile) {
        newFiles[outFile!.id] = outFile
      }
    }

    const fileRecord = { ...files, ...newFiles }

    this.setState({ files: fileRecord, canImport: true })

    const assets = Object.values(fileRecord).map(file => file.asset)

    this.props.onAssetPack({
      id: assetPackId,
      title: '',
      thumbnail: '',
      url: '',
      isLoaded: false,
      assets
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
      <div className="AssetImporter">
        <FileImport<ImportedFile>
          accept={['.zip', '.gltf', '.glb']}
          items={Object.values(files)}
          renderFiles={this.renderFiles}
          onAcceptedFiles={this.handleDropAccepted}
          onRejectedFiles={this.handleDropRejected}
          renderAction={this.renderDropzoneCTA}
        />
      </div>
    )
  }
}
