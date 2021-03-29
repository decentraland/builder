import * as React from 'react'
import TopPanel from './TopPanel'
import LeftPanel from './LeftPanel'
import CenterPanel from './CenterPanel'
import RightPanel from './RightPanel'
import { Props } from './ItemEditorPage.types'
import './ItemEditorPage.css'

export default class ItemEditorPage extends React.PureComponent<Props> {
  render() {
    console.log('--------------------------------', this.props, '--------------------------------')

    return (
      <>
        <div className="ItemEditorPage">
          <TopPanel />
          <div className="content">
            <LeftPanel />
            <CenterPanel />
            <RightPanel />
          </div>
        </div>
      </>
    )
  }
}
