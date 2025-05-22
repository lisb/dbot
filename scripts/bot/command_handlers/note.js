const { OllamaWrapper } = require("../../ollama_wrapper");

const defaultNoteInstruction = `
思考の結果をもとに、ノートにまとめる。
指定されたjson形式のメッセージを返す。

{
    note_title: 'タイトル',
    note_content: 'コンテンツ',
}
`;

const noteInstruction = process.env.NOTE_INSTRUCTION || defaultNoteInstruction;

const actionstampSystemMsg = [
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
  for (let i = 0; i < num_retry; i++) {
    // easy reasoning
    const responseReason = await OllamaWrapper.getResponse(
      [messages[messages.length - 1]],
      options
    );
    const response = await OllamaWrapper.getResponse(
      [
        messages[messages.length - 1],
        { role: "assistant", content: responseReason },
        ...actionstampSystemMsg,
      ],
      {
        num_predict: 1024,
        temperature: 0.2,
      }
    );
    try {
      return JSON.parse(response.split("```")[1].replace("json", ""));
    } catch (e) {
      console.log("actionstamp parse error:", e);
      continue;
    }
  }
};

module.exports = {
  createNote,
};
