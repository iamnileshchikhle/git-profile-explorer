import React from 'react';

const LoadingState = () => (
    <div className='mini-badge'>
        <div className='scan-sweep' aria-hidden='true' />
        <div className='mini-photo' />
        <div className='mini-line short' />
        <div className='mini-line' />
        <p className='mini-hint' role='status'>Scanning record...</p>
    </div>
);

export default LoadingState;
