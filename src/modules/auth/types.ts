import { LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'

export type AuthState = {
  loading: LoadingState
  data: AuthData | null
  error: string | null
}

export type AuthData = {
  email: string
  sub: string
  idToken: string
  accessToken: string
  expiresAt: number
  user?: User
}

export type User = {
  id: string
  name: string
  description: string
  ethAddress: string
  avatar: Avatar
  version: number
  createdAt: Date
  updatedAt: Date
}

export type RemoteUser = {
  name: string
  description: string
  ethAddress: string
  avatar: Avatar
  version: number
  createdAt: string
  updatedAt: string
}

export type Color = {
  r: number
  g: number
  b: number
}

export type Avatar = {
  bodyShape: string
  eyes: {
    color: Color
  }
  hair: {
    color: Color
  }
  skin: {
    color: Color
  }
  snapshots: {
    body: string
    face: string
  }
  version: number
  wearables: string[]
}

export type LoginOptions = {
  returnUrl?: string
  openModal?: {
    name: string
    metadata?: any
  }
}
