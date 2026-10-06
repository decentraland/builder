import React from 'react'

export type Props = {
  storageKey: string
  title: string
  text: string
  isIncomplete: boolean
  listId: string
  // One <li> per row
  rows: React.ReactNode[]
  showAllLabel: (hiddenCount: number) => string
  showLessLabel: string
}
