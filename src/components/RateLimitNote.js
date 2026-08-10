import React from 'react';

const RateLimitNote = ({ rateLimit }) => {
    if (!rateLimit || Number.isNaN(rateLimit.remaining)) return null;

    return (
        <p className='rate-note'>
            {rateLimit.remaining}/{rateLimit.limit} lookups left this hour
        </p>
    );
};

export default RateLimitNote;
