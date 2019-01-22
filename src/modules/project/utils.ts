import { Template, Project } from 'modules/project/types'

export default function getTemplates(): Template[] {
  return [
    { id: '1x1', title: '1x1', description: '10x10m', thumbnail: 'thumb-1x1' },
    { id: '2x2', title: '2x2', description: '20x20m', thumbnail: 'thumb-2x2' },
    { id: '3x2', title: '3x2', description: '30x20m', thumbnail: 'thumb-3x2' },
    { id: '?x?', title: 'Custom build', description: 'up to 32 parcels', thumbnail: 'thumb-custombuild' }
  ]
}

export function getProjectDimensions(project: { parcels: Project['parcels'] }): string {
  const side = project.parcels.length * 10
  return `${side}x${side}m`
}
