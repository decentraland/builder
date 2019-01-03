import * as React from 'react'
import { Header } from 'decentraland-ui'
import './SideBar.css'

export default class SideBar extends React.Component {
  render() {
    return (
      <div className="SideBar">
        <Header size="medium">Item drawer</Header>
      </div>
    )
  }
}
