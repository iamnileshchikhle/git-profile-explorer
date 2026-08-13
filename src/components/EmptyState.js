import React from 'react';

const EmptyState = ({ message = 'Enter a handle to pull their public record.' }) => (
    <div className='mini-badge'>
        <div className='mini-photo' />
        <div className='mini-line short' />
        <p className='mini-hint'>{message}</p>
    </div>
);

export default EmptyState;
