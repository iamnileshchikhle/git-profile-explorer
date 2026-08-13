import React from 'react';

const LoadingState = ({ message = 'Scanning record...' }) => (
    <div className='mini-badge'>
        <div className='scan-sweep' aria-hidden='true' />
        <div className='mini-photo' />
        <div className='mini-line short' />
        <div className='mini-line' />
        <p className='mini-hint' role='status'>{message}</p>
    </div>
);

export default LoadingState;
