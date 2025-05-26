const isFileJSON = (text) => {
  try {
    const json = JSON.parse(text);
    if (json.files || json.file_id) {
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
};

const extractJSON = (text) => {
  let jsonString = "";

  // 1. まず、バッククォートで囲まれたコードブロックを優先的に抽出
  // ````json` または ```` の形式に対応
  const codeBlockMatch = text.match(/```(?:json\s*)?([\s\S]*?)```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    jsonString = codeBlockMatch[1].trim(); // 前後の空白をトリム
  } else {
    // 2. コードブロックがない場合、テキスト全体から最も外側のJSONオブジェクトを抽出
    // { と } で囲まれた部分を検索
    // `[\s\S]*` を使うことで、改行を含む任意の文字にマッチ
    // `(\{[^}]*\})` のようにするとネストされたJSONに対応しきれない可能性があるので、
    // 最も外側の波括弧を捉える正規表現を使う
    const jsonMatch = text.match(/\{[\s\S]*\}/); // 最も外側の {} を探す
    if (jsonMatch && jsonMatch[0]) {
      jsonString = jsonMatch[0].trim(); // 前後の空白をトリム
    }
  }

  // 3. 抽出した文字列が有効なJSONであるか試す
  try {
    // JSON.parse() は厳密なので、ここではパース可能かチェックする
    // 不要な場合は直接返すことも可能ですが、有効なJSONを返す目的であれば必要
    const parsed = JSON.parse(jsonString);
    // 有効なJSONであれば、その文字列を返す（またはパース済みオブジェクトを返す）
    return jsonString;
  } catch (e) {
    // パースエラーが発生した場合、JSONを抽出できなかったと判断
    console.warn(
      "JSON extraction failed or extracted string is not valid JSON:",
      jsonString,
      e
    );
    // 有効なJSONが見つからなかった場合、null または空文字列を返すのが一般的
    return null;
  }
};

module.exports = {
  isFileJSON,
  extractJSON,
};
