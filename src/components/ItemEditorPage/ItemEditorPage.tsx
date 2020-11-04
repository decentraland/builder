import * as React from 'react'
import LeftPanel from './LeftPanel'
import CenterPanel from './CenterPanel'
import RightPanel from './RightPanel'
import { Props } from './ItemEditorPage.types'
import './ItemEditorPage.css'

export default class ItemEditorPage extends React.PureComponent<Props> {
  render() {
    return (
      <div className="ItemEditorPage">
        <LeftPanel />
        <CenterPanel />
        <RightPanel />
      </div>
    )
  }
}
