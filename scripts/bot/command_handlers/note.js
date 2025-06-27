const { OllamaWrapper } = require("../../ollama_wrapper");
const { extractJSON } = require("../utils");

const defaultNoteReasoningInstruction = `
あなたはユーザーからの入力を元に、ノート作成のための重要な情報を整理するアシスタントです。
ユーザーの発話から、ノートのタイトルになりそうなキーワード、ノートに含めるべき主要な内容やポイント、関連する事実などを抽出・整理してください。
出力は、箇条書き形式で簡潔にまとめてください。余計な情報や挨拶は含めないでください。

例：
ユーザー: 今日の会議の内容をまとめて。議題は新プロジェクトの進捗確認、次回のイベント企画、そして来月の予算について。
思考:
- 新プロジェクト進捗確認
- 次回イベント企画
- 来月予算
- 会議内容の要約
`;

const defaultNoteInstruction = `
思考の結果をもとに、ノートにまとめる。
指定されたjson形式のメッセージを返す。
タイトルとコンテンツは、与えられた思考の結果を元に生成してください。

{
    note_title: 'タイトル',
    note_content: 'コンテンツ',
}
`;

const noteInstruction = process.env.NOTE_INSTRUCTION || defaultNoteInstruction;

const noteReasonSystemMsg = [
  {
    role: "system",
    content: defaultNoteReasoningInstruction,
  },
];

const noteSystemMsg = [
  {
    role: "system",
    content: noteInstruction,
  },
];

const createNote = async (
  messages,
  options = {
    num_predict: 1024,
    temperature: 0.7,
  }
) => {
  const num_retry = 5;
  // easy reasoning
  const responseReason = await OllamaWrapper.getResponse(
    [...noteReasonSystemMsg, messages[messages.length - 1]],
    options
  );

  for (let i = 0; i < num_retry; i++) {
    const response = await OllamaWrapper.getResponse(
      [
        ...noteSystemMsg,
        messages[messages.length - 1],
        { role: "assistant", content: `思考:\n${responseReason}` },
      ],
      {
        num_predict: 1024,
        temperature: 0.2,
      }
    );
    try {
      let note = extractJSON(response);
      if (!note) {
        console.log("note not found in response");
        // 末尾対策
        note = extractJSON(response + '"}');
        if (!note) {
          console.log("note not found in responseReason");
          continue;
        }
      }
      return JSON.parse(note);
    } catch (e) {
      console.log("actionstamp parse error:", e);
      continue;
    }
  }
};

module.exports = {
  createNote,
};
