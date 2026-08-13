import { useEffect, useState } from 'react';

const THEME_KEY = 'profileViewer.theme';

function loadTheme() {
    try {
        return window.localStorage.getItem(THEME_KEY) || 'system';
    } catch {
        return 'system';
    }
}

export function useTheme() {
    const [theme, setTheme] = useState(loadTheme);

    useEffect(() => {
        if (theme === 'system') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
        try {
            window.localStorage.setItem(THEME_KEY, theme);
        } catch {
            // localStorage unavailable (private mode / quota) - choice just won't persist
        }
    }, [theme]);

    return [theme, setTheme];
}
