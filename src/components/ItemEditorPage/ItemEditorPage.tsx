import * as React from 'react'
import { Item } from 'modules/item/types'
import TopPanel from './TopPanel'
import LeftPanel from './LeftPanel'
import CenterPanel from './CenterPanel'
import RightPanel from './RightPanel'
import { State, Props } from './ItemEditorPage.types'
import './ItemEditorPage.css'

export default class ItemEditorPage extends React.PureComponent<Props, State> {
  state: State = {
    reviewedItems: []
  }
  render() {
    const { reviewedItems } = this.state
    return (
      <>
        <div className="ItemEditorPage">
          <TopPanel reviewedItems={reviewedItems} />
          <div className="content">
            <LeftPanel
              onSetReviewedItems={(items: Item[]) =>
                this.setState(prevState => ({ reviewedItems: [...prevState.reviewedItems, ...items] }))
              }
            />
            <CenterPanel />
            <RightPanel />
          </div>
        </div>
      </>
    )
  }
}
