import React from 'react';

const MODES = [
    { id: 'person', label: 'Person' },
    { id: 'packages', label: 'Packages' },
];

const ModeSwitch = ({ activeId, onSelect }) => (
    <div className='mode-switch' role='tablist' aria-label='Search mode'>
        {MODES.map((m) => (
            <button
                key={m.id}
                type='button'
                role='tab'
                aria-selected={m.id === activeId}
                className={`mode-tab${m.id === activeId ? ' active' : ''}`}
                onClick={() => onSelect(m.id)}
            >
                {m.label}
            </button>
        ))}
    </div>
);

export default ModeSwitch;
