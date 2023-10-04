import { config } from 'config'

const dclNameStatsUrl = config.get('DCL_NAME_STATS_URL')

export type AccountHoldings = {
  owner: string
  ownedLands: number
  ownedNames: number
  ownedMana: number
  spaceAllowance: number
}

export const fetchAccountHoldings = async (account: string) => {
  let response: Response

  try {
    response = await fetch(`${dclNameStatsUrl}/account-holdings/${account}`, {
      method: 'POST'
    })
  } catch (e) {
    return null
  }

  if (!response.ok) {
    return null
  }

  const { data } = await response.json()

  return data as AccountHoldings
}

export const getMbsFromAccountHoldings = (accountHoldings: AccountHoldings) => {
  const manaMbs = Math.trunc(accountHoldings.ownedMana / 2000) * 100
  const landMbs = accountHoldings.ownedLands * 100
  const nameMbs = accountHoldings.ownedNames * 100

  return {
    manaMbs,
    landMbs,
    nameMbs
  }
}
