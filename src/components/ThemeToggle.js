import React from 'react';
import { FiSun, FiMonitor, FiMoon } from 'react-icons/fi';

const OPTIONS = [
    { id: 'light', icon: FiSun, label: 'Light theme' },
    { id: 'system', icon: FiMonitor, label: 'Match system theme' },
    { id: 'dark', icon: FiMoon, label: 'Dark theme' },
];

const ThemeToggle = ({ theme, onChange }) => (
    <div className='theme-toggle' role='group' aria-label='Theme'>
        {OPTIONS.map(({ id, icon: Icon, label }) => (
            <button
                key={id}
                type='button'
                className={`theme-btn${theme === id ? ' active' : ''}`}
                aria-pressed={theme === id}
                title={label}
                onClick={() => onChange(id)}
            >
                <Icon />
            </button>
        ))}
    </div>
);

export default ThemeToggle;
