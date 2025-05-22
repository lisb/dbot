const { OllamaWrapper } = require("../ollama_wrapper");

const defaultCommandInstruct = `
あなたはチャットアプリのボットを制御するコマンドマスターです。
あなたは、ユーザーからの入力に応じて必要なコマンドを生成し、ボットの挙動を制御します。
コントロールするボット名は「dbot」です。

あなたが使えるコマンドは以下のとおりです。
- c_message : メッセージを送信する
- c_actionstamp : チャットアプリの機能で他のユーザーに対しアンケートを作成できる。これをアクションスタンプという。アンケートには次の種類があるYes/No質問・Select質問・ToDo質問
- c_reply_actionstamp : アクションスタンプの回答に対して返答する("in_reply_to"がある場合)

まずは何をするべきかを簡潔に考えます。これはユーザーには表示されず、あなたの内部的な思考です。
`;

const defaultCommandInstruct2 = `
ユーザーの発話と思考の結果を元に、以下の例に従ってコマンドの配列のみを返します。それ以外は含めないでください

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
例6:
// メッセージ: {"in_reply_to":"_394679468_-2105540608","response":0,"question":"晩御飯何がいい？","options":["カレー","ハンバーグ","ラーメン","パスタ","その他"],"listing":false,"closing_type":0}
{"command": ["c_reply_atctionstamp]}
`;

const instruct = process.env.COMMAND_INSTRUCTION || defaultCommandInstruct;

const defaultSystemMessage = [
  {
    role: "system",
    content: instruct,
  },
];

const defaultSystemMessage2 = [
  {
    role: "system",
    content: defaultCommandInstruct2,
  },
];

const generateCommand = async (messages, numContinue = 5) => {
  for (let i = 0; i < numContinue; i++) {
    // easy reasoning
    const resReason = await OllamaWrapper.getResponse(
      [...defaultSystemMessage, messages[messages.length - 1]],
      { temperature: 0.1 }
    );
    const input = [
      ...defaultSystemMessage,
      messages[messages.length - 1],
      { role: "assistant", content: resReason },
      ...defaultSystemMessage2,
    ];
    const res = await OllamaWrapper.getResponse(input, { temperature: 0.1 });
    console.log("commander response:", res);
    try {
      const command = JSON.parse(res);
      if (!Array.isArray(command.command)) {
        console.log("command is not an array");
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
