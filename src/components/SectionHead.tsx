type Props = {
  index: string
  title: string
  count: number
  headingId: string
}

export default function SectionHead({ index, title, count, headingId }: Props) {
  return (
    <div className="sechead">
      <span className="mono sechead__num">{index}</span>
      <h2 className="sechead__title" id={headingId}>
        {title}
      </h2>
      <span className="sechead__rule" aria-hidden="true" />
      {count > 0 ? (
        <span className="mono sechead__count">
          {String(count).padStart(2, '0')} {count === 1 ? 'project' : 'projects'}
        </span>
      ) : null}
    </div>
  )
}
