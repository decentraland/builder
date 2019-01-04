import * as React from 'react'
import { Button } from 'decentraland-ui'
import './HomePage.css'

export default class HomePage extends React.PureComponent {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <p>
            Edit <code>src/App.tsx</code> and save to reload.
          </p>
          <a href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
            Learn React
          </a>
          <br />
          <Button primary>Button</Button>
        </header>
      </div>
    )
  }
}
