# DBot (prototype)

<p align="center">
<img width="320" src="./assets/Gemini_Generated_Image_9x3pcf9x3pcf9x3p.jpeg" />
</p>

## Overview

Direct を使いこなすマルチモーダル AI アシスタント

下記の機能を利用可能です。

- メッセージ応答
- アクションスタンプ作成
- ノート作成
- 画像理解

## Get started

daab が installed されていることを前提としています。

### 1. Install Ollama

### 2. Install Ollama model

```bash
ollama run gemma3:4b

or

ollama run gemma3:12b
```

### 3. Install dependencies

```bash
npm install
```

### 4. Run the daab

```bash
daab login

daab run
```

### Oprtions

edit .env file
.env.example をコピーして .env にリネームしてください。

```bash
HUBOT_DIRECT_TOKEN=xxx // これは自動設定されます
OLLAMA_MODEL=gemma3:12b // gemma3:4b or gemma3:12b or gemma3:27b  性能が許す限り マルチモーダルモデルがおすすめ
DEFAULT_INSTRUCTION=お嬢様言葉で返答する // なくても動くきます。お好きなように
```
