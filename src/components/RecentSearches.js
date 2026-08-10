import React from 'react';

const RecentSearches = ({ items, onSelect }) => {
    if (!items.length) return null;

    return (
        <div className='recent-row'>
            <span className='recent-label'>Recent</span>
            <div className='recent-chips'>
                {items.map((handle) => (
                    <button
                        key={handle}
                        type='button'
                        className='recent-chip'
                        onClick={() => onSelect(handle)}
                    >
                        @{handle}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default RecentSearches;
