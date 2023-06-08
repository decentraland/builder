export enum RedirectToTypes {
  COLLECTION_DETAIL_BY_CONTRACT_ADDRESS = 'COLLECTION_DETAIL_BY_CONTRACT_ADDRESS'
}

export type CollectionDetailByContractAddress = {
  type: RedirectToTypes.COLLECTION_DETAIL_BY_CONTRACT_ADDRESS
  data: {
    contractAddress: string
  }
}

export type RedirectTo = CollectionDetailByContractAddress

export type LocationStateProps = {
  fromParam?: string
}

export type DeployToWorldLocationStateProps = LocationStateProps & {
  projectId: string
}

export type ClaimNameLocationStateProps = LocationStateProps & {
  claimedName: string
}

export enum FromParam {
  COLLECTIONS = 'collections',
  TP_COLLECTIONS = 'thirdPartyCollections',
  DEPLOY_TO_WORLD = 'deployToWorld',
  CLAIM_NAME = 'claimName'
}
