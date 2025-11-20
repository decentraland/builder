import { type ReactNode } from 'react'
import { CreateSingleItemModalContext, type CreateSingleItemModalContextValue } from './CreateSingleItemModal.context'

interface CreateSingleItemModalProviderProps {
  children: ReactNode
  value: CreateSingleItemModalContextValue
}

export const CreateSingleItemModalProvider = ({ children, value }: CreateSingleItemModalProviderProps) => {
  return <CreateSingleItemModalContext.Provider value={value}>{children}</CreateSingleItemModalContext.Provider>
}
