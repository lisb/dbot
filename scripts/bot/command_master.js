const { OllamaWrapper } = require("../ollama_wrapper");
const { extractJSON } = require("./utils");

const commonInstruction = `
あなたはチャットアプリのボットを制御するコマンドマスターです。
あなたは、ユーザーからの入力に応じて必要なコマンドを生成し、ボットの挙動を制御します。
コントロールするボット名は「dbot」です。

あなたが使えるコマンドは以下のとおりです。
- c_message : メッセージを送信する
- c_actionstamp : チャットアプリの機能で他のユーザーに対しアンケートを作成できる。これをアクションスタンプという。アンケートには次の種類があるYes/No質問・Select質問・ToDo質問
- c_reply_actionstamp : アクションスタンプの回答に対して返答する("in_reply_to"がある場合)
- c_note: ノートを作成する（メッセージよりも長い文が書ける）
`

const defaultCommandInstruct = `
${commonInstruction}

次にどのようなアクションをするべきかを簡潔に考えます。
これはユーザーには表示されず、あなたの内部的な思考です。
**思考は箇条書きで、コマンド名やコードブロックを含まず、純粋な思考プロセスのみを記述してください。**

思考の例：
- ユーザーは挨拶をしている。メッセージを返すべきか？
- ユーザーはアンケートを作成したいようだ。c_actionstampを使うべきか？
- ユーザーはアクションスタンプに返答している。c_reply_actionstampを使うべきか？
- ユーザーは長い文章を作成したいようだ。c_noteを使うべきか？
`;

const defaultCommandInstruct2 = `
${commonInstruction}

与えられたユーザーの発話と思考の結果を元に、以下の例に従ってコマンドの配列のみを返します。それ以外は含めないでください。

例1：
ユーザー: 気分はどう?
思考: ユーザーは挨拶をしている。メッセージを返すべきか？
{"command": ["c_message"]}

例2:
ユーザー: 資料を確認するToDoを作成して
思考: ユーザーはToDoのアンケートを作成したいようだ。c_actionstampを使うべきか？
{"command": ["c_actionstamp"]}

例3:
ユーザー: AかBかCどれがいいか聞いて
思考: ユーザーは選択式のアンケートを作成したいようだ。c_actionstampを使うべきか？
{"command": ["c_actionstamp"]}

例4(組み合わせもあり):
ユーザー: こんにちは、明日の会議について連絡して
思考: ユーザーは挨拶と連絡を求めている。両方ともメッセージで対応すべきか？
{"command": ["c_message", "c_message"]}

例5(組み合わせもあり):
ユーザー: イベントの出欠確認をアンケートで作成して、参加者にお知らせもして
思考: ユーザーはアンケート作成とメッセージ送信を求めている。c_actionstampとc_messageを組み合わせるべきか？
{"command": ["c_message", "c_actionstamp"]}

例6:
ユーザー: // メッセージ: {"in_reply_to":"_394679468_-2105540608","response":0,"question":"晩御飯何がいい？","options":["カレー","ハンバーグ","ラーメン","パスタ","その他"],"listing":false,"closing_type":0}
思考: ユーザーはアクションスタンプの回答をしている。c_reply_actionstampを使うべきか？
{"command": ["c_reply_actionstamp"]}

例7:
ユーザー: ○○についてまとめて
思考: ユーザーは長い文章の作成を求めている。c_noteを使うべきか？
{"command": ["c_note"]}
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
    const temperature = 0.1 + i * 0.1;
    // easy reasoning
    const resReason = await OllamaWrapper.getResponse(
      [...defaultSystemMessage, messages[messages.length - 1]],
      { temperature }
    );
    const input = [
      ...defaultSystemMessage2,
      {
        role: "user",
        content: `ユーザー: ${messages[messages.length - 1].content}` // ユーザーからのメッセージとして明確に渡す
      },
      {
        role: "assistant",
        content: `思考: ${resReason}` // モデルの思考として明確に渡す
      }
    ];
    const response = await OllamaWrapper.getResponse(input, { temperature });
    console.log("commander response:", response);
    try {
      let commandStr = extractJSON(response);
      if (!commandStr) {
        console.log("command not found in response");
        continue;
      }
      const command = JSON.parse(commandStr);
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
