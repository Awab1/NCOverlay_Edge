export interface LiveEdgeRes {
  number: number
  name: string
  mail: string
  userId: string
  date: Date | null
  text: string          // HTMLタグ除去済みテキスト (<br> → 半角スペース変換)
}

export interface LiveEdgeDatResult {
  threadTitle: string
  responses: LiveEdgeRes[]
}

export function parseDat(datText: string): LiveEdgeDatResult {
  const lines = datText.split('\n')
  let threadTitle = ''
  const responses: LiveEdgeRes[] = []
  
  let number = 1
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    // <>で分割 5フィールド
    const cols = line.split('<>')
    if (cols.length < 5) continue
    
    const [name, mail, dateIdStr, bodyHtml, titleField] = cols
    
    if (i === 0) {
      if (titleField) {
        threadTitle = titleField
      }
    }
    
    // dateIdStr : "2025/08/19(月) 22:44:00.12 ID:AbCdEfGh"
    // Regex: (\d+)/(\d+)/(\d+)[^ ]* (\d+):(\d+):(\d+)(\.(\d+))?
    let date: Date | null = null
    let userId = ''
    
    const idMatch = dateIdStr.match(/ID:([^\s]+)/)
    if (idMatch) {
      userId = idMatch[1]
    }
    
    const dateMatch = dateIdStr.match(/(\d+)\/(\d+)\/(\d+)[^\s]* (\d+):(\d+):(\d+)(\.(\d+))?/)
    if (dateMatch) {
      const year = parseInt(dateMatch[1], 10)
      const month = parseInt(dateMatch[2], 10) - 1
      const day = parseInt(dateMatch[3], 10)
      const hour = parseInt(dateMatch[4], 10)
      const min = parseInt(dateMatch[5], 10)
      const sec = parseInt(dateMatch[6], 10)
      let ms = 0
      if (dateMatch[8]) {
        if (dateMatch[8].length === 2) {
          ms = parseInt(dateMatch[8], 10) * 10
        } else {
          ms = parseFloat('0.' + dateMatch[8]) * 1000
        }
      }
      date = new Date(year, month, day, hour, min, sec, ms)
    }
    
    // <br>タグを半角スペースに変換 (改行のままだとniconicommentsが複数行コメントとして
    // サイズ変更してしまい、大きいコメントが画面上部に重なって流れる原因になる)
    let text = bodyHtml.replace(/<br\s*\/?>/gi, ' ')
    // htmlタグ除去
    text = text.replace(/<[^>]+>/g, '')
    // HTMLエンティティデコード (数値参照も含む - 絵文字対応)
    text = text.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    text = text.replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    text = text.replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&quot;/g, '"')
    text = text.replace(/&amp;/g, '&')  // &amp; は最後にデコード (二重デコード防止)
    // アンカー除去 (>>123 等)
    text = text.replace(/>>(\d+)(-\d+)?/g, '')
    // 連続スペースを1つに圧縮し、前後の空白を除去
    text = text.replace(/\s+/g, ' ').trim()
    
    responses.push({
      number,
      name,
      mail,
      userId,
      date,
      text
    })
    
    number++
  }
  
  return {
    threadTitle,
    responses
  }
}
