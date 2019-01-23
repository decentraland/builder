import { Store } from 'redux'
import { RootState } from 'modules/common/types'
import { EventEmitter } from 'events'
import { getTemplates } from 'modules/template/utils'
import { createProjectFromTemplate } from 'modules/project/actions'

/**
 * An scenario that loads an Asset Pack that contains 500 assets.
 * Meant to stress-test the UI with a realistic number of assets.
 */

export function run(store: Store<RootState>, _: EventEmitter) {
  const templates = getTemplates().slice(0, -1)

  for (const template of templates) {
    store.dispatch(createProjectFromTemplate(template))
  }
}
