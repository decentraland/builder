import { Header } from 'decentraland-ui'
import { Props } from './HorizontalCard.types'
import './HorizontalCard.css'

const HorizontalCard = ({ asset, isDragging }: Props) => {
  const { thumbnail, name } = asset

  let classes = 'AssetCard horizontal'
  if (isDragging) {
    classes += ' is-dragging'
  }
  if (asset.isDisabled) {
    classes += ' disabled'
  }

  return (
    <div className={classes}>
      <img className="thumbnail" src={thumbnail} alt="" draggable={false} />
      <Header size="small" className="title">
        {name}
      </Header>
    </div>
  )
}

export default HorizontalCard
