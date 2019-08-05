import { ImportedFile } from 'components/Modals/ImportModal/ImportModal.types'
import { addMappings } from './ISSUE-485'
import { toCloudSchema } from './utils'

export const migrations: Record<string, (file: ImportedFile) => ImportedFile> = {
  '2': (file: ImportedFile) => {
    addMappings(file.scene)
    return file
  },
  '3': (file: ImportedFile) => {
    if (file.project) {
      file.project = toCloudSchema(file.project)
    }
    return file
  }
}
