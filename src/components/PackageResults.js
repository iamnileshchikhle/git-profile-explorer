import React, { useState } from 'react';
import { relativeTime } from '../utils/relativeTime';

function formatDownloads(n) {
    if (n == null) return null;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${Math.round(n / 1000)}K`;
    return String(n);
}

const CopyInstallButton = ({ name }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(`npm install ${name}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // clipboard API unavailable - command is still visible to copy by hand
        }
    };

    return (
        <button type='button' className='package-copy' onClick={handleCopy}>
            {copied ? 'Copied!' : `npm install ${name}`}
        </button>
    );
};

const PackageResults = ({ query, packages }) => {
    if (packages.length === 0) {
        return (
            <div className='mini-badge'>
                <div className='mini-line short' />
                <p className='mini-hint'>No packages found for "{query}"</p>
            </div>
        );
    }

    return (
        <ul className='package-list'>
            {packages.map((pkg) => (
                <li key={pkg.name} className='package-item'>
                    <div className='package-head'>
                        <a href={pkg.npmUrl} target='_blank' rel='noreferrer' className='package-name'>
                            {pkg.name}
                        </a>
                        <span className='package-version'>v{pkg.version}</span>
                    </div>

                    {pkg.description && <p className='package-desc'>{pkg.description}</p>}

                    {pkg.keywords.length > 0 && (
                        <div className='package-keywords'>
                            {pkg.keywords.map((kw) => (
                                <span key={kw} className='package-keyword'>{kw}</span>
                            ))}
                        </div>
                    )}

                    <div className='package-meta'>
                        {pkg.weeklyDownloads != null && (
                            <span className='package-downloads'>{formatDownloads(pkg.weeklyDownloads)}/wk</span>
                        )}
                        {pkg.license && <span className='package-license'>{pkg.license}</span>}
                        {pkg.publisher && <span className='package-publisher'>by {pkg.publisher}</span>}
                        {pkg.updatedAt && <span className='package-updated'>updated {relativeTime(pkg.updatedAt)}</span>}
                    </div>

                    {(pkg.homepageUrl || pkg.repositoryUrl) && (
                        <div className='package-links'>
                            {pkg.homepageUrl && (
                                <a href={pkg.homepageUrl} target='_blank' rel='noreferrer'>Homepage ↗</a>
                            )}
                            {pkg.repositoryUrl && (
                                <a href={pkg.repositoryUrl} target='_blank' rel='noreferrer'>Repo ↗</a>
                            )}
                        </div>
                    )}

                    <CopyInstallButton name={pkg.name} />
                </li>
            ))}
        </ul>
    );
};

export default PackageResults;
