/**
 * キーワードプレフィックス:
 *   (なし) - 【】内セグメントと完全一致
 *   *      - タイトル全体に部分一致
 *   #      - 【】内セグメントに対して正規表現マッチ
 *            (例: #^BS\d+$ → 【BS11】【BS12】【BS13】... にマッチ)
 */
export function matchesKeyword(
  threadTitle: string,
  keywords: string[]
): boolean {
  for (const keyword of keywords) {
    if (keyword.startsWith('*')) {
      // *付きキーワード: *を除去してタイトル全体に部分一致
      const cleanKeyword = keyword.slice(1).toLowerCase()
      if (threadTitle.toLowerCase().includes(cleanKeyword)) {
        return true
      }
    } else if (keyword.startsWith('#')) {
      // #付きキーワード: #を除去して【】内セグメントに正規表現マッチ
      const regex = new RegExp(keyword.slice(1), 'i')
      const match = threadTitle.match(/^【(.*?)】/)
      if (match) {
        const segments = extractBracketSegments(match[1])
        for (const segment of segments) {
          if (regex.test(segment)) {
            return true
          }
        }
      }
    } else {
      // 通常キーワード: タイトル先頭の【】内と完全一致
      const match = threadTitle.match(/^【(.*?)】/)
      if (match) {
        const segments = extractBracketSegments(match[1])
        for (const segment of segments) {
          if (segment.toLowerCase() === keyword.toLowerCase()) {
            return true
          }
        }
      }
    }
  }
  return false
}

/**
 * 【】内のテキストからセグメントを抽出する
 * - カンマ区切り
 * - 「他」の除去
 * - →での分割
 */
function extractBracketSegments(bracketsContent: string): string[] {
  const results: string[] = []
  const segments = bracketsContent.split(',')
  for (const segment of segments) {
    let trimmed = segment.trim()

    if (trimmed === '他') continue
    if (trimmed.endsWith('他')) {
      trimmed = trimmed.slice(0, -1)
    }

    // →が存在する場合の処理
    const arrowSegments = trimmed.split('→')
    for (const arrowSegment of arrowSegments) {
      const s = arrowSegment.trim()
      if (s) results.push(s)
    }
  }
  return results
}
