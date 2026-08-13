import React from 'react';

const SearchBar = ({
    value,
    onChange,
    onSubmit,
    isLoading,
    placeholder,
    label = 'Enter Handle',
    actionLabel = 'Pull Record',
    loadingLabel = 'Pulling...',
}) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(value);
    };

    return (
        <div className='search-rail'>
            <span className='field-label'>{label}</span>
            <form onSubmit={handleSubmit} className='scan-slot'>
                <input
                    type='text'
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
                <button type='submit' disabled={isLoading}>
                    {isLoading ? loadingLabel : actionLabel}
                </button>
            </form>
        </div>
    );
};

export default SearchBar;
