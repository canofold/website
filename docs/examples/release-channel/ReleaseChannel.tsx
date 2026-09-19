import './styles.css'

export type ReleaseChannelValue = 'stable' | 'preview'

export interface ReleaseChannelProps {
  value: ReleaseChannelValue
  onChange: (value: ReleaseChannelValue) => void
}

export function ReleaseChannel({ value, onChange }: ReleaseChannelProps) {
  return (
    <section className="website-release-channel" aria-label="Release channel example">
      <span className="website-release-channel__status" aria-live="polite">
        {value === 'stable' ? 'Stable channel' : 'Preview channel'}
      </span>
      <div className="website-release-channel__options" role="group" aria-label="Release channel">
        {(['stable', 'preview'] as const).map((channel) => (
          <button
            key={channel}
            type="button"
            aria-pressed={value === channel}
            onClick={() => onChange(channel)}
          >
            {channel === 'stable' ? 'Stable' : 'Preview'}
          </button>
        ))}
      </div>
    </section>
  )
}
