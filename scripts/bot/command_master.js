const { OllamaWrapper } = require("../ollama_wrapper");

const defaultCommandInstruct = `
あなたはチャットアプリのボットを制御するコマンドマスターです。
あなたは、ユーザーからの入力に応じて必要なコマンドを生成し、ボットの挙動を制御します。
コントロールするボット名は「dbot」です。

あなたが使えるコマンドは以下のとおりです。
- c_message : メッセージを送信する
- c_actionstamp : チャットアプリの機能で他のユーザーに対しアンケートを作成できる。これをアクションスタンプという。アンケートには次の種類があるYes/No質問・Select質問・ToDo質問


これらのコマンドの配列を返します。
例1：
ユーザー: 気分はどう?
{"command": ["c_message"]}
例2:
ユーザー： 資料を確認するToDoを作成して
{"command": ["c_actionstamp"]}
例3:
ユーザー： AかBかCどれがいいか聞いて
{"command": ["c_actionstamp"]}
例4(組み合わせもあり):
{"command": ["c_message", "c_messsage"]}
例5(組み合わせもあり):
{"command": ["c_message", "c_actionstamp"]}
`;

const instruct = process.env.COMMAND_INSTRUCTION || defaultCommandInstruct;

const defaultSystemMessage = [
  {
    role: "system",
    content: instruct,
  },
  { role: "assistant", content: "承知しました。必要に合わせて応答します。" },
];

const generateCommand = async (messages, numContinue = 5) => {
  for (let i = 0; i < numContinue; i++) {
    const res = await OllamaWrapper.getResponse(
      [...defaultSystemMessage, messages[messages.length - 1]],
      { temperature: 0.1 }
    );
    console.log("commander response:", res);
    try {
      const command = JSON.parse(res);
      if (typeof command.command === Array) {
        console.log("command is undefined");
        continue;
      }
      return command;
    } catch (e) {
      console.log("command parse error:", e);
      continue;
    }
  }
};

module.exports = {
  generateCommand,
};
