import React from 'react';
import { generateBarcodeBars } from '../utils/barcode';

function sourceLabel(profileUrl, handle) {
    const host = new URL(profileUrl).hostname.replace(/^www\./, '');
    return `SRC: ${host.toUpperCase()}/${handle.toUpperCase()}`;
}

const ProfileCard = ({ profile }) => {
    const bars = generateBarcodeBars(profile.handle);

    return (
        <div className='badge-stage'>
            <div className='badge'>
                <div className='fold' aria-hidden='true' />

                <div className='photo-slot'>
                    {profile.avatarUrl ? (
                        <img src={profile.avatarUrl} alt={`${profile.handle}'s avatar`} />
                    ) : (
                        <div className='photo-placeholder' aria-hidden='true' />
                    )}
                    <span className='corner tl' />
                    <span className='corner tr' />
                    <span className='corner bl' />
                    <span className='corner br' />
                </div>

                <h2 className='badge-name'>{profile.name}</h2>
                <div className='badge-handle'>@{profile.handle}</div>
                {profile.bio && <p className='badge-bio'>{profile.bio}</p>}

                <div className='badge-fields'>
                    {profile.company && (
                        <div className='field'>
                            <span className='k'>Org</span>
                            <span className='v'>{profile.company}</span>
                        </div>
                    )}
                    {profile.location && (
                        <div className='field'>
                            <span className='k'>Location</span>
                            <span className='v'>{profile.location}</span>
                        </div>
                    )}
                    <div className='field'>
                        <span className='k'>Joined</span>
                        <span className='v'>
                            {new Date(profile.joinedAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            })}
                        </span>
                    </div>
                </div>

                <div className='badge-stats'>
                    {profile.stats.map((stat) => (
                        <div key={stat.key}>
                            <span className='n'>{stat.value}</span>
                            <span className='l'>{stat.label}</span>
                        </div>
                    ))}
                </div>

                <div className='badge-links'>
                    {profile.links.map((link) => (
                        <a key={link.label} href={link.url} target='_blank' rel='noreferrer'>
                            {link.label} ↗
                        </a>
                    ))}
                    <a href={profile.profileUrl} target='_blank' rel='noreferrer'>
                        Profile ↗
                    </a>
                </div>

                <div className='barcode' aria-hidden='true'>
                    {bars.map((bar, i) => (
                        <span key={i} style={{ width: `${bar.width}px`, height: `${bar.height}%` }} />
                    ))}
                </div>
                <div className='barcode-caption'>{sourceLabel(profile.profileUrl, profile.handle)}</div>
            </div>
        </div>
    );
};

export default ProfileCard;
