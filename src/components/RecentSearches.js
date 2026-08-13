import React from 'react';

const RecentSearches = ({ items, onSelect, prefix = '@' }) => {
    if (!items.length) return null;

    return (
        <div className='recent-row'>
            <span className='recent-label'>Recent</span>
            <div className='recent-chips'>
                {items.map((item) => (
                    <button
                        key={item}
                        type='button'
                        className='recent-chip'
                        onClick={() => onSelect(item)}
                    >
                        {prefix}{item}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default RecentSearches;
