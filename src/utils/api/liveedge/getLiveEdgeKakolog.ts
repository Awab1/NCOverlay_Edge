import type { NCOState } from '@/ncoverlay/state'
import type { V1Thread, V1Comment } from '@/types/niconico'
import type { JikkyoMarker, JikkyoChapter } from '@/types/storage'
import { JIKKYO_TO_LIVEEDGE_MAP, LIVEEDGE_KEYWORDS, LIVEEDGE_ARCHIVE_EARLIEST_UNIX } from './constants'
import { searchEdgeArchive } from './edgeArchiveSearcher'
import { matchesKeyword } from './threadMatcher'
import { parseDat } from './datParser'
import { sendMessageToBackground } from '@/messaging/to-background'

export interface GetLiveEdgeKakologParams {
  jkChId: string          // ニコニコ実況チャンネルID (例: 'jk1')
  starttime: number       // 放送開始 UNIX秒
  endtime: number         // 放送終了 UNIX秒
}

export interface GetLiveEdgeKakologResult {
  thread: V1Thread        // ニコニコ互換形式に変換済み
  markers: JikkyoMarker[]
  chapters: JikkyoChapter[]
  kawaiiCount: number
  threadUrl: string       // BBSスレッドURL
  threadTitle: string     // 最古スレッドのタイトル
}

function calculateMarkers(comments: V1Comment[], starttimeMs: number, durationBs: number): JikkyoMarker[] {
  const markers: JikkyoMarker[] = []
  const durationMs = durationBs * 1000
  
  for (let posMs = 0; posMs < durationMs; posMs += 60000) {
    const count = comments.filter(c => c.vposMs >= posMs && c.vposMs < posMs + 60000).length
    markers.push({ vposMs: posMs, comments: count })
  }
  return markers
}

export async function getLiveEdgeKakolog(
  state: NCOState,
  params: GetLiveEdgeKakologParams
): Promise<GetLiveEdgeKakologResult | null> {
  const { jkChId, starttime, endtime } = params
  
  // アーカイブ最古日時より前の番組は検索しない (負荷軽減)
  if (endtime < LIVEEDGE_ARCHIVE_EARLIEST_UNIX) return null
  
  const keywordId = JIKKYO_TO_LIVEEDGE_MAP[jkChId]
  if (!keywordId) return null
  
  const keywords = LIVEEDGE_KEYWORDS[keywordId]
  if (!keywords) return null
  
  // 検索キーワードの構築
  const searchTerms = keywords.map(k => {
    if (k.startsWith('*')) return k.slice(1)
    if (k.startsWith('#')) {
      // 正規表現キーワードからリテラル部分を抽出して検索語にする
      // 例: #^BS\d+$ → "BS"
      const match = k.slice(1).match(/^\^?([A-Za-z0-9\u3040-\u9FFF]+)/)
      return match ? match[1] : null
    }
    return k
  }).filter(Boolean).join(' ')
  
  // 日付の計算 (JSTを想定)
  const startObj = new Date(starttime * 1000)
  const endObj = new Date(endtime * 1000)
  
  const formatYYYYMMDD = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dStr = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${dStr}`
  }
  
  const startDate = formatYYYYMMDD(startObj)
  // end_dateは+1日にする (同日だとアーカイブ検索APIが結果を返さないため)
  const endObjPlusOne = new Date(endObj)
  endObjPlusOne.setDate(endObjPlusOne.getDate() + 1)
  const endDate = formatYYYYMMDD(endObjPlusOne)
  
  const archiveThreads = await searchEdgeArchive({
    keyword: searchTerms,
    startDate,
    endDate
  })
  
  const matchedThreads = archiveThreads.filter(t => matchesKeyword(t.title, keywords))
  
  // 時間帯フィルタ (開始1時間前から取得)
  const filterStartTime = starttime - 3600
  const filterEndTime = endtime
  
  const timeFilteredThreads = matchedThreads.filter(t => {
    const threadUnixSec = Math.floor(t.createdAt.getTime() / 1000)
    return threadUnixSec >= filterStartTime && threadUnixSec <= filterEndTime
  })
  
  const allComments: V1Comment[] = []
  let combinedKawaiiCount = 0
  let mainThreadUrl = ''
  let mainThreadTitle = ''
  
  timeFilteredThreads.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  
  if (timeFilteredThreads.length > 0) {
    mainThreadUrl = timeFilteredThreads[0].url
  }
  
  for (const t of timeFilteredThreads) {
    try {
      const datUrl = `https://bbs.eddibb.cc/liveedge/dat/${t.threadId}.dat`
      const res = await sendMessageToBackground('fetchProxy', {
        url: datUrl,
        responseType: 'shift_jis',
      })
      if (!res || !res.ok || !res.data) continue
      
      const datText = res.data
      const parsed = parseDat(datText)
      
      // 最古のスレッド (最初のループ) のタイトルを採用
      if (!mainThreadTitle && parsed.threadTitle) {
        mainThreadTitle = parsed.threadTitle
      }
      
      for (const response of parsed.responses) {
        if (!response.date) continue
        // URLを含むコメントを除外 (スパム・宣伝対策)
        if (/https?:\/\/|ttp:\/\//i.test(response.text)) continue
        const resUnixSec = Math.floor(response.date.getTime() / 1000)
        
        if (resUnixSec >= starttime && resUnixSec <= endtime) {
          const vposMs = response.date.getTime() - (starttime * 1000)
          
          if (response.text.includes('かわいい')) combinedKawaiiCount++
          
          allComments.push({
            id: `liveedge-${t.threadId}-${response.number}`,
            no: response.number,
            vposMs,
            body: response.text,
            commands: [],
            userId: response.userId,
            isPremium: false,
            score: 0,
            postedAt: response.date.toISOString(),
            nicoruCount: 0,
            nicoruId: null,
            source: 'liveedge',
            isMyPost: false
          })
        }
      }
    } catch (e) {
       console.error(`Failed to fetch dat for ${t.threadId}`, e)
    }
  }
  
  if (allComments.length === 0) return null
  
  const thread: V1Thread = {
    id: `liveedge:${jkChId}:${starttime}-${endtime}`,
    fork: 'main',
    commentCount: allComments.length,
    comments: allComments
  }
  
  const durationBs = endtime - starttime
  const markers = calculateMarkers(allComments, starttime * 1000, durationBs)
  const chapters: JikkyoChapter[] = []
  
  return {
    thread,
    markers,
    chapters,
    kawaiiCount: combinedKawaiiCount,
    threadUrl: mainThreadUrl,
    threadTitle: mainThreadTitle
  }
}
