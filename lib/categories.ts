export const CATEGORIES = [
  '全部',
  '对话',
  '写作',
  '编程',
  '图像',
  '视频',
  '音频',
  '效率',
  '设计',
  '营销',
  'Agent',
] as const;

export type Category = (typeof CATEGORIES)[number];
