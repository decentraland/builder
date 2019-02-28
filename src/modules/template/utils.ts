import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import { Template } from 'modules/template/types'
import { Layout } from 'modules/project/types'
import { getDimensions } from 'lib/layout'

export const MAX_AREA = 32

export function getTemplates(): Template[] {
  return [
    { title: '1x1', description: getDimensions(1, 1), thumbnail: 'thumb-1x1', layout: { rows: 1, cols: 1 } },
    { title: '2x2', description: getDimensions(2, 2), thumbnail: 'thumb-2x2', layout: { rows: 2, cols: 2 } },
    { title: '2x3', description: getDimensions(2, 3), thumbnail: 'thumb-2x3', layout: { rows: 2, cols: 3 } },
    {
      title: t('custom_layout.title'),
      description: t('custom_layout.up_to', { max: MAX_AREA }),
      thumbnail: 'thumb-custombuild',
      custom: true
    }
  ]
}

export function fromLayout(layout: Layout): Template {
  const { rows, cols } = layout
  return {
    title: t('custom_layout.title'),
    description: getDimensions(rows, cols),
    thumbnail: `thumb-${rows}x${cols}`,
    layout: { rows, cols },
    custom: true
  }
}
