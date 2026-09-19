import { useState } from 'react'
import { ReleaseChannel, type ReleaseChannelValue } from './ReleaseChannel'

export default function ReleaseChannelDemo() {
  const [channel, setChannel] = useState<ReleaseChannelValue>('stable')
  return <ReleaseChannel value={channel} onChange={setChannel} />
}
