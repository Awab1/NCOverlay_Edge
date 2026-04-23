# <sub><img src="assets/icon.png" width="30px" height="30px"></sub> NCOverlay

## 概要
NCOverlayに[エッヂ掲示板](https://bbs.eddibb.cc/liveedge/)の過去ログ取得機能を追加したものです。

## 対応している動画配信サービス
- [dアニメストア](https://animestore.docomo.ne.jp/animestore/)
- [ABEMA](https://abema.tv/)
- [バンダイチャンネル](https://www.b-ch.com/)
- [DMM TV](https://tv.dmm.com/vod/)
- [U-NEXT](https://video.unext.jp/)
- [FOD](https://fod.fujitv.co.jp/)
- [Prime Video](https://www.amazon.co.jp/gp/video/storefront/)
- [Netflix](https://www.netflix.com/)
- [Hulu](https://www.hulu.jp/)
- [Disney+](https://www.disneyplus.com/)
- [ニコニコ動画](https://www.nicovideo.jp/)
- [NHK ONE](https://www.web.nhk/)
- [NHKオンデマンド](https://www.nhk-ondemand.jp/)
- [TVer](https://tver.jp/)

※ 増減する可能性あり

## 開発
### 環境
- [Bun](https://bun.com/)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Chrome](https://www.google.com/intl/ja/chrome/)

### 開発サーバー
```sh
# Chrome
bun run dev:chrome
```
```sh
# Firefox
bun run dev:firefox
```

### 出力
```sh
# dist/chrome-mv3
# dist/firefox-mv3
bun run build
```
```sh
# dist/chrome-mv3
bun run build:chrome
```
```sh
# dist/firefox-mv3
bun run build:firefox
```

### 出力 (ZIP)
```sh
# dist/ncoverlay-0.0.0-chrome.zip
# dist/ncoverlay-0.0.0-firefox.zip
# dist/ncoverlay-0.0.0-sources.zip
bun run zip
```
```sh
# dist/ncoverlay-0.0.0-chrome.zip
bun run zip:chrome
```
```sh
# dist/ncoverlay-0.0.0-firefox.zip
# dist/ncoverlay-0.0.0-sources.zip
bun run zip:firefox
```

## ライブラリ
- **nco-utils**<br>
[GitHub](https://github.com/Midra429/nco-utils) / [npm](https://www.npmjs.com/package/@midra/nco-utils)<br>
NCOverlay用のユーティリティライブラリ<br>
タイトル解析、自動検索、各サービスのAPI関連

## スペシャルサンクス
- **xpadev-net/niconicomments**<br>
[GitHub](https://github.com/xpadev-net/niconicomments) / [npm](https://www.npmjs.com/package/@xpadev-net/niconicomments)<br>
コメント描画

- **しょぼいカレンダー**<br>
https://docs.cal.syoboi.jp/spec/json.php/<br>
番組検索、放送時間取得

- **ニコニコ実況 過去ログ API**<br>
https://jikkyo.tsukumijima.net/<br>
ニコニコ実況の過去ログ

- **nicolog**<br>
https://nicolog.oyasumi.today/<br>
ニコニコ生放送のアニメコメントアーカイブ

## ライセンス
当ライセンスは [MIT](LICENSE.txt) ライセンスの規約に基づいて付与されています。
