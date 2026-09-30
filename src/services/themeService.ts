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
  if (typeof window === "undefined") return "dark";
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "light" || saved === "dark") {
      return saved;
    }
  } catch (e) {}
  return "dark";
}

/**
 * Aplica o tema diretamente nas classes do HTML e no localStorage
 */
export function applyTheme(theme: AppTheme): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    const root = document.documentElement;
    if (theme === "light") {
      root.classList.remove("dark");
      root.classList.add("light");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
    }

    // Atualiza a meta tag de theme-color do navegador móvel
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", theme === "light" ? "#f8fafc" : "#070a11");
    }

    // Dispara evento customizado para sincronizar abas ou componentes
    window.dispatchEvent(new CustomEvent("radar-theme-change", { detail: { theme } }));
  } catch (e) {
    console.warn("Falha ao salvar tema:", e);
  }
}

/**
 * Alterna entre dark e light e retorna o novo tema ativo
 */
export function toggleTheme(): AppTheme {
  const current = getStoredTheme();
  const next: AppTheme = current === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
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
