import React, { useMemo, useCallback } from 'react'
import { Loader, Icon, Layer } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { isPending, getEtherscanHref } from 'decentraland-dapps/dist/modules/transaction/utils'
import { TransactionStatus, Transaction } from 'decentraland-dapps/dist/modules/transaction/types'
import { formatDistanceToNow } from 'lib/date'
import { coordsToId, getCenter } from 'modules/land/utils'
import { Atlas } from 'components/Atlas'
import CollectionImage from 'components/CollectionCard/CollectionImage'
import Profile from 'components/Profile'
import { Props } from './TransactionDetail.types'
import './TransactionDetail.css'

const getHref = (tx: Transaction) => {
  if (tx.status === null) {
    return
  }
  return getEtherscanHref({ txHash: tx.replacedBy || tx.hash })
}

const Image = (props: Props) => {
  const { selection, address, collection } = props

  if (selection) {
    const set = useMemo(() => new Set((selection || []).map(coord => coordsToId(coord.x, coord.y))), [selection])
    const selectedStrokeLayer: Layer = useCallback((x, y) => (set.has(coordsToId(x, y)) ? { color: '#ff0044', scale: 1.4 } : null), [set])
    const selectedFillLayer: Layer = useCallback((x, y) => (set.has(coordsToId(x, y)) ? { color: '#ff9990', scale: 1.2 } : null), [set])
    const [x, y] = useMemo(() => (selection ? getCenter(selection) : [0, 0]), [selection])

    return <Atlas x={x} y={y} layers={[selectedStrokeLayer, selectedFillLayer]} width={48} height={48} size={9} isDraggable={false} />
  } else if (address) {
    return <Profile address={address!} size="huge" imageOnly />
  } else if (collection) {
    return <CollectionImage collection={collection} />
  } else {
    return <></>
  }
}

const TransactionDetail = (props: Props) => {
  const { text, tx } = props

  return (
    <div className="TransactionDetail">
      <div className="left">
        <div className="image">
          <Image {...props} />
        </div>
        <div className="text">
          <div className="description">{text}</div>
          <div className="timestamp">{formatDistanceToNow(tx.timestamp)}.</div>
        </div>
      </div>
      <div className="right">
        <a href={getHref(tx)} className={tx.status ? 'status ' + tx.status : 'status'} target="_blank" rel="noopener noreferrer">
          <div className="description">{tx.status || t('global.loading')}</div>
          {isPending(tx.status) ? (
            <div className="spinner">
              <Loader active size="mini" />
            </div>
          ) : null}
          {tx.status === TransactionStatus.REVERTED ? <Icon name="warning sign" /> : null}
          {tx.status === TransactionStatus.CONFIRMED || tx.status === TransactionStatus.REPLACED ? <Icon name="check" /> : null}
        </a>
      </div>
    </div>
  )
}

export default React.memo(TransactionDetail)
