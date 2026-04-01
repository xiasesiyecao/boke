export type GameDevShowcaseItem = {
  slug: string;
  name: string;
  stage: string;
  genre: string;
  summary: string;
  stack: string;
  accent: string;
  headline: string;
  pitch: string;
  playUrl?: string;
  features: string[];
  milestones: { label: string; value: string }[];
};

export const gameDevShowcase: GameDevShowcaseItem[] = [
  {
    slug: "jump-game",
    name: "跳跃游戏",
    stage: "Playable Build",
    genre: "Platform Jump",
    summary: "你的前端跳跃小游戏展示页，直接承载原始 index.html / script.js / styles.css 文件。",
    stack: "HTML / CSS / JavaScript",
    accent: "Jump feel / Browser play / Fast launch",
    headline: "点击后直接进入独立游戏页，并在页面内加载你的静态小游戏。",
    pitch:
      "这个页面不需要把小游戏重写成 React 组件，直接复用你现成的静态前端文件。后续你只要替换对应目录下的资源，就可以继续迭代玩法与视觉。",
    playUrl: "/games/jump-game/index.html",
    features: ["独立页面承载", "iframe 直接试玩", "保留原始前端结构", "便于后续继续替换资源"],
    milestones: [
      { label: "Build", value: "Static Build Ready" },
      { label: "Loop", value: "Jump + Obstacle" },
      { label: "Priority", value: "Quick Launch" },
    ],
  },
  {
    slug: "neon-drift-arena",
    name: "Neon Drift Arena",
    stage: "Playable Build",
    genre: "Top-down Action",
    summary: "一个偏街机节奏的浏览器动作原型，重点验证短局对战、冲刺手感和击中反馈。",
    stack: "Next.js / Canvas / Zustand",
    accent: "Hit feedback / Dash loop / Score combo",
    headline: "短局动作原型，先把速度感和击中反馈做出来。",
    pitch:
      "这是一款面向网页端的小体量动作实验，目标不是一次性做大，而是先把位移、瞄准、伤害反馈和局内节奏打磨扎实。",
    features: ["冲刺与回拉位移", "短局计分循环", "霓虹风格场景反馈", "敌人波次与成长测试"],
    milestones: [
      { label: "Build", value: "v0.3 Prototype" },
      { label: "Loop", value: "Combat + Score" },
      { label: "Priority", value: "Feel & Readability" },
    ],
  },
  {
    slug: "tiny-shopkeeper",
    name: "Tiny Shopkeeper",
    stage: "Internal Test",
    genre: "Idle Management",
    summary: "放置经营方向的小体量实验，当前在测试资源循环、数值增长和界面信息密度。",
    stack: "React / Motion / Local Save",
    accent: "Economy curve / UI rhythm / Session retention",
    headline: "用轻量放置经营验证资源循环和界面节奏。",
    pitch:
      "这个方向更偏数值与信息表达，核心在于把资源增长、升级反馈和停留动力控制在一个轻量浏览器体验里。",
    features: ["自动产出与升级树", "短会话回流设计", "信息密度压缩", "成长与解锁节奏验证"],
    milestones: [
      { label: "Build", value: "v0.2 Internal" },
      { label: "Loop", value: "Produce + Upgrade" },
      { label: "Priority", value: "Economy Curve" },
    ],
  },
  {
    slug: "signal-runner",
    name: "Signal Runner",
    stage: "Concept Phase",
    genre: "Runner + Rhythm",
    summary: "把节奏点击和障碍躲避做成轻量浏览器玩法，目前还在找视觉语言和失败惩罚强度。",
    stack: "TypeScript / Web Audio / Prototype Tools",
    accent: "Beat sync / Retry loop / Motion timing",
    headline: "节奏点击和跑酷规避的混合实验，还在找最顺的失败循环。",
    pitch:
      "目前以概念验证为主，重点不是关卡数量，而是确认节奏命中、障碍识别和重开欲望之间的平衡关系。",
    features: ["节拍同步输入", "动态障碍生成", "失败重开加速", "音画一致性测试"],
    milestones: [
      { label: "Build", value: "Concept Only" },
      { label: "Loop", value: "Beat + Dodge" },
      { label: "Priority", value: "Retry Motivation" },
    ],
  },
];

export function getGameDevShowcaseItem(slug: string) {
  return gameDevShowcase.find((item) => item.slug === slug) ?? null;
}
