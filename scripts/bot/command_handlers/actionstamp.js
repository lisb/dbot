const { OllamaWrapper } = require("../../ollama_wrapper");
const { extractJSON } = require("../utils");

const defaultActionStampInstruction = `
与えられた要求に合わせて指定されたjson形式のメッセージを返す。必要に応じて締め切る

# Yes/No スタンプ(YesかNoかを選ぶ)
{
  "question": '質問内容',
  // (Option) 誰かが回答:0, 全員が回答:1
  "closing_type": 1  
}
※ Yes/No スタンプの closing_type のデフォルト値は 1 です

送信したYes/Noスタンプは締め切ることができます。

{  
  "close_yesno": // in_reply_toに格納されているメッセージのIDを指定する
}
※ sent.message.id については「メッセージの送信完了」を参照してください。

# セレクトスタンプ(指定された選択肢を選ぶ)
{
  "question": '質問内容',
  "options": ['選択肢1', '選択肢2', '選択肢3'],
  // (Option) 誰かが回答:0, 全員が回答:1
  "closing_type": 1
}
※ セレクトスタンプの closing_type のデフォルト値は 1 です

送信したセレクトスタンプは締め切ることができます。

{    
  "close_select": // in_reply_toに格納されているメッセージのIDを指定する
}
※ sent.message.id については「メッセージの送信完了」を参照してください。

# タスクスタンプ(やったかどうかを答える)
{
  "title": 'すること',
  // (Option) 誰かが回答:0, 全員が回答:1
  "closing_type": 0
}
※ タスクスタンプの closing_type のデフォルト値は 1 です

送信したタスクスタンプは締め切ることができます。

{
  "close_task": // in_reply_toに格納されているメッセージのIDを指定する
}
※ sent.message.id については「メッセージの送信完了」を参照してください。
`;

const actionStampInstruction =
  process.env.ACTIONSTAMP_INSTRUCTION || defaultActionStampInstruction;

const actionstampSystemMsg = [
  {
    role: "system",
    content: actionStampInstruction,
  },
  {
    role: "assistant",
    content:
      "わかりました.  マークダウン形式は使用しません。jsonのみを返します",
  },
];

const createActionStamp = async (
  messages,
  options = {
    num_predict: 256,
    temperature: 0.2,
  }
) => {
  const num_retry = 5;
  for (let i = 0; i < num_retry; i++) {
    const response = await OllamaWrapper.getResponse(
      [...actionstampSystemMsg, messages[messages.length - 1]],
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
