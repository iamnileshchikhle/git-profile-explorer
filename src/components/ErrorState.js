import React from 'react';

const ErrorState = ({ message }) => (
    <div className='mini-badge'>
        <div className='mini-photo' />
        <div className='mini-line short' />
        <p className='mini-hint' role='alert'>{message}</p>
        <div className='stamp'>NO RECORD</div>
    </div>
);

export default ErrorState;
