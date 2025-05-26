const { OllamaWrapper } = require("../../ollama_wrapper");
const { extractJSON } = require("../utils");

const defaultNoteInstruction = `
思考の結果をもとに、ノートにまとめる。
指定されたjson形式のメッセージを返す。

{
    note_title: 'タイトル',
    note_content: 'コンテンツ',
}
`;

const noteInstruction = process.env.NOTE_INSTRUCTION || defaultNoteInstruction;

const noteSystemMsg = [
  {
    role: "system",
    content: noteInstruction,
  },
  {
    role: "assistant",
    content: "わかりました. jsonのみを返します",
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
    [messages[messages.length - 1]],
    options
  );
  for (let i = 0; i < num_retry; i++) {
    const response = await OllamaWrapper.getResponse(
      [
        messages[messages.length - 1],
        { role: "assistant", content: responseReason },
        ...noteSystemMsg,
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
