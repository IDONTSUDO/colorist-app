import { makeAutoObservable } from "mobx";

export abstract class Theme {
  abstract greenWhite: string;
  abstract white: string;
  abstract black: string;
  abstract green: string;
  abstract grau: string;
  abstract grauLeft: string;
  abstract redAccent: string;
  abstract grau2: string;
  abstract outlineVariantDark: string;
  abstract outlineVariantLight: string;
  abstract surfaceContainerLow: string;
  abstract surfaceContainer: string;
  abstract darkSurfaceVariant: string;
  abstract outlineVariant: string;
  abstract navBlue: string;
  abstract grayLeft: string;
  abstract onSurface: string;
  abstract surfaceContainerHighest: string;
  abstract darkSurface: string;
  abstract fon: string;
  abstract onSurfaceVariant: string;
  abstract darkOnSurfaceVariant: string;
  abstract error50: string;
}

export class BlackTheme implements Theme {
  error50: string = "rgba(220, 54, 46, 1)";
  darkOnSurfaceVariant: string = "rgba(202, 196, 208, 1)";
  darkSurfaceVariant: string = "rgba(73, 69, 79, 1)";
  navBlue: string = "rgba(202, 211, 216, 1)";
  fon: string = "rgba(147, 147, 147, 0.4)";
  darkSurface: string = "rgba(20, 18, 24, 1)";
  surfaceContainerHighest: string = "rgba(54, 52, 59, 1)";
  onSurface: string = "rgba(230, 224, 233, 1)";
  grayLeft: string = "rgba(213, 220, 224, 1)";
  surfaceContainer: string = "rgba(33, 31, 38, 1)";
  surfaceContainerLow: string = "rgba(29, 27, 32, 1)";
  outlineVariantLight: string = "rgba(202, 196, 208, 1)";
  grau2: string = "rgba(147, 147, 147, 1)";
  greenWhite: string = "rgba(233, 237, 201, 1)";
  white: string = "rgba(255, 255, 255, 1)";
  black: string = "rgba(0, 0, 0, 1)";
  green: string = "rgba(56, 87, 72, 1)";
  grau: string = "rgba(147, 147, 147, 1)";
  grauLeft: string = "";
  redAccent: string = "rgba(72, 23, 39, 1)";
  outlineVariantDark: string = "rgba(73, 69, 79, 1)";
  outlineVariant: string = "rgba(202, 196, 208, 1)";
  onSurfaceVariant: string = "rgba(202, 196, 208, 1)";
}

export type ThemeMode = "light" | "dark";
const THEME_KEY = "theme";

const readMode = (): ThemeMode => {
  try {
    return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
};

export class ThemeStore {
  theme: Theme = new BlackTheme();
  // Цвета берутся из CSS-переменных (src/theme.css, src/theme_tokens.css),
  // тема переключается атрибутом data-theme на <html>.
  mode: ThemeMode = readMode();
  constructor() {
    makeAutoObservable(this);
    this.apply();
  }
  changeTheme = (theme: Theme) => (this.theme = theme);
  get isDark() {
    return this.mode === "dark";
  }
  setMode = (mode: ThemeMode) => {
    this.mode = mode;
    try {
      localStorage.setItem(THEME_KEY, mode);
    } catch {
      // приватный режим / запрещённое хранилище — тема просто не запомнится
    }
    this.apply();
  };
  toggle = () => this.setMode(this.isDark ? "light" : "dark");
  private apply() {
    if (this.mode === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }
}

export const themeStore = new ThemeStore();
