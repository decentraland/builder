export function stringToHex(tmp: string) {
  let hex
  try {
    hex = unescape(encodeURIComponent(tmp))
      .split('')
      .map(function(v) {
        return v.charCodeAt(0).toString(16)
      })
      .join('')
  } catch (e) {
    hex = tmp
    console.log('invalid text input: ' + tmp)
  }
  return '0x' + hex
}
