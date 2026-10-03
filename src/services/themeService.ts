// ============================================================================
// SERVIÇO DE GERENCIAMENTO DE TEMA (DARK / LIGHT) - RADAR DO ROLÊ
// Permite alternar entre o Tema Escuro Original (Noturno/Balada) e Tema Claro
// ============================================================================

import { useState, useEffect } from "react";

export type AppTheme = "dark" | "light";

const THEME_STORAGE_KEY = "radar_theme";
const THEME_PROMPTED_KEY = "radar_theme_prompted";

/**
 * Retorna o tema atualmente salvo ou o padrão 'dark' (Tema Escuro Original)
 */
export function getStoredTheme(): AppTheme {
  return "dark";
}

/**
 * Aplica o tema escuro permanentemente no HTML
 */
export function applyTheme(_theme?: AppTheme): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(THEME_STORAGE_KEY, "dark");
    const root = document.documentElement;
    root.classList.remove("light");
    root.classList.add("dark");

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", "#070a11");
    }
  } catch (e) {
    console.warn("Falha ao salvar tema:", e);
  }
}

/**
 * Mantém o tema escuro fixo
 */
export function toggleTheme(): AppTheme {
  applyTheme("dark");
  return "dark";
}

/**
 * Verifica se o usuário já escolheu ou fechou o seletor inicial de tema
 */
export function hasUserPromptedTheme(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(THEME_PROMPTED_KEY) === "true";
  } catch (e) {
    return true;
  }
}

/**
 * Marca que a opção de escolha inicial de tema já foi apresentada/confirmada
 */
export function markThemePrompted(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(THEME_PROMPTED_KEY, "true");
  } catch (e) {}
}

/**
 * Hook do React para ler e alterar o tema com re-render automático
 */
export function useTheme() {
  const [theme, setThemeState] = useState<AppTheme>(() => getStoredTheme());

  useEffect(() => {
    // Sincroniza estado inicial garantindo a classe no HTML
    const initial = getStoredTheme();
    setThemeState(initial);
    applyTheme(initial);

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ theme: AppTheme }>;
      if (customEvent.detail?.theme) {
        setThemeState(customEvent.detail.theme);
      }
    };

    window.addEventListener("radar-theme-change", handleThemeChange);
    return () => {
      window.removeEventListener("radar-theme-change", handleThemeChange);
    };
  }, []);

  const changeTheme = (newTheme: AppTheme) => {
    applyTheme(newTheme);
    setThemeState(newTheme);
  };

  const handleToggle = () => {
    const next = toggleTheme();
    setThemeState(next);
  };

  return {
    theme,
    isDark: theme === "dark",
    isLight: theme === "light",
    setTheme: changeTheme,
    toggleTheme: handleToggle,
  };
}
