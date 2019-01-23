import { Template } from 'modules/template/types'

export function getTemplates(): Template[] {
  return [
    { title: '1x1', description: '10x10m', thumbnail: 'thumb-1x1', parcelLayout: { rows: 1, cols: 1 } },
    { title: '2x2', description: '20x20m', thumbnail: 'thumb-2x2', parcelLayout: { rows: 2, cols: 2 } },
    { title: '3x2', description: '30x20m', thumbnail: 'thumb-3x2', parcelLayout: { rows: 2, cols: 3 } },
    { title: 'Custom build', description: 'up to 32 parcels', thumbnail: 'thumb-custombuild', parcelLayout: { rows: 2, cols: 4 } }
  ]
}
