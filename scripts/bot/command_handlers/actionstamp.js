const { OllamaWrapper } = require("../../ollama_wrapper");
const { extractJSON } = require("../utils");

const defaultSelectActionStampInstruction = `
ユーザーの発話から、以下のいずれかのアクションスタンプの種類を特定してください。
- YesNo: はい/いいえで答える質問
- Select: 選択肢から選ぶ質問
- ToDo: やったかどうかを報告するタスク

返答は以下の形式で、種類名のみを返してください。それ以外のテキストは含めないでください。

例1:
ユーザー: 晩御飯何がいいか聞いて
Select

例2:
ユーザー: 明日の会議の出欠取る？
YesNo

例3:
ユーザー: 議事録書くタスク作って
ToDo
`;

const defaultActionStampInstruction = `
あなたはユーザーの要求をJSON形式のアクションスタンプに変換します。

# Yes/No スタンプ (Yes/Noを選ぶ質問)
例: {"question": "今日のランチ、カレーでいい？", "closing_type": 1}

# セレクトスタンプ (選択肢から選ぶ質問、optionsは必要に応じて変える)
例: {"question": "晩御飯何がいい？", "options": ["カレー","ハンバーグ","ラーメン"], "closing_type": 1}

# タスクスタンプ (やったか報告するタスク)
例: {"title": "報告書作成", "closing_type": 0}

**指示: 上記の例に従い、ユーザーの発話から適切なJSONオブジェクトを一つだけ生成してください。JSON以外のテキストは一切含めないでください。**
`;

const actionStampInstruction =
  process.env.ACTIONSTAMP_INSTRUCTION || defaultActionStampInstruction;

const actionstampSystemMsg = [
  {
    role: "system",
    content: actionStampInstruction,
  },
];

const determineActionStampType = async (userMessage) => {
  const response = await OllamaWrapper.getResponse(
    [
      { role: "system", content: defaultSelectActionStampInstruction },
      { role: "user", content: userMessage.content },
    ],
    { temperature: 0.1 }
  ); // 低い温度で厳密に
  return response.trim(); // 余分な空白を除去
};

const createActionStamp = async (
  messages,
  options = {
    num_predict: 256,
    temperature: 0.2,
  }
) => {
  const num_retry = 5;
  for (let i = 0; i < num_retry; i++) {
    const stampType = await determineActionStampType(
      messages[messages.length - 1]
    );
    console.log("Determined Stamp Type:", stampType);
    const response = await OllamaWrapper.getResponse(
      [
        ...actionstampSystemMsg,
        messages[messages.length - 1],
        {
          role: "assistant",
          content: `フォーマットに従って${stampType}のjsonを生成します。`,
        },
      ],
      options
    );
    try {
      let responseStr = extractJSON(response);
      if (!responseStr) {
        console.log("actionstamp parse error: no JSON found in response");
        continue;
      }
      return JSON.parse(responseStr);
    } catch (e) {
      console.log("actionstamp parse error:", e);
      continue;
    }
  }
};

module.exports = {
  createActionStamp,
};
