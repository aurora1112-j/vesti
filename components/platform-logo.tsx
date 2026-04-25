export type PlatformName =
  | "OpenAI"
  | "Kimi"
  | "DeepSeek"
  | "Claude"
  | "Gemini"
  | "Qwen"
  | "Doubao"
  | "Yuanbao"

interface PlatformMeta {
  label: string
  assetPath: string
  sourceUrl: string
  tone: "multiply" | "screen" | "soft"
}

interface PlatformLogoProps {
  platform: PlatformName
  className?: string
}

// These URLs are the verified official brand entry points used to source the
// local logo assets in /public/platform-logos.
export const platformMeta: Record<PlatformName, PlatformMeta> = {
  OpenAI: {
    label: "OpenAI",
    assetPath: "/platform-logos/openai-chatgpt-official.png",
    sourceUrl:
      "https://images.ctfassets.net/j22is2dtoxu1/intercom-img-d177d076c9a5453052925143/49d5d812b0a6fcc20a14faa8c629d9fb/icon-ios-1024_401x.png",
    tone: "multiply",
  },
  Kimi: {
    label: "Kimi",
    assetPath: "/platform-logos/kimi-favicon-official.png",
    sourceUrl: "https://statics.moonshot.cn/kimi-web-seo/favicon.ico",
    tone: "screen",
  },
  DeepSeek: {
    label: "DeepSeek",
    assetPath: "/platform-logos/deepseek-official.svg",
    sourceUrl: "https://fe-static.deepseek.com/chat/favicon.svg",
    tone: "soft",
  },
  Claude: {
    label: "Claude",
    assetPath: "/platform-logos/claude-favicon-official.png",
    sourceUrl: "https://claude.ai/favicon.ico",
    tone: "soft",
  },
  Gemini: {
    label: "Gemini",
    assetPath: "/platform-logos/gemini-official.webp",
    sourceUrl:
      "https://www.gstatic.com/marketing-cms/assets/images/7e/a4/253561a944f4a8f5e6dec4f5f26f/gemini.webp=s96-fcrop64=1,00000000ffffffff-rw",
    tone: "multiply",
  },
  Qwen: {
    label: "Qwen",
    assetPath: "/platform-logos/qwen-official.png",
    sourceUrl: "https://assets.alicdn.com/g/qwenweb/qwen-chat-fe/0.2.15/favicon.png",
    tone: "soft",
  },
  Doubao: {
    label: "Doubao",
    assetPath: "/platform-logos/doubao-logo-official.png",
    sourceUrl: "https://lf-flow-web-cdn.doubao.com/obj/flow-doubao/doubao/logo.png",
    tone: "soft",
  },
  Yuanbao: {
    label: "Yuanbao",
    assetPath: "/platform-logos/yuanbao-favicon-official.png",
    sourceUrl: "https://static.yuanbao.tencent.com/m/yuanbao-web/favicon@32.png",
    tone: "soft",
  },
}

export function getPlatformLabel(platform: PlatformName): string {
  return platformMeta[platform].label
}

export function PlatformLogo({
  platform,
  className,
}: PlatformLogoProps): JSX.Element {
  const asset = platformMeta[platform]

  return (
    <img
      src={asset.assetPath}
      alt=""
      aria-hidden="true"
      draggable={false}
      className={[
        "platform-logo-image",
        `platform-logo-image--${asset.tone}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  )
}
