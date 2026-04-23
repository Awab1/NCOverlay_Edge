import type { Browser } from '@/utils/webext'

import { webext } from '@/utils/webext'
import { captureTab } from '@/utils/extension/captureTab'
import { setBadge } from '@/utils/extension/setBadge'
import { onMessageInBackground } from '@/messaging/to-background'

export default function () {
  onMessageInBackground('getCurrentTab', ({ sender }) => {
    return sender.tab as Browser.tabs.Tab
  })

  onMessageInBackground('setBadge', ({ sender, data }) => {
    return setBadge({
      tabId: sender.tab?.id,
      ...data,
    })
  })

  onMessageInBackground('captureTab', ({ sender, data }) => {
    return captureTab({
      windowId: sender.tab?.windowId,
      ...data,
    })
  })

  onMessageInBackground('openPopout', async ({ sender, data }) => {
    await webext[data.type].openPopout({
      tabId: sender.tab?.id,
      ...data.createData,
    })
  })

  onMessageInBackground('fetchProxy', async ({ data }) => {
    try {
      const res = await fetch(data.url)
      
      if (!res.ok) {
        return { ok: false, status: res.status, data: null }
      }
      
      if (data.responseType === 'shift_jis') {
        const buf = await res.arrayBuffer()
        let decoder: TextDecoder
        try {
          decoder = new TextDecoder('shift_jis', { fatal: false })
        } catch (e) {
          decoder = new TextDecoder('utf-8')
        }
        const text = decoder.decode(buf)
        return { ok: true, status: res.status, data: text }
      } else {
        const text = await res.text()
        return { ok: true, status: res.status, data: text }
      }
    } catch (e) {
      return { ok: false, status: 0, data: null }
    }
  })
}
