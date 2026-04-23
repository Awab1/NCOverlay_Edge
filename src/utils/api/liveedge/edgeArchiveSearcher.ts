import { sendMessageToBackground } from '@/messaging/to-background'

export interface EdgeArchiveThread {
  url: string
  title: string
  titleClean: string    // レス数部分を除去済み
  resCount: number
  createdAt: Date
  threadId: string      // URLから抽出
}

export interface EdgeArchiveSearchParams {
  keyword: string       // スペース区切りのOR検索用キーワード
  startDate: string     // yyyy-MM-dd
  endDate: string       // yyyy-MM-dd
  minResCount?: number  // デフォルト: 30
  maxPages?: number     // デフォルト: 2
}

export async function searchEdgeArchive(
  params: EdgeArchiveSearchParams
): Promise<EdgeArchiveThread[]> {
  const { keyword, startDate, endDate, minResCount = 30, maxPages = 2 } = params
  const results: EdgeArchiveThread[] = []

  try {
    for (let page = 1; page <= maxPages; page++) {
      const queryParams = new URLSearchParams({
        keyword,
        onor: 'or',
        NoR: minResCount.toString(),
        sort: 'new',
        start_date: startDate,
        end_date: endDate
      })
      if (page > 1) {
        queryParams.append('page', page.toString())
      }

      const url = `https://eddiarchive3rd.boy.jp/?${queryParams.toString()}`

      const res = await sendMessageToBackground('fetchProxy', {
        url,
        responseType: 'text',
      })
      
      if (!res || !res.ok) {
        break
      }

      const html = res.data as string
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')
      
      const threadDivs = doc.querySelectorAll('div.thread')
      if (threadDivs.length === 0) {
        break // No more threads
      }

      for (const div of threadDivs) {
        const titleLink = div.querySelector('a.title') as HTMLAnchorElement
        const dateP = div.querySelector('p.date') as HTMLParagraphElement

        if (!titleLink || !dateP) continue

        const urlStr = titleLink.href
        // URL からスレッドIDを抽出: (例: https://bbs.eddibb.cc/test/read.cgi/liveedge/1755909182/)
        const match = urlStr.match(/\/(\d+)\/?$/)
        const threadId = match ? match[1] : ''
        
        const title = titleLink.textContent?.trim() || ''
        const dateStr = dateP.textContent?.trim() || '' // 2025/08/19 22:44:00
        
        let resCount = 0
        let titleClean = title

        // 抽出レス数: タイトル末尾の (数字)
        const resMatch = title.match(/\s*\((\d+)\)$/)
        if (resMatch) {
          resCount = parseInt(resMatch[1], 10)
          titleClean = title.slice(0, resMatch.index)
        }

        const createdAt = new Date(dateStr)

        results.push({
          url: urlStr,
          title,
          titleClean,
          resCount,
          createdAt,
          threadId
        })
      }

      if (threadDivs.length < 50) {
         break // Last page
      }
    }
  } catch (error) {
    console.error('Failed to search LiveEdge archive:', error)
  }

  return results
}
