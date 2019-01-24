import { Store } from 'redux'
import { RootState } from 'modules/common/types'
import { EventEmitter } from 'events'
import { getTemplates } from 'modules/template/utils'
import { createProjectFromTemplate } from 'modules/project/actions'

/**
 * An scenario that loads 25 projects
 * Meant to stress-test the HomePage UI with a somewhat bloated number of projects
 */

export function run(store: Store<RootState>, _: EventEmitter) {
  const templates = getTemplates().filter(template => !!template.parcelLayout) // Remove custom built projects
  const projectCount = 25
  const times = Math.round(projectCount / templates.length)

  for (let index = 0; index < times; index++) {
    for (const template of templates) {
      store.dispatch(createProjectFromTemplate(template))
    }
  }
}
