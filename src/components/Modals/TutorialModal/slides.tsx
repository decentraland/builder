import * as React from 'react'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'

export const getSlides = () => [
  {
    thumbnail: `tutorial_0`,
    title: t(`tutorial_modal.slide0.title`),
    description: <T id={`tutorial_modal.slide0.description`} values={{ br: <br /> }} />
  },
  {
    thumbnail: `tutorial_1`,
    title: t(`tutorial_modal.slide1.title`),
    description: <T id={`tutorial_modal.slide1.description`} values={{ br: <br /> }} />
  },
  {
    thumbnail: `tutorial_2`,
    title: t(`tutorial_modal.slide2.title`),
    description: <T id={`tutorial_modal.slide2.description`} values={{ br: <br /> }} />
  },
  {
    thumbnail: `tutorial_3`,
    title: t(`tutorial_modal.slide3.title`),
    description: <T id={`tutorial_modal.slide3.description`} values={{ br: <br /> }} />
  },
  {
    thumbnail: `tutorial_4`,
    title: t(`tutorial_modal.slide4.title`),
    description: <T id={`tutorial_modal.slide4.description`} values={{ br: <br /> }} />
  }
]
