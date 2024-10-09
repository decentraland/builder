export function getOneYearFromNowDate() {
  const today = new Date()
  const year = today.getFullYear() + 1
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
