// Export all old ECS math functions as mocks
const Scalar = {
  toHex: i => {
    const str = i.toString(16)

    if (i <= 15) {
      return ('0' + str).toUpperCase()
    }

    return str.toUpperCase()
  }
}

const decentralandEcs = {
  core: {
    Color4: function (r, g, b, a) {
      return {
        r,
        g,
        b,
        a,
        toHexString: () => {
          const intR = (r * 255) | 0
          const intG = (g * 255) | 0
          const intB = (b * 255) | 0
          const intA = (a * 255) | 0
          return '#' + Scalar.toHex(intR) + Scalar.toHex(intG) + Scalar.toHex(intB) + Scalar.toHex(intA)
        }
      }
    }
  }
}

module.exports = decentralandEcs
