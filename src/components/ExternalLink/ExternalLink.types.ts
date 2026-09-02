import { ComponentPropsWithoutRef } from 'react'

export type Props = Omit<ComponentPropsWithoutRef<'a'>, 'href' | 'target' | 'rel'> & {
  href?: string | null
}
