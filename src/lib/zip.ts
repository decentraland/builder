import JSZip from 'jszip'
import { saveAs } from 'file-saver'

export async function downloadZip(name: string, files: Record<string, Blob | string>) {
  const zip = new JSZip()
  for (const path in files) {
    const blob = files[path]
    zip.file(path, blob)
  }
  const artifact: Blob = await zip.generateAsync({ type: 'blob' })
  return saveAs(artifact, `${name}.zip`)
}
