export type ColorTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'saleemkhan-theme';

export const THEME_COLORS = {
  dark: '#0d0d0d',
  light: '#f4f1ec',
} as const;

export function resolveTheme(
  stored: string | null,
  prefersLight: boolean,
): ColorTheme {
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }

  return prefersLight ? 'light' : 'dark';
}

export function nextTheme(current: ColorTheme): ColorTheme {
  return current === 'dark' ? 'light' : 'dark';
}

export function readDocumentTheme(root: {
  getAttribute(name: string): string | null;
}): ColorTheme {
  return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

export function persistTheme(
  theme: ColorTheme,
  storage: Pick<Storage, 'setItem'>,
): void {
  storage.setItem(THEME_STORAGE_KEY, theme);
}

export function applyTheme(
  root: {
    setAttribute(name: string, value: string): void;
    style: { colorScheme: string };
  },
  theme: ColorTheme,
  themeColorMeta: { setAttribute(name: string, value: string): void } | null,
  colors: Record<ColorTheme, string>,
): void {
  root.setAttribute('data-theme', theme);
  root.style.colorScheme = theme;
  themeColorMeta?.setAttribute('content', colors[theme]);
}
