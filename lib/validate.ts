// 输入验证工具
export function sanitizeString(input: string, maxLength = 500): string {
  return input
    .replace(/[<>]/g, '') // 移除 HTML 标签字符
    .replace(/javascript:/gi, '') // 移除 javascript: 协议
    .replace(/on\w+=/gi, '') // 移除事件处理器
    .trim()
    .slice(0, maxLength);
}

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const VALID_CATEGORIES = [
  '对话', '写作', '编程', '图像', '视频', '音频', '效率', '设计', '营销', 'Agent',
];

export function isValidCategory(category: string): boolean {
  return VALID_CATEGORIES.includes(category);
}

interface ToolInput {
  name: string;
  category: string;
  url: string;
  description: string;
}

export function validateToolInput(input: ToolInput): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input.name || input.name.length < 1 || input.name.length > 100) {
    errors.push('工具名称必须在 1-100 字符之间');
  }

  if (!isValidCategory(input.category)) {
    errors.push('无效的分类');
  }

  if (!isValidUrl(input.url)) {
    errors.push('请输入有效的网址 (http/https)');
  }

  if (!input.description || input.description.length < 1 || input.description.length > 2000) {
    errors.push('描述必须在 1-2000 字符之间');
  }

  return { valid: errors.length === 0, errors };
}
