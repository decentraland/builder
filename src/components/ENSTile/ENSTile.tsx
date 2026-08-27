import { useEffect, useRef } from 'react'
import { Props } from './ENSTile.types'
import { drawTile } from './utils'

export default function ENSTile({ name, onlyLogo, className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const draw = () => {
      if (ref.current) {
        void drawTile(ref.current, name, onlyLogo)
      }
    }

    // Wait for the layout to settle so the canvas is measured at its final size.
    const frame = requestAnimationFrame(draw)
    // The tile is drawn at the size the canvas is displayed at, which changes with the viewport.
    window.addEventListener('resize', draw)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', draw)
    }
  }, [name, onlyLogo])

  return <canvas ref={ref} className={className} aria-hidden />
}
