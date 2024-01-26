export class Scalar {
  /**
   * Returns a string : the upper case translation of the number i to hexadecimal.
   * @param i number
   * @returns the upper case translation of the number i to hexadecimal.
   */
  public static ToHex(i: number): string {
    const str = i.toString(16)

    if (i <= 15) {
      return ('0' + str).toUpperCase()
    }

    return str.toUpperCase()
  }
}

/**
 * Class used to hold a RBGA color
 */
export class Color4 {
  /**
   * Creates a new Color4 object from red, green, blue values, all between 0 and 1
   * @param r defines the red component (between 0 and 1, default is 0)
   * @param g defines the green component (between 0 and 1, default is 0)
   * @param b defines the blue component (between 0 and 1, default is 0)
   * @param a defines the alpha component (between 0 and 1, default is 1)
   */
  constructor(
    /**
     * Defines the red component (between 0 and 1, default is 0)
     */
    public r: number = 0,
    /**
     * Defines the green component (between 0 and 1, default is 0)
     */
    public g: number = 0,
    /**
     * Defines the blue component (between 0 and 1, default is 0)
     */
    public b: number = 0,
    /**
     * Defines the alpha component (between 0 and 1, default is 1)
     */
    public a: number = 1
  ) {}

  /**
   * Creates a string with the Color4 current values
   * @returns the string representation of the Color4 object
   */
  public toString(): string {
    return '{R: ' + this.r + ' G:' + this.g + ' B:' + this.b + ' A:' + this.a + '}'
  }

  /**
   * Compute the Color4 hexadecimal code as a string
   * @param returnAsColor3 defines if the string should only contains RGB values (off by default)
   * @returns a string containing the hexadecimal representation of the Color4 object
   */
  public toHexString(returnAsColor3 = false): string {
    const intR = Math.round(this.r * 255)
    const intG = Math.round(this.g * 255)
    const intB = Math.round(this.b * 255)

    if (returnAsColor3) {
      return '#' + Scalar.ToHex(intR) + Scalar.ToHex(intG) + Scalar.ToHex(intB)
    }

    const intA = Math.round(this.a * 255)
    return '#' + Scalar.ToHex(intR) + Scalar.ToHex(intG) + Scalar.ToHex(intB) + Scalar.ToHex(intA)
  }
}
