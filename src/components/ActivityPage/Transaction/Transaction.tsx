import React from 'react'
import { Link } from 'react-router-dom'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getContractName } from 'decentraland-transactions'
import {
  GrantTokenSuccessAction,
  RevokeTokenSuccessAction,
  GRANT_TOKEN_SUCCESS,
  REVOKE_TOKEN_SUCCESS
} from 'decentraland-dapps/dist/modules/authorization/actions'
import { TransactionLink } from 'decentraland-dapps/dist/containers'
import { locations } from 'routing/locations'
import {
  TRANSFER_LAND_SUCCESS,
  EDIT_LAND_SUCCESS,
  SET_OPERATOR_SUCCESS,
  CREATE_ESTATE_SUCCESS,
  EDIT_ESTATE_SUCCESS,
  DISSOLVE_ESTATE_SUCCESS,
  SET_UPDATE_MANAGER_SUCCESS
} from 'modules/land/actions'
import { PUBLISH_THIRD_PARTY_ITEMS_SUCCESS, RESCUE_ITEMS_SUCCESS, SET_PRICE_AND_BENEFICIARY_REQUEST } from 'modules/item/actions'
import {
  MINT_COLLECTION_ITEMS_SUCCESS,
  SET_COLLECTION_MINTERS_SUCCESS,
  SET_COLLECTION_MANAGERS_SUCCESS,
  PUBLISH_COLLECTION_SUCCESS,
  APPROVE_COLLECTION_SUCCESS,
  REJECT_COLLECTION_SUCCESS
} from 'modules/collection/actions'
import { SET_ENS_RESOLVER_SUCCESS, SET_ENS_CONTENT_SUCCESS, ALLOW_CLAIM_MANA_SUCCESS, CLAIM_NAME_SUCCESS } from 'modules/ens/actions'
import { BUY_THIRD_PARTY_ITEM_SLOT_SUCCESS } from 'modules/thirdParty/actions'
import { getSaleAddress, getTotalAmountOfMintedItems } from 'modules/collection/utils'
import { isEnoughClaimMana } from 'modules/ens/utils'
import { includes } from 'lib/address'
import { difference } from 'lib/array'
import Profile from 'components/Profile'
import TransactionDetail from './TransactionDetail'
import { Props } from './Transaction.types'

const Transaction = (props: Props) => {
  const { tx } = props
  switch (tx.actionType) {
    case GRANT_TOKEN_SUCCESS:
    case REVOKE_TOKEN_SUCCESS: {
      const { authorization } = tx.payload as GrantTokenSuccessAction['payload'] | RevokeTokenSuccessAction['payload']
      const authorizedName = getContractName(authorization.authorizedAddress)
      const contractName = getContractName(authorization.contractAddress)
      const action = tx.actionType === GRANT_TOKEN_SUCCESS ? t('transaction.approved') : t('transaction.unapproved')
      return (
        <TransactionDetail
          address={authorization.address}
          text={
            <T
              id="transaction.approve_token"
              values={{
                action,
                contract: (
                  <TransactionLink chainId={authorization.chainId} address={authorization.authorizedAddress} txHash="">
                    {authorizedName}
                  </TransactionLink>
                ),
                token: (
                  <TransactionLink chainId={authorization.chainId} address={authorization.contractAddress} txHash="">
                    {contractName}
                  </TransactionLink>
                )
              }}
            />
          }
          tx={tx}
        />
      )
    }
    case TRANSFER_LAND_SUCCESS: {
      const { name, address, selection } = tx.payload
      return (
        <TransactionDetail
          selection={selection}
          text={
            <T
              id="transaction.transfer"
              values={{
                name: <strong>{name}</strong>,
                address: <Profile address={address} />
              }}
            />
          }
          tx={tx}
        />
      )
    }
    case EDIT_LAND_SUCCESS: {
      const { name, selection } = tx.payload
      return (
        <TransactionDetail
          selection={selection}
          text={
            <T
              id="transaction.edit"
              values={{
                name: <strong>{name}</strong>
              }}
            />
          }
          tx={tx}
        />
      )
    }
    case SET_OPERATOR_SUCCESS: {
      const { name, address, selection } = tx.payload
      return (
        <TransactionDetail
          selection={selection}
          text={
            <T
              id={address ? 'transaction.set_operator_assigned' : 'transaction.set_operator_revoked'}
              values={{
                name: <strong>{name}</strong>,
                address: <Profile address={address} />
              }}
            />
          }
          tx={tx}
        />
      )
    }
    case CREATE_ESTATE_SUCCESS: {
      const { name, selection } = tx.payload
      return (
        <TransactionDetail
          selection={selection}
          text={
            <T
              id="transaction.create_estate"
              values={{
                name: <strong>{name}</strong>
              }}
            />
          }
          tx={tx}
        />
      )
    }
    case EDIT_ESTATE_SUCCESS: {
      const { name, count, type, selection } = tx.payload
      return (
        <TransactionDetail
          selection={selection}
          text={
            <T
              id={`transaction.edit_estate_${type}`}
              values={{
                name: <strong>{name}</strong>,
                count
              }}
            />
          }
          tx={tx}
        />
      )
    }
    case DISSOLVE_ESTATE_SUCCESS: {
      const { name, selection } = tx.payload
      return (
        <TransactionDetail
          selection={selection}
          text={
            <T
              id="transaction.dissolve_estate"
              values={{
                name: <strong>{name}</strong>
              }}
            />
          }
          tx={tx}
        />
      )
    }
    case SET_UPDATE_MANAGER_SUCCESS: {
      const { address, type, isApproved } = tx.payload
      return (
        <TransactionDetail
          address={address}
          text={
            <T
              id={isApproved ? 'transaction.set_manager_assigned' : 'transaction.set_manager_revoked'}
              values={{
                address: <Profile address={address} textOnly />,
                type: t(`global.${type}_plural`)
              }}
            />
          }
          tx={tx}
        />
      )
    }
    case SET_PRICE_AND_BENEFICIARY_REQUEST: {
      const { item } = tx.payload
      return (
        <TransactionDetail
          item={item}
          text={
            <T id="transaction.set_price_and_beneficiary" values={{ name: <Link to={locations.itemDetail(item.id)}>{item.name}</Link> }} />
          }
          tx={tx}
        />
      )
    }
    case PUBLISH_COLLECTION_SUCCESS:
    case APPROVE_COLLECTION_SUCCESS:
    case REJECT_COLLECTION_SUCCESS:
    case SET_COLLECTION_MANAGERS_SUCCESS: {
      const { collection } = tx.payload

      const translationKey = {
        [PUBLISH_COLLECTION_SUCCESS]: 'collection_published',
        [APPROVE_COLLECTION_SUCCESS]: 'collection_approved',
        [REJECT_COLLECTION_SUCCESS]: 'collection_rejected',
        [SET_COLLECTION_MANAGERS_SUCCESS]: 'updated_collection_managers'
      }[tx.actionType]

      return (
        <TransactionDetail
          collectionId={collection.id}
          text={
            <T
              id={`transaction.${translationKey}`}
              values={{ name: <Link to={locations.collectionDetail(collection.id)}>{collection.name}</Link> }}
            />
          }
          tx={tx}
        />
      )
    }
    case MINT_COLLECTION_ITEMS_SUCCESS: {
      const { collection, mints } = tx.payload

      const isSingleMint = mints.length === 1
      const item = mints[0].item
      const transactionDetailData = isSingleMint ? { item } : { collection }
      return (
        <TransactionDetail
          {...transactionDetailData}
          text={
            <T
              id={isSingleMint ? 'transaction.collection_item_minted' : 'transaction.collection_items_minted'}
              values={{
                collectionName: <Link to={locations.collectionDetail(collection.id)}>{collection.name}</Link>,
                itemName: <Link to={locations.itemDetail(item.id)}>{item.name}</Link>,
                count: getTotalAmountOfMintedItems(mints)
              }}
            />
          }
          tx={tx}
        />
      )
    }
    case SET_COLLECTION_MINTERS_SUCCESS: {
      const { chainId } = tx
      const { collection, minters } = tx.payload

      const addedMinters = difference(minters, collection.minters)
      const removedMinters = difference(collection.minters, minters)

      const saleAddress = getSaleAddress(chainId)

      const hadSaleAccess = includes(removedMinters, saleAddress)
      const hasNewSaleAccess = includes(addedMinters, saleAddress)

      let translationId = ''
      if (hadSaleAccess) {
        translationId = 'transaction.unset_collection_on_sale'
      } else if (hasNewSaleAccess) {
        translationId = 'transaction.set_collection_on_sale'
      } else {
        translationId = 'transaction.updated_collection_minters'
      }
      return (
        <TransactionDetail
          collectionId={collection.id}
          text={
            <T
              id={translationId}
              values={{
                name: <Link to={locations.collectionDetail(collection.id)}>{collection.name}</Link>
              }}
            />
          }
          tx={tx}
        />
      )
    }
    case SET_ENS_RESOLVER_SUCCESS: {
      const { address, ens } = tx.payload
      return (
        <TransactionDetail
          address={address}
          text={
            <T
              id="transaction.set_ens_resolver"
              values={{
                address: <Profile address={address} />,
                name: ens.subdomain
              }}
            />
          }
          tx={tx}
        />
      )
    }
    case SET_ENS_CONTENT_SUCCESS: {
      const { address, ens, land } = tx.payload
      return (
        <TransactionDetail
          address={address}
          text={
            land ? (
              <T
                id="transaction.set_ens_content"
                values={{
                  address: <Profile address={address} />,
                  name: ens.subdomain,
                  land_link: <Link to={locations.landDetail(land.id)}>{land.name}</Link>
                }}
              />
            ) : (
              <T
                id="transaction.unset_ens_content"
                values={{
                  address: <Profile address={address} />,
                  name: ens.subdomain
                }}
              />
            )
          }
          tx={tx}
        />
      )
    }
    case ALLOW_CLAIM_MANA_SUCCESS: {
      const { address, allowance } = tx.payload
      return (
        <TransactionDetail
          address={address}
          text={
            isEnoughClaimMana(allowance) ? (
              <T id="transaction.allowed_claim_mana" values={{ address: <Profile address={address} /> }} />
            ) : (
              <T id="transaction.disallowed_claim_mana" values={{ address: <Profile address={address} /> }} />
            )
          }
          tx={tx}
        />
      )
    }
    case CLAIM_NAME_SUCCESS: {
      const { address, ens } = tx.payload
      return (
        <TransactionDetail
          address={address}
          text={
            <T
              id="transaction.claim_name"
              values={{
                address: <Profile address={address} />,
                name: ens.subdomain
              }}
            />
          }
          tx={tx}
        />
      )
    }

    case PUBLISH_THIRD_PARTY_ITEMS_SUCCESS: {
      const { collectionId, collectionName, items } = tx.payload
      return (
        <TransactionDetail
          tx={tx}
          collectionId={collectionId}
          text={
            <T
              id="transaction.publish_third_party_items"
              values={{
                count: items.length,
                collectionName: <Link to={locations.thirdPartyCollectionDetail(collectionId)}>{collectionName}</Link>
              }}
            />
          }
        />
      )
    }
    case BUY_THIRD_PARTY_ITEM_SLOT_SUCCESS: {
      const { thirdParty, slotsToyBuy } = tx.payload
      return (
        <TransactionDetail
          slotsToyBuy={slotsToyBuy}
          tx={tx}
          text={t('transaction.buy_third_party_item_slots', { count: slotsToyBuy, name: thirdParty.name })}
        />
      )
    }
    case RESCUE_ITEMS_SUCCESS: {
      const { count, collectionId, collectionName } = tx.payload
      return (
        <TransactionDetail
          tx={tx}
          collectionId={collectionId}
          text={
            <T
              id="transaction.rescue_items"
              values={{ count, collectionName: <Link to={locations.collectionDetail(collectionId)}>{collectionName}</Link> }}
            />
          }
        />
      )
    }
    default:
      return null
  }
}

export default React.memo(Transaction)
