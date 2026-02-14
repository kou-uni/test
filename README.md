# ロボ助 - サポートロボット自己紹介サイト

未来からやってきたサポートロボット「ロボ助」の自己紹介サイトです。

## 機能

- 📱 レスポンシブデザイン
- 🤖 CSSアニメーション（浮遊するロボット）
- 💬 OpenAI APIを使ったチャット機能
- 🎨 モダンなUI/UX

## セットアップ

1. リポジトリをクローン
```bash
git clone https://github.com/kou-uni/test.git
cd test
```

2. OpenAI APIキーを設定
```bash
# Windowsの場合
set OPENAI_API_KEY=your_api_key_here

# Linux/Macの場合
export OPENAI_API_KEY=your_api_key_here
```

3. サーバーを起動
```bash
# Windowsの場合
set OPENAI_API_KEY=your_api_key_here && node server.js

# Linux/Macの場合
OPENAI_API_KEY=your_api_key_here node server.js
```

4. ブラウザで開く
```
http://localhost:3000/
```

## チャット機能について

右下のチャットボタンをクリックすると、ロボ助とAIチャットができます。
OpenAI GPT-3.5-turboを使用しています。

## 技術スタック

- HTML5 / CSS3
- Vanilla JavaScript
- Node.js
- OpenAI API

## ライセンス

MIT
