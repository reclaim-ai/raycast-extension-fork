import { emojiFindingRegex } from "./emoji-helper";

export function getFirstEmojiFromString(text: string): RegExpExecArray | null {
  let emoji;
  // try the simpler parser first
  // then complex emoji regex grabs flags but can fail some emojis
  
  emoji = /(\p{EPres}|\p{ExtPict})(\u200d(\p{EPres}|\p{ExtPict}))*/gu.exec(text);

  if (emoji === null) {
    emoji = emojiFindingRegex().exec(text);
  }
  return emoji;
}

export function stripPlannerEmojis(text: string): string {
  const emoji = getFirstEmojiFromString(text);

  if (
    emoji &&
    emoji.index === 0 &&
    (emoji[0] === "🆓" || emoji[0] === "🛡" || emoji[0] === "🔒" || emoji[0] === "✅" || emoji[0] === "⚠️")
  ) {
    const textWithoutEmoji = text.slice(2);
    return textWithoutEmoji;
  } else return text;
}
