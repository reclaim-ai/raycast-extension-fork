import { emojiFindingRegex } from "./emoji-helper";

export function testTextForEmoji(
  text: string,
) {
  let emoji;
  // try the simpler parser that will fail on Safari 14 lol
  // then complex emoji regex grabs flags but can fail some emojis
  try {
    emoji = /(\p{EPres}|\p{ExtPict})(\u200d(\p{EPres}|\p{ExtPict}))*/gu.exec(text);
  } catch (e) {
    emoji = emojiFindingRegex().exec(text);
  }
  return emoji;
}

export function stripPlannerEmojis(text: string): { textWithoutEmoji: string } {
  const emoji = testTextForEmoji(text);

  if (
    emoji &&
    emoji.index === 0 &&
    (emoji[0] === "🆓" || emoji[0] === "🛡" || emoji[0] === "🔒" || emoji[0] === "✅" || emoji[0] === "⚠️")
  ) {
    const textWithoutEmoji = text.slice(2);
    return { textWithoutEmoji };
  } else return { textWithoutEmoji: text };
}