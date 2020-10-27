import * as React from 'react'
import { basename } from 'path'
import * as crypto from 'crypto'
import uuidv4 from 'uuid/v4'
import JSZip from 'jszip'
import { Button, Loader } from 'decentraland-ui'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import { getAnalytics } from 'decentraland-dapps/dist/modules/analytics/utils'

import FileImport from 'components/FileImport'
import AssetThumbnail from 'components/AssetThumbnail'
import { Asset, GROUND_CATEGORY, RawAsset } from 'modules/asset/types'
import { EXPORT_PATH } from 'modules/project/export'
import { RawAssetPack, MixedAssetPack } from 'modules/assetPack/types'
import { cleanAssetName, rawMappingsToObjectURL, revokeMappingsObjectURL, MAX_NAME_LENGTH } from 'modules/asset/utils'
import { getModelData, ThumbnailType } from 'lib/getModelData'
import { createDefaultImportedFile, getMetrics, ASSET_MANIFEST, prepareScript } from './utils'
import { truncateFileName, getExtension, MAX_FILE_SIZE } from 'lib/file'

import { Props, State, ImportedFile } from './AssetImporter.types'
import './AssetImporter.css'

export const getSHA256 = (data: string) => {
  return crypto
    .createHash('sha256')
    .update(data)
    .digest('hex')
}

export default class AssetImporter<T extends MixedAssetPack = RawAssetPack> extends React.PureComponent<Props<T>, State> {
  state: State = {
    assetPackId: this.getAssetPackId(),
    files: {},
    isLoading: false
  }

  analytics = getAnalytics()

  getAssetPackId() {
    const { assetPack } = this.props
    return assetPack ? assetPack.id : uuidv4()
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

    const id = !file.error ? file.asset.id : file.id
    const isDuplicated = file.error && file.asset && file.asset.thumbnail

    return (
      <AssetThumbnail
        key={id}
        asset={{
          ...file.asset,
          id,
          name: !file.error ? file.asset.name : file.fileName
        }}
        error={file.error}
        errorLabel={isDuplicated ? t('asset_pack.import.errors.duplicated') : t('asset_pack.import.errors.invalid')}
        onRemove={this.handleRemoveProject}
      />
    )
  }

  renderDropzoneCTA = (open: () => void) => {
    const { isLoading } = this.state
    return (
      <>
        {isLoading ? (
          <div className="overlay">
            <Loader active size="big" />
          </div>
        ) : null}
        <T
          id="asset_pack.import.cta"
          values={{
            models_link: (
              <span className="link" onClick={this.handleOpenDocs}>
                GLB, GLTF, ZIP
              </span>
            ),
            action: (
              <span className="action" onClick={open}>
                {t('import_modal.upload_manually')}
              </span>
            )
          }}
        />
      </>
    )
  }

  handleZipFile = async (file: File) => {
    const { assetPackId } = this.state
    const zip: JSZip = await JSZip.loadAsync(file)
    const manifestPath = Object.keys(zip.files).find(path => basename(path) === ASSET_MANIFEST)
    let manifestParsed: Asset | null = null

    if (manifestPath) {
      const manifestRaw = zip.file(manifestPath)
      const content = await manifestRaw.async('text')
      manifestParsed = JSON.parse(content)
    }

    const fileNames: string[] = []

    zip.forEach(fileName => {
      if (fileName === EXPORT_PATH.MANIFEST_FILE || fileName === EXPORT_PATH.GAME_FILE) {
        this.analytics.track('Asset Importer Error Scene File')
        throw new Error(
          t('asset_pack.import.errors.scene_file', {
            name: fileName
          })
        )
      }

      if (basename(fileName) !== ASSET_MANIFEST && !basename(fileName).startsWith('.')) {
        fileNames.push(fileName)
      }
    })

    const files = await Promise.all(
      fileNames
        .map(fileName => zip.file(fileName))
        .filter(file => !!file)
        .map(async file => {
          const blob = await file.async('blob')

          if (blob.size > MAX_FILE_SIZE) {
            this.analytics.track('Asset Importer Error Max File Size')
            throw new Error(
              t('asset_pack.import.errors.max_file_size', {
                name: truncateFileName(file.name),
                max: MAX_FILE_SIZE / 1000000
              })
            )
          }

          return {
            name: file.name,
            blob
          }
        })
    )

    let model = fileNames.find(fileName => fileName.endsWith('.gltf') || fileName.endsWith('.glb'))
    let script = fileNames.find(fileName => fileName.endsWith('.js')) || null
    let contents = files.reduce<Record<string, Blob>>((contents, file) => {
      contents[file.name] = file.blob
      return contents
    }, {})

    let id: string
    if (manifestParsed && manifestParsed.id) {
      id = manifestParsed.id
    } else if (script) {
      id = uuidv4()
    } else if (model) {
      id = getSHA256(`${assetPackId}/${basename(model)}`)
    } else {
      this.analytics.track('Asset Importer Error Missing Model')
      throw new Error(
        t('asset_pack.import.errors.missing_model', {
          name: truncateFileName(file.name)
        })
      )
    }

    if (script) {
      contents = await prepareScript(script, id, contents)
    }

    this.analytics.track('Asset Importer File Success')

    let asset: RawAsset = {
      id,
      name: cleanAssetName(file.name),
      assetPackId,
      model: model!,
      script,
      contents,
      tags: [],
      category: 'decorations',
      metrics: getMetrics(),
      thumbnail: '',
      parameters: [],
      actions: []
    }

    // apply manifest data
    if (manifestParsed) {
      if (manifestParsed.name) {
        manifestParsed.name = manifestParsed.name.slice(0, MAX_NAME_LENGTH)
      }
      const { contents: _, ...rest } = manifestParsed
      asset = {
        ...asset,
        ...rest
      }
    }

    return {
      id,
      fileName: file.name,
      asset
    } as ImportedFile
  }

  handleModelFile = (file: File) => {
    const { assetPackId } = this.state
    const id = getSHA256(`${assetPackId}/${file.name}`)

    if (file.size > MAX_FILE_SIZE) {
      this.analytics.track('Asset Importer Error Max File Size')
      throw new Error(
        t('asset_pack.import.errors.max_file_size', {
          name: truncateFileName(file.name),
          max: MAX_FILE_SIZE / 1000000
        })
      )
    }

    return createDefaultImportedFile(id, assetPackId, file)
  }

  handleDropAccepted = async (acceptedFiles: File[]) => {
    const { assetPack } = this.props
    const { files } = this.state
    let newFiles: Record<string, ImportedFile> = {}

    this.setState({ isLoading: true })

    for (let file of acceptedFiles) {
      let outFile: ImportedFile | null = null
      const extension = getExtension(file.name)

      try {
        if (!extension) {
          this.analytics.track('Asset Importer Error Missing Extension')
          throw new Error(
            t('asset_pack.import.errors.missing_extension', {
              name: truncateFileName(file.name)
            })
          )
        }

        if (extension === '.zip') {
          outFile = await this.handleZipFile(file)
        } else if (extension === '.gltf' || extension === '.glb') {
          outFile = this.handleModelFile(file)
        }

        if (outFile) {
          let mappings = rawMappingsToObjectURL(outFile.asset.contents)
          const { image, info } = await getModelData(mappings[outFile.asset.model], {
            mappings,
            thumbnailType: outFile.asset.category === GROUND_CATEGORY ? ThumbnailType.TOP : ThumbnailType.DEFAULT
          })
          revokeMappingsObjectURL(mappings)

          outFile.asset.thumbnail = image
          outFile.asset.metrics = info

          const existingAsset = assetPack.assets.find(asset => asset.id === outFile!.asset.id)

          if (existingAsset) {
            this.analytics.track('Asset Importer Error Duplicated Asset')
            throw new Error(
              t('asset_pack.import.errors.duplicated_asset', {
                name: truncateFileName(file.name),
                model: outFile.asset.model,
                asset: existingAsset.name
              })
            )
          }
        }
      } catch (e) {
        outFile = {
          asset: outFile ? outFile!.asset : null,
          id: getSHA256(file.name),
          fileName: file.name,
          error: e.message || t('asset_pack.import.errors.invalid')
        } as ImportedFile
      }

      if (outFile) {
        newFiles[outFile!.id] = outFile
      }
    }

    const fileRecord = { ...files, ...newFiles }
    this.setState({ files: fileRecord, isLoading: false })
  }

  handleDropRejected = (rejectedFiles: File[]) => {
    console.log('rejected', rejectedFiles)
  }

  handleRemoveProject = (id: string) => {
    const { [id]: _, ...files } = this.state.files
    this.setState({ files })
  }

  handleSubmit = () => {
    const { assetPack } = this.props
    const { files } = this.state
    const assets = Object.values(files).map(file => file.asset)

    this.props.onSubmit({
      ...assetPack,
      assets: assetPack ? [...assetPack.assets, ...assets] : assets
    })
  }

  handleOpenDocs = () => {
    window.open('https://docs.decentraland.org/3d-modeling/3d-models/', '_blank')
  }

  render() {
    const { files } = this.state
    const items = Object.values(files)
    const buttonText = items.length > 1 ? t('asset_pack.import.action_many', { count: items.length }) : t('asset_pack.import.action')
    const hasCorrupted = items.find(item => !!item.error)
    const canImport = items.length > 0 && !hasCorrupted

    return (
      <div className="AssetImporter">
        <FileImport<ImportedFile>
          accept={['.zip', '.gltf', '.glb']}
          items={items}
          renderFiles={this.renderFiles}
          onAcceptedFiles={this.handleDropAccepted}
          onRejectedFiles={this.handleDropRejected}
          renderAction={this.renderDropzoneCTA}
        />
        <Button className="submit" disabled={!canImport} primary={canImport} onClick={this.handleSubmit}>
          {buttonText}
        </Button>
      </div>
    )
  }
}
