const emojiMap = {
  // 😀 Faces
  grinning: "😀",
  smile: "😄",
  smiley: "😃",
  grin: "😁",
  laughing: "😆",
  sweat_smile: "😅",
  joy: "😂",
  rofl: "🤣",
  relaxed: "☺️",
  blush: "😊",
  innocent: "😇",
  slight_smile: "🙂",
  upside_down: "🙃",
  wink: "😉",

  // 😍 Love
  heart_eyes: "😍",
  kissing_heart: "😘",
  kissing: "😗",
  kissing_smiling_eyes: "😙",
  kissing_closed_eyes: "😚",
  heart: "❤️",
  broken_heart: "💔",
  two_hearts: "💕",
  sparkles: "✨",

  // 😐 Neutral / negative
  neutral_face: "😐",
  expressionless: "😑",
  no_mouth: "😶",
  smirk: "😏",
  unamused: "😒",
  rolling_eyes: "🙄",
  thinking: "🤔",
  zipper_mouth: "🤐",

  // 😢 Sad
  sad: "😢",
  cry: "😢",
  sob: "😭",
  disappointed: "😞",
  worried: "😟",
  frown: "😦",
  anguished: "😧",

  // 😡 Angry
  angry: "😠",
  rage: "😡",
  face_with_symbols: "🤬",

  // 😱 Shock
  scream: "😱",
  flushed: "😳",
  exploding_head: "🤯",

  // 🤢 Sick
  sick: "🤢",
  nauseated: "🤮",
  mask: "😷",
  thermometer_face: "🤒",

  // 😴 Sleep
  sleepy: "😪",
  sleeping: "😴",

  // 😎 Cool
  sunglasses: "😎",
  nerd: "🤓",

  // 🤡 Misc faces
  clown: "🤡",
  skull: "💀",
  ghost: "👻",
  alien: "👽",
  robot: "🤖",
  poop: "💩",

  // 👍 Gestures
  thumbs_up: "👍",
  thumbs_down: "👎",
  ok_hand: "👌",
  clap: "👏",
  wave: "👋",
  raised_hands: "🙌",
  pray: "🙏",
  muscle: "💪",
  point_up: "☝️",

  // 👀 Body
  eyes: "👀",
  ear: "👂",
  nose: "👃",
  tongue: "👅",

  // 🐶 Animals
  dog: "🐶",
  cat: "🐱",
  mouse: "🐭",
  hamster: "🐹",
  rabbit: "🐰",
  fox: "🦊",
  bear: "🐻",
  panda: "🐼",
  lion: "🦁",
  tiger: "🐯",
  cow: "🐮",
  pig: "🐷",
  frog: "🐸",
  monkey: "🐵",

  // 🍎 Food
  apple: "🍎",
  banana: "🍌",
  grapes: "🍇",
  watermelon: "🍉",
  pizza: "🍕",
  burger: "🍔",
  fries: "🍟",
  hotdog: "🌭",
  taco: "🌮",
  cake: "🎂",
  cookie: "🍪",
  chocolate: "🍫",
  coffee: "☕",
  beer: "🍺",

  // ⚽ Activities
  soccer: "⚽",
  basketball: "🏀",
  football: "🏈",
  tennis: "🎾",
  gaming: "🎮",
  trophy: "🏆",

  // 🚗 Travel
  car: "🚗",
  taxi: "🚕",
  bus: "🚌",
  train: "🚆",
  airplane: "✈️",
  rocket: "🚀",

  // 💡 Objects
  bulb: "💡",
  phone: "📱",
  laptop: "💻",
  keyboard: "⌨️",
  tv: "📺",
  camera: "📷",
  clock: "⏰",

  // 🎉 Symbols
  fire: "🔥",
  star: "⭐",
  stars: "🌟",
  zap: "⚡",
  boom: "💥",
  check: "✅",
  cross: "❌",
  warning: "⚠️",
  question: "❓",
  exclamation: "❗",

  // 🏳️ Flags (some examples)
  flag_nl: "🇳🇱",
  flag_us: "🇺🇸",
  flag_gb: "🇬🇧",
  flag_de: "🇩🇪",
  flag_fr: "🇫🇷"
};

function replaceEmojiCodes(text) {
    return text.replace(/:([a-z_]+):/g, (match, name) => emojiMap[name] || match);
}

function replaceEmojiCodesInInput() {
    const cursorPosition = chatInput.selectionStart;
    const originalValue = chatInput.value;
    const updatedValue = replaceEmojiCodes(originalValue);

    if (originalValue === updatedValue) return;

    chatInput.value = updatedValue;

    const textBeforeCursor = originalValue.slice(0, cursorPosition);
    const updatedCursorPosition = replaceEmojiCodes(textBeforeCursor).length;
    chatInput.setSelectionRange(updatedCursorPosition, updatedCursorPosition);
}