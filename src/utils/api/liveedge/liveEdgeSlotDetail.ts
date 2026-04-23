import type { DeepPartial } from 'utility-types'
import type { StateSlotDetailLiveEdge } from '@/ncoverlay/state'
import { deepmerge } from '@/utils/deepmerge'

export function liveEdgeToSlotDetail(
  title: string,
  jkChId: string,
  starttime: number,
  endtime: number,
  detail?: DeepPartial<StateSlotDetailLiveEdge>
): StateSlotDetailLiveEdge {
  const id = `liveedge:${jkChId}:${starttime}-${endtime}` as `liveedge:${string}:${number}-${number}`
  
  return deepmerge<StateSlotDetailLiveEdge, any>(
    {
      type: 'liveedge',
      id,
      status: 'pending',
      info: {
        id,
        source: 'liveedge',
        title,
        duration: endtime - starttime,
        date: [starttime * 1000, endtime * 1000],
        count: {
          comment: 0,
          kawaii: 0
        }
      },
      markers: [],
      chapters: []
    },
    detail
  )
}
