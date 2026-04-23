/** JikkyoChannelId → LiveEdge キーワードID */
export const JIKKYO_TO_LIVEEDGE_MAP: Record<string, string> = {
  jk1: 'NHK',
  jk2: 'ETV',
  jk4: 'NTV',
  jk6: 'TBS',
  jk8: 'CX',
  jk5: 'ANB',
  jk7: 'TX',
  jk9: 'MX',
  // BS
  jk101: 'BSNHK_BS1',
  jk103: 'BSNHK_BSP',
  jk141: 'BSFREE_NTV', // BS日テレ
  jk151: 'BSFREE_ANB', // BS朝日
  jk161: 'BSFREE_TBS', // BS-TBS
  jk171: 'BSFREE_TX', // BSテレ東
  jk181: 'BSFREE_CX', // BSフジ
  jk211: 'BSFREE_BS11', // BS11
  jk222: 'BSFREE_BS12', // BS12
}

/** LiveEdgeキーワードID → 検索キーワード配列 */
export const LIVEEDGE_KEYWORDS: Record<string, string[]> = {
  NHK: ['NHK総合', 'NHK', '*NHKスペシャル'],
  ETV: ['NHK教育', 'Eテレ', '*Eテレ', '*NHK'],
  NTV: ['日本テレビ', 'NTV', '日テレ', '*仰天'],
  ANB: ['テレビ朝日', 'EX', 'テレ朝', 'ﾆﾁｱｻ', '*玉川'],
  TBS: ['TBS', 'TBS系', '*ドラフト'],
  TX: ['テレビ東京', 'TX', 'テレ東'],
  CX: ['フジテレビ', 'CX', 'フジ', '*キチガイ一家'],
  MX: ['TOKYO MX', 'MX'],
  BSNHK_BS1: ['BS1', 'NHKBS1', 'ＢＳ１'],
  BSNHK_BSP: ['BSプレミアム', 'NHKBSプレミアム', 'ＢＳプレミアム'],
  BSFREE_NTV: ['BS日テレ', 'BS日本テレビ'],
  BSFREE_ANB: ['BS朝日', 'BS-朝日'],
  BSFREE_TBS: ['BS-TBS', 'BSTBS'],
  BSFREE_TX: ['BSテレ東', 'BSテレビ東京', 'BSジャパン'],
  BSFREE_CX: ['BSフジ', 'BSフジテレビ'],
  BSFREE_BS11: ['BS11', 'BSイレブン', 'BS11イレブン', '#^BS\\d+$'],
  BSFREE_BS12: ['BS12', 'BSトゥエルビ', 'TwellV'],
}

/** 対象キーワードIDの一覧 */
export const SUPPORTED_LIVEEDGE_KEYWORD_IDS = Object.keys(LIVEEDGE_KEYWORDS)

/** 過去ログアーカイブの最古のスレッド日時 (2023/10/06 18:59:09 JST) */
export const LIVEEDGE_ARCHIVE_EARLIEST_UNIX = 1696585149
