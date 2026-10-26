/**
 * 多语言页面构建脚本
 * 用法: node scripts/build.mjs   (在项目根目录执行)
 * 修改内容/翻译后重新运行,生成 index.html + {zh,ja,ko,es,pt}/index.html
 * 生成的文件直接提交,Cloudflare Pages 仍按纯静态部署,无需改构建配置
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(SCRIPT_DIR, "..");
const BASE = "https://ai-poster-generator.pages.dev";

/* ---------------- 语言字典 ---------------- */

const LANGS = {
  en: {
    name: "English", htmlLang: "en", ogLocale: "en_US",
    nav: "EN",
    meta: {
      title: "AI Poster Generator — Free Text-to-Poster Maker, No Sign-Up",
      desc: "Type an idea and get a ready-to-share AI poster in seconds. Free AI poster generator with automatic typography, 4 poster sizes, PNG download. No account needed.",
      ogTitle: "AI Poster Generator — Free Text-to-Poster Maker",
      ogDesc: "Type an idea, get a poster. Free AI poster generator with automatic typography. No sign-up."
    },
    appName: "AI Poster Generator",
    hero: { title: "AI Poster Generator", sub: "Type an idea. Get a ready-to-share poster in seconds — AI-painted artwork, perfectly typeset text, free and no sign-up." },
    headerCta: "Create a poster",
    tool: {
      prompt: "Describe your poster", promptPh: "e.g. grand opening of a coffee shop, warm and cozy",
      title: "Title", subtitle: "Subtitle", opt: "(optional)", cta: "Call to action",
      style: "Style",
      styles: { gradient: "Gradient", minimal: "Minimal", neon: "Neon", vintage: "Vintage", bold: "Bold Sale", pastel: "Pastel" },
      size: "Size",
      sizes: { poster: "Poster 4:5 · 1080×1350", square: "Square 1:1 · 1080×1080", story: "Story 9:16 · 1080×1920", wide: "Wide 16:9 · 1920×1080" },
      generate: "Generate poster", regenerate: "↻ Regenerate", download: "↓ Download PNG"
    },
    ui: {
      placeholder: "Describe your idea and hit Generate",
      painting: "Painting with AI… (usually 5–20s)",
      done: "Done ✓ Hit Regenerate for a different artwork.",
      fallback: "AI image service is busy — used a smart gradient instead. Try Regenerate.",
      exportFail: "Export failed — please try again."
    },
    ideas: {
      title: "Try these ideas", lead: "One click fills the form — then hit Generate.",
      items: [
        { emoji: "🎪", label: "Event poster", style: "neon", prompt: "music festival at night, neon lights, energetic crowd", title: "SOUND WAVE FEST", subtitle: "Aug 22 · Riverside Park", cta: "Get tickets now" },
        { emoji: "🛒", label: "Sale poster", style: "bold", prompt: "big sale background, dynamic diagonal shapes, red and yellow", title: "MEGA SALE", subtitle: "Up to 70% off", cta: "Shop today only" },
        { emoji: "🧘", label: "Quote poster", style: "minimal", prompt: "serene mountain lake at sunrise, soft mist, calm water", title: "Breathe.", subtitle: "Motivation starts with rest", cta: "" },
        { emoji: "🎂", label: "Birthday poster", style: "pastel", prompt: "birthday party with balloons and confetti, joyful pastel colors", title: "HAPPY BIRTHDAY", subtitle: "Join the party · 6 PM", cta: "You're invited!" }
      ]
    },
    how: {
      title: "How it works",
      steps: [
        { t: "Describe", d: "Type what your poster is about — an event, a sale, a mood. Pick a style and size." },
        { t: "Generate", d: "AI paints a unique background for your idea while our typography engine lays out your text." },
        { t: "Download", d: "Get a crisp PNG in the exact size for Instagram, Stories, or screens. One click." }
      ]
    },
    usecases: {
      title: "What can you create?",
      text: "The generator works for any occasion: event posters and gig flyers, sale posters with punchy promo energy, quote posters with calm scenery, birthday and party invitations, grand openings, workshops, church gatherings, sports matches and more. Each generation is unique — regenerate until it feels right, then download."
    },
    faq: {
      title: "Frequently asked questions",
      items: [
        { q: "Is this AI poster generator free?", a: "Yes. The generator is completely free and does not require an account. Open the page, type your idea, and download your poster." },
        { q: "How long does it take to generate a poster?", a: "Most posters are ready in 5 to 20 seconds. If the AI image service is busy, the generator instantly falls back to a smart gradient background so you always get a result." },
        { q: "Can I use the posters I create commercially?", a: "The posters you create are yours to use for social media, events and promotions. If you plan large-scale commercial use, please review the AI-imagery rules that apply in your country or industry." },
        { q: "What poster sizes are supported?", a: "Four sizes: Poster 4:5 (1080×1350) for Instagram, Square 1:1 (1080×1080), Story 9:16 (1080×1920) for Reels and TikTok, and Wide 16:9 (1920×1080) for screens and banners." },
        { q: "Will the AI write the text on my poster?", a: "The AI paints the background artwork. Your title, subtitle and call-to-action are typeset on top automatically, which keeps every word sharp and correctly spelled — a common weakness of pure image generators." }
      ]
    },
    footer: "© 2026 AI Poster Generator · Type an idea, get a poster."
  },

  zh: {
    name: "简体中文", htmlLang: "zh", ogLocale: "zh_CN",
    nav: "中文",
    meta: {
      title: "AI海报生成器 — 免费·文字秒变海报·无需注册",
      desc: "输入一句话创意，几秒生成可分享的AI海报。免费AI海报生成器：AI绘制背景、文字自动排版、4种尺寸、一键下载PNG，无需注册账号。",
      ogTitle: "AI海报生成器 — 免费·文字秒变海报",
      ogDesc: "输入创意，秒出海报。免费AI海报生成器，文字自动排版，无需注册。"
    },
    appName: "AI海报生成器",
    hero: { title: "AI海报生成器", sub: "输入创意，秒出成品——AI 绘制背景，文字自动排版，免费、无需注册。" },
    headerCta: "制作海报",
    tool: {
      prompt: "描述你的海报", promptPh: "例如：咖啡店开业，温馨暖色调",
      title: "标题", subtitle: "副标题", opt: "（可选）", cta: "行动按钮文字",
      style: "风格",
      styles: { gradient: "渐变", minimal: "极简", neon: "霓虹", vintage: "复古", bold: "促销大字", pastel: "柔和" },
      size: "尺寸",
      sizes: { poster: "海报 4:5 · 1080×1350", square: "方形 1:1 · 1080×1080", story: "竖屏 9:16 · 1080×1920", wide: "横版 16:9 · 1920×1080" },
      generate: "生成海报", regenerate: "↻ 换一张", download: "↓ 下载 PNG"
    },
    ui: {
      placeholder: "填写创意，点击「生成海报」",
      painting: "AI 绘制中…（通常 5–20 秒）",
      done: "完成 ✓ 点「换一张」试试不同效果。",
      fallback: "生图服务繁忙——已自动改用智能渐变背景，点「换一张」再试试。",
      exportFail: "导出失败，请重试。"
    },
    ideas: {
      title: "试试这些创意", lead: "一键填入表单，然后点「生成海报」。",
      items: [
        { emoji: "🎪", label: "活动海报", style: "neon", prompt: "music festival at night, neon lights, energetic crowd", title: "音浪音乐节", subtitle: "8月22日 · 滨江公园", cta: "立即抢票" },
        { emoji: "🛒", label: "促销海报", style: "bold", prompt: "big sale background, dynamic diagonal shapes, red and yellow", title: "全场大促", subtitle: "低至 3 折", cta: "仅限今日" },
        { emoji: "🧘", label: "语录海报", style: "minimal", prompt: "serene mountain lake at sunrise, soft mist, calm water", title: "深呼吸", subtitle: "动力始于休息", cta: "" },
        { emoji: "🎂", label: "生日海报", style: "pastel", prompt: "birthday party with balloons and confetti, joyful pastel colors", title: "生日快乐", subtitle: "下午 6 点 · 生日派对", cta: "恭喜你被邀请！" }
      ]
    },
    how: {
      title: "工作原理",
      steps: [
        { t: "描述", d: "输入海报主题——活动、促销或一种情绪，选好风格和尺寸。" },
        { t: "生成", d: "AI 为你的创意绘制独一无二的背景，排版引擎自动排好文字。" },
        { t: "下载", d: "获得适配 Instagram、Story 或屏幕的清晰 PNG，一键搞定。" }
      ]
    },
    usecases: {
      title: "你可以做什么？",
      text: "任何场合都适用：活动海报与演出传单、促销打折海报、安静治愈的语录海报、生日派对邀请、开业庆典、工作坊、社区聚会、体育赛事……每次生成都独一无二，不满意就换一张，满意就下载。"
    },
    faq: {
      title: "常见问题",
      items: [
        { q: "这个AI海报生成器免费吗？", a: "完全免费，无需注册账号。打开页面、输入创意，直接下载海报。" },
        { q: "生成一张海报要多久？", a: "通常 5 到 20 秒。如果 AI 绘图服务繁忙，会立即自动改用智能渐变背景，保证你总能拿到结果。" },
        { q: "生成的海报可以商用吗？", a: "你生成的海报可用于社交媒体、活动与宣传。如需大规模商业使用，请了解你所在国家/行业对 AI 图像的相关规定。" },
        { q: "支持哪些海报尺寸？", a: "四种：海报 4:5（1080×1350）适合 Instagram、方形 1:1（1080×1080）、竖屏 9:16（1080×1920）适合 Reels 和 TikTok、横版 16:9（1920×1080）适合屏幕与横幅。" },
        { q: "AI 会帮我在海报上写字吗？", a: "AI 负责绘制背景，标题、副标题和行动按钮由排版引擎自动排版，文字永远清晰、拼写正确——这解决了纯图像生成器的通病。" }
      ]
    },
    footer: "© 2026 AI海报生成器 · 输入创意，秒出海报。"
  },

  ja: {
    name: "日本語", htmlLang: "ja", ogLocale: "ja_JP",
    nav: "日本語",
    meta: {
      title: "AIポスタージェネレーター — 無料・テキストからポスターを即作成・登録不要",
      desc: "アイデアを入力するだけで、シェアできるAIポスターが数秒で完成。無料のAIポスタージェネレーター：AIが背景を描画、文字は自動レイアウト、4サイズ対応、PNGダウンロード、登録不要。",
      ogTitle: "AIポスタージェネレーター — 無料でポスター作成",
      ogDesc: "アイデアを入力してポスターが完成。無料AIポスタージェネレーター、文字は自動レイアウト、登録不要。"
    },
    appName: "AIポスタージェネレーター",
    hero: { title: "AIポスタージェネレーター", sub: "アイデアを入力して、すぐ完成 — AIが背景を描き、文字は自動で美しく配置。無料・登録不要。" },
    headerCta: "ポスターを作る",
    tool: {
      prompt: "ポスターを説明する", promptPh: "例：カフェのグランドオープン、温かみのある色調",
      title: "タイトル", subtitle: "サブタイトル", opt: "（任意）", cta: "ボタン文",
      style: "スタイル",
      styles: { gradient: "グラデーション", minimal: "ミニマル", neon: "ネオン", vintage: "レトロ", bold: "セール強調", pastel: "パステル" },
      size: "サイズ",
      sizes: { poster: "ポスター 4:5 · 1080×1350", square: "正方形 1:1 · 1080×1080", story: "ストーリー 9:16 · 1080×1920", wide: "ワイド 16:9 · 1920×1080" },
      generate: "ポスターを生成", regenerate: "↻ 再生成", download: "↓ PNGをダウンロード"
    },
    ui: {
      placeholder: "アイデアを入力して「生成」を押してください",
      painting: "AIが描画中…（通常5〜20秒）",
      done: "完成 ✓ 「再生成」で別のデザインに。",
      fallback: "画像生成サービスが混み合っているため、スマートなグラデーション背景で代用しました。「再生成」をお試しください。",
      exportFail: "書き出しに失敗しました。もう一度お試しください。"
    },
    ideas: {
      title: "こんなアイデアはいかが", lead: "ワンクリックで入力 → 生成ボタンを押すだけ。",
      items: [
        { emoji: "🎪", label: "イベントポスター", style: "neon", prompt: "music festival at night, neon lights, energetic crowd", title: "サウンドウェーブ フェス", subtitle: "8月22日 · リバーサイド公園", cta: "チケットはこちら" },
        { emoji: "🛒", label: "セールポスター", style: "bold", prompt: "big sale background, dynamic diagonal shapes, red and yellow", title: "大セール", subtitle: "最大70%オフ", cta: "今日だけ" },
        { emoji: "🧘", label: "名言ポスター", style: "minimal", prompt: "serene mountain lake at sunrise, soft mist, calm water", title: "深呼吸。", subtitle: "がんばる前に、休もう", cta: "" },
        { emoji: "🎂", label: "誕生日ポスター", style: "pastel", prompt: "birthday party with balloons and confetti, joyful pastel colors", title: "お誕生日おめでとう", subtitle: "午後6時 · パーティー", cta: "ご招待します！" }
      ]
    },
    how: {
      title: "使い方",
      steps: [
        { t: "入力", d: "ポスターのテーマ（イベント・セール・雰囲気）を入力し、スタイルとサイズを選択。" },
        { t: "生成", d: "AIがあなただけの背景を描き、タイポグラフィエンジンが文字を自動配置。" },
        { t: "ダウンロード", d: "Instagramやストーリーに最適な鮮明なPNGをワンクリックで取得。" }
      ]
    },
    usecases: {
      title: "どんな場面に使える？",
      text: "イベントポスターやライブフライヤー、派手なセールポスター、落ち着いた名言ポスター、誕生日やパーティーの招待状、オープン記念、ワークショップ、スポーツ大会など、あらゆる場面に。生成は毎回ユニーク — 気に入るまで再生成して、ダウンロード。"
    },
    faq: {
      title: "よくある質問",
      items: [
        { q: "このAIポスタージェネレーターは無料ですか？", a: "はい、完全無料でアカウント登録も不要です。ページを開いてアイデアを入力し、ポスターをダウンロードするだけです。" },
        { q: "ポスターの生成にはどれくらい時間がかかりますか？", a: "通常は5〜20秒です。AI画像サービスが混み合っている場合は、自動でスマートなグラデーション背景に切り替わるため、必ず結果を得られます。" },
        { q: "作成したポスターを商用利用できますか？", a: "生成したポスターはSNS・イベント・プロモーションにご利用いただけます。大規模な商用利用の際は、お住まいの国・業界のAI画像に関する規定をご確認ください。" },
        { q: "対応しているポスターのサイズは？", a: "4サイズ：ポスター4:5（1080×1350・Instagram向け）、正方形1:1（1080×1080）、ストーリー9:16（1080×1920・Reels/TikTok向け）、ワイド16:9（1920×1080・画面・バナー向け）。" },
        { q: "AIがポスターに文字を書いてくれますか？", a: "AIは背景アートを担当し、タイトル・サブタイトル・CTAはレイアウトエンジンが自動配置します。文字が常に鮮明で正しいのは、純粋な画像生成AIの弱点を解決しているからです。" }
      ]
    },
    footer: "© 2026 AIポスタージェネレーター · アイデアを入れて、ポスターのできあがり。"
  },

  ko: {
    name: "한국어", htmlLang: "ko", ogLocale: "ko_KR",
    nav: "한국어",
    meta: {
      title: "AI 포스터 메이커 — 무료 텍스트→포스터, 가입 불필요",
      desc: "아이디어를 입력하면 몇 초 만에 공유할 수 있는 AI 포스터가 완성됩니다. 무료 AI 포스터 생성기: AI 배경 그리기, 자동 타이포그래피, 4가지 크기, PNG 다운로드, 가입 불필요.",
      ogTitle: "AI 포스터 메이커 — 무료 포스터 생성",
      ogDesc: "아이디어를 입력하세요, 포스터가 완성됩니다. 무료 AI 포스터 메이커, 가입 불필요."
    },
    appName: "AI 포스터 메이커",
    hero: { title: "AI 포스터 메이커", sub: "아이디어를 입력하면 바로 완성 — AI가 배경을 그리고, 글자는 자동으로 깔끔하게 배치됩니다. 무료 · 가입 불필요." },
    headerCta: "포스터 만들기",
    tool: {
      prompt: "포스터를 설명해주세요", promptPh: "예: 카페 그랜드 오픈, 따뜻한 톤",
      title: "제목", subtitle: "부제목", opt: "(선택)", cta: "버튼 문구",
      style: "스타일",
      styles: { gradient: "그라데이션", minimal: "미니멀", neon: "네온", vintage: "빈티지", bold: "세일 강조", pastel: "파스텔" },
      size: "크기",
      sizes: { poster: "포스터 4:5 · 1080×1350", square: "정사각형 1:1 · 1080×1080", story: "스토리 9:16 · 1080×1920", wide: "와이드 16:9 · 1920×1080" },
      generate: "포스터 생성", regenerate: "↻ 다시 생성", download: "↓ PNG 다운로드"
    },
    ui: {
      placeholder: "아이디어를 입력하고 생성을 누르세요",
      painting: "AI가 그리는 중… (보통 5~20초)",
      done: "완료 ✓ '다시 생성'으로 다른 디자인을 시도해보세요.",
      fallback: "AI 이미지 서비스가 혼잡하여 스마트 그라데이션 배경으로 대체했습니다. '다시 생성'을 시도해보세요.",
      exportFail: "내보내기에 실패했습니다. 다시 시도해주세요."
    },
    ideas: {
      title: "이런 아이디어는 어때요", lead: "한 번의 클릭으로 폼이 채워집니다 — 그리고 생성을 누르세요.",
      items: [
        { emoji: "🎪", label: "이벤트 포스터", style: "neon", prompt: "music festival at night, neon lights, energetic crowd", title: "사운드웨이브 페스티벌", subtitle: "8월 22일 · 리버사이드 공원", cta: "지금 티켓 구매" },
        { emoji: "🛒", label: "세일 포스터", style: "bold", prompt: "big sale background, dynamic diagonal shapes, red and yellow", title: "초대형 세일", subtitle: "최대 70% 할인", cta: "오늘만" },
        { emoji: "🧘", label: "명언 포스터", style: "minimal", prompt: "serene mountain lake at sunrise, soft mist, calm water", title: "숨을 쉬어요", subtitle: "동기는 휴식에서 시작됩니다", cta: "" },
        { emoji: "🎂", label: "생일 포스터", style: "pastel", prompt: "birthday party with balloons and confetti, joyful pastel colors", title: "생일 축하합니다", subtitle: "오후 6시 · 파티", cta: "초대합니다!" }
      ]
    },
    how: {
      title: "사용 방법",
      steps: [
        { t: "입력", d: "포스터 주제(이벤트, 세일, 분위기)를 입력하고 스타일과 크기를 선택하세요." },
        { t: "생성", d: "AI가 고유한 배경을 그리고, 타이포그래피 엔진이 글자를 자동 배치합니다." },
        { t: "다운로드", d: "Instagram, 스토리, 화면에 딱 맞는 선명한 PNG를 한 번의 클릭으로 받으세요." }
      ]
    },
    usecases: {
      title: "어디에 쓸 수 있나요?",
      text: "모든 상황에 사용 가능: 이벤트 포스터와 공연 전단, 강렬한 세일 포스터, 차분한 명언 포스터, 생일·파티 초대장, 개업 기념, 워크숍, 스포츠 대회 등. 생성물은 매번 고유하며, 마음에 들 때까지 다시 만들고 다운로드하세요."
    },
    faq: {
      title: "자주 묻는 질문",
      items: [
        { q: "이 AI 포스터 메이커는 무료인가요?", a: "네, 완전 무료이며 계정 가입도 필요 없습니다. 페이지를 열고 아이디어를 입력한 뒤 포스터를 다운로드하세요." },
        { q: "포스터 생성은 얼마나 걸리나요?", a: "보통 5~20초입니다. AI 이미지 서비스가 혼잡하면 자동으로 스마트 그라데이션 배경으로 전환되어 항상 결과를 받을 수 있습니다." },
        { q: "만든 포스터를 상업적으로 사용할 수 있나요?", a: "생성한 포스터는 SNS, 이벤트, 홍보에 자유롭게 사용할 수 있습니다. 대규모 상업 사용 전에 소속 국가·업계의 AI 이미지 관련 규정을 확인하세요." },
        { q: "지원되는 포스터 크기는 무엇인가요?", a: "네 가지: 포스터 4:5(1080×1350, Instagram), 정사각형 1:1(1080×1080), 스토리 9:16(1080×1920, Reels·TikTok), 와이드 16:9(1920×1080, 화면·배너)." },
        { q: "AI가 포스터에 글자를 써주나요?", a: "AI는 배경 아트를 담당하고, 제목·부제목·CTA는 레이아웃 엔진이 자동 배치합니다. 글자가 항상 선명하고 정확한 것은 순수 이미지 생성기의 약점을 해결했기 때문입니다." }
      ]
    },
    footer: "© 2026 AI 포스터 메이커 · 아이디어를 입력하세요, 포스터가 됩니다."
  },

  es: {
    name: "Español", htmlLang: "es", ogLocale: "es_ES",
    nav: "ES",
    meta: {
      title: "Generador de Carteles con IA — Gratis, de texto a póster, sin registro",
      desc: "Escribe una idea y obtén un póster con IA listo para compartir en segundos. Generador de carteles con IA gratuito: fondos pintados por IA, tipografía automática, 4 tamaños, descarga PNG. Sin cuenta.",
      ogTitle: "Generador de Carteles con IA — Gratis",
      ogDesc: "Escribe una idea, obtén un póster. Generador de carteles con IA gratuito, sin registro."
    },
    appName: "Generador de Carteles con IA",
    hero: { title: "Generador de Carteles con IA", sub: "Escribe una idea y obtén un póster listo para compartir en segundos — arte pintado por IA, texto perfectamente maquetado, gratis y sin registro." },
    headerCta: "Crear un póster",
    tool: {
      prompt: "Describe tu póster", promptPh: "ej. inauguración de una cafetería, tonos cálidos",
      title: "Título", subtitle: "Subtítulo", opt: "(opcional)", cta: "Texto del botón",
      style: "Estilo",
      styles: { gradient: "Degradado", minimal: "Minimalista", neon: "Neón", vintage: "Vintage", bold: "Rebaja", pastel: "Pastel" },
      size: "Tamaño",
      sizes: { poster: "Póster 4:5 · 1080×1350", square: "Cuadrado 1:1 · 1080×1080", story: "Historia 9:16 · 1080×1920", wide: "Horizontal 16:9 · 1920×1080" },
      generate: "Generar póster", regenerate: "↻ Regenerar", download: "↓ Descargar PNG"
    },
    ui: {
      placeholder: "Describe tu idea y pulsa Generar",
      painting: "Pintando con IA… (normalmente 5–20 s)",
      done: "Listo ✓ Pulsa Regenerar para otro diseño.",
      fallback: "El servicio de imágenes IA está ocupado — se usó un degradado inteligente. Prueba Regenerar.",
      exportFail: "Error al exportar — inténtalo de nuevo."
    },
    ideas: {
      title: "Prueba estas ideas", lead: "Un clic rellena el formulario — luego pulsa Generar.",
      items: [
        { emoji: "🎪", label: "Cartel de evento", style: "neon", prompt: "music festival at night, neon lights, energetic crowd", title: "FESTIVAL ONDA SONORA", subtitle: "22 de ago · Parque Riverside", cta: "Consigue entradas" },
        { emoji: "🛒", label: "Cartel de rebajas", style: "bold", prompt: "big sale background, dynamic diagonal shapes, red and yellow", title: "MEGA OFERTA", subtitle: "Hasta 70% dto.", cta: "Solo hoy" },
        { emoji: "🧘", label: "Cartel de frase", style: "minimal", prompt: "serene mountain lake at sunrise, soft mist, calm water", title: "Respira.", subtitle: "El descanso también motiva", cta: "" },
        { emoji: "🎂", label: "Cartel de cumpleaños", style: "pastel", prompt: "birthday party with balloons and confetti, joyful pastel colors", title: "FELIZ CUMPLEAÑOS", subtitle: "Fiesta a las 18:00", cta: "¡Estás invitado!" }
      ]
    },
    how: {
      title: "Cómo funciona",
      steps: [
        { t: "Describe", d: "Escribe de qué va tu póster — un evento, una rebaja, un estado de ánimo. Elige estilo y tamaño." },
        { t: "Genera", d: "La IA pinta un fondo único para tu idea mientras nuestro motor tipográfico coloca tu texto." },
        { t: "Descarga", d: "Obtén un PNG nítido en el tamaño exacto para Instagram, Stories o pantallas. Un clic." }
      ]
    },
    usecases: {
      title: "¿Qué puedes crear?",
      text: "Sirve para cualquier ocasión: carteles de eventos y conciertos, rebajas con energía llamativa, frases con paisajes tranquilos, invitaciones de cumpleaños y fiestas, inauguraciones, talleres, encuentros deportivos y más. Cada generación es única — regenera hasta que te encante y descarga."
    },
    faq: {
      title: "Preguntas frecuentes",
      items: [
        { q: "¿Este generador de carteles con IA es gratis?", a: "Sí. Es completamente gratuito y no requiere cuenta. Abre la página, escribe tu idea y descarga tu póster." },
        { q: "¿Cuánto tarda en generarse un póster?", a: "La mayoría está listo en 5 a 20 segundos. Si el servicio de imágenes IA está ocupado, el generador cambia al instante a un fondo degradado inteligente, así siempre obtienes un resultado." },
        { q: "¿Puedo usar los pósters comercialmente?", a: "Los pósters que creas son tuyos para redes sociales, eventos y promociones. Para un uso comercial a gran escala, revisa las normas sobre imágenes con IA de tu país o sector." },
        { q: "¿Qué tamaños de póster hay disponibles?", a: "Cuatro tamaños: Póster 4:5 (1080×1350) para Instagram, Cuadrado 1:1 (1080×1080), Historia 9:16 (1080×1920) para Reels y TikTok, y Horizontal 16:9 (1920×1080) para pantallas y banners." },
        { q: "¿La IA escribe el texto de mi póster?", a: "La IA pinta el fondo. Tu título, subtítulo y llamada a la acción se maquetan automáticamente, manteniendo cada palabra nítida y bien escrita — una debilidad habitual de los generadores de imágenes puros." }
      ]
    },
    footer: "© 2026 Generador de Carteles con IA · Escribe una idea, obtén un póster."
  },

  pt: {
    name: "Português", htmlLang: "pt", ogLocale: "pt_BR",
    nav: "PT",
    meta: {
      title: "Gerador de Cartazes com IA — Grátis, do texto ao pôster, sem cadastro",
      desc: "Digite uma ideia e receba um pôster com IA pronto para compartilhar em segundos. Gerador de cartazes com IA gratuito: fundos pintados por IA, tipografia automática, 4 tamanhos, download em PNG. Sem cadastro.",
      ogTitle: "Gerador de Cartazes com IA — Grátis",
      ogDesc: "Digite uma ideia, receba um pôster. Gerador de cartazes com IA gratuito, sem cadastro."
    },
    appName: "Gerador de Cartazes com IA",
    hero: { title: "Gerador de Cartazes com IA", sub: "Digite uma ideia e receba um pôster pronto em segundos — arte pintada por IA, texto perfeitamente diagramado, grátis e sem cadastro." },
    headerCta: "Criar um cartaz",
    tool: {
      prompt: "Descreva seu cartaz", promptPh: "ex. inauguração de uma cafeteria, tons aconchegantes",
      title: "Título", subtitle: "Subtítulo", opt: "(opcional)", cta: "Texto do botão",
      style: "Estilo",
      styles: { gradient: "Degradê", minimal: "Minimalista", neon: "Neon", vintage: "Vintage", bold: "Promoção", pastel: "Pastel" },
      size: "Tamanho",
      sizes: { poster: "Cartaz 4:5 · 1080×1350", square: "Quadrado 1:1 · 1080×1080", story: "Stories 9:16 · 1080×1920", wide: "Wide 16:9 · 1920×1080" },
      generate: "Gerar cartaz", regenerate: "↻ Regenerar", download: "↓ Baixar PNG"
    },
    ui: {
      placeholder: "Descreva sua ideia e clique em Gerar",
      painting: "Pintando com IA… (normalmente 5–20 s)",
      done: "Pronto ✓ Clique em Regenerar para outra arte.",
      fallback: "O serviço de imagem IA está ocupado — usamos um degradê inteligente. Tente Regenerar.",
      exportFail: "Falha ao exportar — tente novamente."
    },
    ideas: {
      title: "Experimente estas ideias", lead: "Um clique preenche o formulário — depois clique em Gerar.",
      items: [
        { emoji: "🎪", label: "Cartaz de evento", style: "neon", prompt: "music festival at night, neon lights, energetic crowd", title: "FESTIVAL ONDA SONORA", subtitle: "22 de ago · Parque Riverside", cta: "Garanta seu ingresso" },
        { emoji: "🛒", label: "Cartaz de promoção", style: "bold", prompt: "big sale background, dynamic diagonal shapes, red and yellow", title: "MEGA PROMOÇÃO", subtitle: "Até 70% off", cta: "Só hoje" },
        { emoji: "🧘", label: "Cartaz de frase", style: "minimal", prompt: "serene mountain lake at sunrise, soft mist, calm water", title: "Respire.", subtitle: "Motivação começa no descanso", cta: "" },
        { emoji: "🎂", label: "Cartaz de aniversário", style: "pastel", prompt: "birthday party with balloons and confetti, joyful pastel colors", title: "FELIZ ANIVERSÁRIO", subtitle: "Festa às 18h", cta: "Você está convidado!" }
      ]
    },
    how: {
      title: "Como funciona",
      steps: [
        { t: "Descreva", d: "Escreva sobre o que é o cartaz — um evento, uma promoção, um clima. Escolha estilo e tamanho." },
        { t: "Gere", d: "A IA pinta um fundo único para a sua ideia enquanto nosso motor tipográfico diagrama seu texto." },
        { t: "Baixe", d: "Receba um PNG nítido no tamanho exato para Instagram, Stories ou telas. Um clique." }
      ]
    },
    usecases: {
      title: "O que você pode criar?",
      text: "Serve para qualquer ocasião: cartazes de eventos e shows, promoções com energia forte, frases com paisagens calmas, convites de aniversário e festas, inaugurações, workshops, encontros esportivos e mais. Cada geração é única — regenere até gostar e baixe."
    },
    faq: {
      title: "Perguntas frequentes",
      items: [
        { q: "Este gerador de cartazes com IA é grátis?", a: "Sim. É totalmente gratuito e não exige conta. Abra a página, digite sua ideia e baixe seu cartaz." },
        { q: "Quanto tempo leva para gerar um cartaz?", a: "A maioria fica pronta em 5 a 20 segundos. Se o serviço de imagem IA estiver ocupado, o gerador troca instantaneamente para um fundo degradê inteligente — você sempre recebe um resultado." },
        { q: "Posso usar os cartazes comercialmente?", a: "Os cartazes que você cria são seus para redes sociais, eventos e promoções. Para uso comercial em larga escala, verifique as regras sobre imagens de IA do seu país ou setor." },
        { q: "Quais tamanhos de cartaz são suportados?", a: "Quatro tamanhos: Cartaz 4:5 (1080×1350) para Instagram, Quadrado 1:1 (1080×1080), Stories 9:16 (1080×1920) para Reels e TikTok, e Wide 16:9 (1920×1080) para telas e banners." },
        { q: "A IA escreve o texto no meu cartaz?", a: "A IA pinta o fundo. Seu título, subtítulo e chamada para ação são diagramados automaticamente, mantendo cada palavra nítida e correta — uma fraqueza comum dos geradores de imagem puros." }
      ]
    },
    footer: "© 2026 Gerador de Cartazes com IA · Digite uma ideia, receba um pôster."
  }
};

/* ---------------- 工具 ---------------- */

const order = Object.keys(LANGS);
const pathOf = (lang) => (lang === "en" ? "/" : `/${lang}/`);
const urlOf = (lang) => BASE + pathOf(lang);

function faqLd(L) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: L.faq.items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a }
    }))
  });
}

function appLd(L, canon) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: L.appName,
    url: canon,
    applicationCategory: "DesignApplication",
    operatingSystem: "Any",
    description: L.meta.desc,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
  });
}

/* ---------------- 页面模板 ---------------- */

function page(lang) {
  const L = LANGS[lang];
  const canon = urlOf(lang);
  const hreflang = order
    .map((l) => `  <link rel="alternate" hreflang="${LANGS[l].htmlLang}" href="${urlOf(l)}" />`)
    .concat(`  <link rel="alternate" hreflang="x-default" href="${urlOf("en")}" />`)
    .join("\n");
  const ogAlt = order.filter((l) => l !== lang).map((l) => `  <meta property="og:locale:alternate" content="${LANGS[l].ogLocale}" />`).join("\n");
  const langNav = order
    .map((l) => `      <a href="${pathOf(l)}"${l === lang ? ' class="on"' : ""}>${LANGS[l].nav}</a>`)
    .join("\n");
  const chips = Object.entries(L.tool.styles)
    .map(([k, v], i) => `            <button class="chip${i === 0 ? " active" : ""}" data-style="${k}">${v}</button>`)
    .join("\n");
  const sizes = Object.entries(L.tool.sizes)
    .map(([k, v], i) => `                <option value="${k}"${i === 0 ? " selected" : ""}>${v}</option>`)
    .join("\n");
  const ideaBtns = L.ideas.items
    .map((it) => `        <button class="idea" data-prompt="${it.prompt}" data-style="${it.style}" data-title="${it.title}" data-subtitle="${it.subtitle}" data-cta="${it.cta}">${it.emoji} ${it.label}</button>`)
    .join("\n");
  const steps = L.how.steps
    .map((s, i) => `        <div class="step"><span class="step-num">${i + 1}</span><h3>${s.t}</h3><p>${s.d}</p></div>`)
    .join("\n");
  const faqHtml = L.faq.items.map((it) => `        <h3>${it.q}</h3>\n        <p>${it.a}</p>`).join("\n\n");

  return `<!DOCTYPE html>
<html lang="${L.htmlLang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${L.meta.title}</title>
  <meta name="description" content="${L.meta.desc}" />
  <link rel="canonical" href="${canon}" />
${hreflang}

  <meta property="og:type" content="website" />
  <meta property="og:title" content="${L.meta.ogTitle}" />
  <meta property="og:description" content="${L.meta.ogDesc}" />
  <meta property="og:url" content="${canon}" />
  <meta property="og:locale" content="${L.ogLocale}" />
${ogAlt}
  <meta name="twitter:card" content="summary_large_image" />

  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>✦</text></svg>" />
  <link rel="stylesheet" href="${lang === "en" ? "css" : "../css"}/style.css" />

  <script type="application/ld+json">
  ${appLd(L, canon)}
  </script>
  <script type="application/ld+json">
  ${faqLd(L)}
  </script>
</head>
<body>
  <header class="site-header">
    <span class="logo">✦ ${L.appName}</span>
    <div class="header-right">
      <nav class="lang-nav" aria-label="Language">
${langNav}
      </nav>
      <a class="header-cta" href="#tool">${L.headerCta}</a>
    </div>
  </header>

  <main>
    <section class="hero">
      <h1>${L.hero.title}</h1>
      <p class="subtitle">${L.hero.sub}</p>
    </section>

    <section class="tool card" id="tool">
      <div class="tool-grid">
        <div class="controls">
          <label for="prompt">${L.tool.prompt}</label>
          <textarea id="prompt" rows="3" placeholder="${L.tool.promptPh}">grand opening of a coffee shop, warm cozy tones</textarea>

          <div class="field-row">
            <div class="field">
              <label for="title-input">${L.tool.title}</label>
              <input id="title-input" type="text" value="${L.ideas.items[0].title}" maxlength="60" />
            </div>
            <div class="field">
              <label for="subtitle-input">${L.tool.subtitle} <span class="opt">${L.tool.opt}</span></label>
              <input id="subtitle-input" type="text" value="${L.ideas.items[0].subtitle}" maxlength="80" />
            </div>
          </div>

          <div class="field">
            <label for="cta-input">${L.tool.cta} <span class="opt">${L.tool.opt}</span></label>
            <input id="cta-input" type="text" value="${L.ideas.items[0].cta}" maxlength="60" />
          </div>

          <label>${L.tool.style}</label>
          <div class="chips" id="style-chips">
${chips}
          </div>

          <div class="field-row">
            <div class="field">
              <label for="size-select">${L.tool.size}</label>
              <select id="size-select">
${sizes}
              </select>
            </div>
            <div class="field btn-field">
              <button class="btn" id="generate-btn">${L.tool.generate}</button>
            </div>
          </div>

          <p class="status" id="status"></p>
        </div>

        <div class="preview">
          <canvas id="canvas" width="1080" height="1350"></canvas>
          <div class="preview-actions" id="preview-actions" hidden>
            <button class="btn btn-ghost" id="regenerate-btn">${L.tool.regenerate}</button>
            <button class="btn" id="download-btn">${L.tool.download}</button>
          </div>
        </div>
      </div>
    </section>

    <section class="content">
      <h2>${L.ideas.title}</h2>
      <p class="lead">${L.ideas.lead}</p>
      <div class="idea-row">
${ideaBtns}
      </div>

      <h2>${L.how.title}</h2>
      <div class="steps">
${steps}
      </div>

      <h2>${L.usecases.title}</h2>
      <p>${L.usecases.text}</p>

      <h2>${L.faq.title}</h2>
      <div class="faq">
${faqHtml}
      </div>
    </section>
  </main>

  <footer class="site-footer">
    ${L.footer}
  </footer>

  <script>
    window.UI_STRINGS = ${JSON.stringify(L.ui)};
  </script>
  <script src="${lang === "en" ? "js" : "../js"}/app.js"></script>
</body>
</html>
`;
}

/* ---------------- 生成 ---------------- */

for (const lang of order) {
  const file = lang === "en" ? "index.html" : join(lang, "index.html");
  if (lang !== "en") mkdirSync(join(ROOT, lang), { recursive: true });
  writeFileSync(join(ROOT, file), page(lang), "utf8");
  console.log("built", file);
}
console.log("done:", order.length, "pages");
