import { ImportedFile } from 'components/Modals/ImportModal/ImportModal.types'
import { addMappings } from './ISSUE-485'

export const migrations: Record<string, (file: ImportedFile) => ImportedFile> = {
  '2': (file: ImportedFile) => {
    addMappings(file.scene)
    return file
  }
}
