export async function downloadZip(name: string, files: Record<string, Blob | string>) {
  const [JSZip, FileSaver] = await Promise.all([import('jszip').then(module => module.default), import('file-saver')])
  const zip = new JSZip()
  for (const path in files) {
    const blob = files[path]
    zip.file(path, blob)
  }
  const artifact: Blob = await zip.generateAsync({ type: 'blob' })
  return FileSaver.saveAs(artifact, `${name}.zip`)
}
