export default function SelectTrigger({ label, value }: { label: string; value: string }) {
  return (
    <>
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      <div className="handle" />
    </>
  )
}
