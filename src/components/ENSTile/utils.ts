import logoImg from '../../images/logo_dcl.svg'

// The tile used to be rendered by the marketplace server at 330x330, so every measure below is
// expressed in that coordinate space and scaled to whatever size the canvas is displayed at.
export const DESIGN_SIZE = 330

const INTER_SEMI_BOLD_URL = 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2'

const gradientColors = [
  { min: 2, max: 3, colors: ['#C640CD', '#691FA9'] }, // Purple gradient for name length 2-3
  { min: 4, max: 5, colors: ['#FF2D55', '#FFBC5B'] }, // Orange gradient for name length 4-5
  { min: 5, max: 6, colors: ['#73FFAF', '#1A9850'] }, // Green gradient for name length 5-6
  { min: 7, max: 8, colors: ['#81D1FF', '#3077E1'] }, // Blue gradient for name length 7-8
  { min: 9, max: 10, colors: ['#F6C1FF', '#FF4BED'] }, // Pink gradient for name length 9-10
  { min: 11, max: 15, colors: ['#FF9EB1', '#FF2D55'] } // Red gradient for name length 11-15 (max length)
]

export function getGradientColors(nameLength: number): string[] {
  const matchingGradient = gradientColors.find(gradient => nameLength >= gradient.min && nameLength <= gradient.max)
  return matchingGradient ? matchingGradient.colors : ['#000000', '#FFFFFF']
}

let fontPromise: Promise<void> | undefined

// Inter is not part of the app's stylesheet, so it has to be loaded before drawing the name.
function loadFont(): Promise<void> {
  if (!fontPromise) {
    if (typeof FontFace === 'undefined') {
      fontPromise = Promise.resolve()
    } else {
      const font = new FontFace('Inter', `url(${INTER_SEMI_BOLD_URL})`)
      document.fonts.add(font)
      fontPromise = font.load().then(() => undefined)
    }
  }
  return fontPromise
}

let logoPromise: Promise<HTMLImageElement> | undefined

function loadLogo(): Promise<HTMLImageElement> {
  if (!logoPromise) {
    logoPromise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onabort = reject
      img.onerror = reject
      img.src = logoImg
    })
  }
  return logoPromise
}

export async function drawTile(canvas: HTMLCanvasElement, name: string, onlyLogo?: boolean): Promise<void> {
  const ctx = canvas.getContext('2d')
  const displayWidth = canvas.offsetWidth
  const displayHeight = canvas.offsetHeight

  if (!ctx || !displayWidth || !displayHeight) {
    return
  }

  // Back the canvas with the device's pixel density so the tile is not blurry on retina screens.
  const pixelRatio = window.devicePixelRatio || 1
  canvas.width = displayWidth * pixelRatio
  canvas.height = displayHeight * pixelRatio
  ctx.scale((displayWidth * pixelRatio) / DESIGN_SIZE, (displayHeight * pixelRatio) / DESIGN_SIZE)

  const borderRadius = 8
  let nameYPosition = 0

  // Create a rounded rectangle path and clip everything drawn afterwards to it
  ctx.beginPath()
  ctx.moveTo(borderRadius, 0)
  ctx.lineTo(DESIGN_SIZE - borderRadius, 0)
  ctx.quadraticCurveTo(DESIGN_SIZE, 0, DESIGN_SIZE, borderRadius)
  ctx.lineTo(DESIGN_SIZE, DESIGN_SIZE - borderRadius)
  ctx.quadraticCurveTo(DESIGN_SIZE, DESIGN_SIZE, DESIGN_SIZE - borderRadius, DESIGN_SIZE)
  ctx.lineTo(borderRadius, DESIGN_SIZE)
  ctx.quadraticCurveTo(0, DESIGN_SIZE, 0, DESIGN_SIZE - borderRadius)
  ctx.lineTo(0, borderRadius)
  ctx.quadraticCurveTo(0, 0, borderRadius, 0)
  ctx.closePath()
  ctx.clip()

  // Generate the gradient based on the name length
  const colors = getGradientColors(name.length)
  const gradient = ctx.createLinearGradient(0, 0, DESIGN_SIZE, DESIGN_SIZE)
  gradient.addColorStop(0, colors[0])
  gradient.addColorStop(1, colors[1])
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, DESIGN_SIZE, DESIGN_SIZE)

  if (!onlyLogo) {
    try {
      await loadFont()

      ctx.font = '600 24px Inter'
      ctx.fillStyle = '#FCFCFC'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      nameYPosition = DESIGN_SIZE / 2 + 10
      ctx.fillText(name, DESIGN_SIZE / 2, nameYPosition)

      ctx.font = '700 16px Inter'
      ctx.fillStyle = '#FCFCFCCC'
      ctx.fillText('DCL.ETH', DESIGN_SIZE / 2, nameYPosition + 30)
    } catch (error) {
      console.error('Error loading the Inter font', error)
    }
  }

  try {
    const logo = await loadLogo()
    const logoWidth = onlyLogo ? DESIGN_SIZE * 0.8 : 40
    const logoHeight = onlyLogo ? DESIGN_SIZE * 0.8 : 40
    const logoXPosition = DESIGN_SIZE / 2 - logoWidth / 2
    const logoYPosition = onlyLogo ? DESIGN_SIZE / 2 - logoHeight / 2 : nameYPosition - logoHeight - 25
    ctx.drawImage(logo, logoXPosition, logoYPosition, logoWidth, logoHeight)
  } catch (error) {
    console.error('Error loading the Decentraland logo', error)
  }
}
