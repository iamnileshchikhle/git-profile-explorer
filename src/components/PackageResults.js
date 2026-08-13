import React from 'react';

function formatDownloads(n) {
    if (n == null) return null;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${Math.round(n / 1000)}K`;
    return String(n);
}

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

                    <div className='package-meta'>
                        {pkg.weeklyDownloads != null && (
                            <span className='package-downloads'>{formatDownloads(pkg.weeklyDownloads)}/wk</span>
                        )}
                        {pkg.license && <span className='package-license'>{pkg.license}</span>}
                        {pkg.homepageUrl && (
                            <a href={pkg.homepageUrl} target='_blank' rel='noreferrer'>Homepage ↗</a>
                        )}
                        {pkg.repositoryUrl && (
                            <a href={pkg.repositoryUrl} target='_blank' rel='noreferrer'>Repo ↗</a>
                        )}
                    </div>
                </li>
            ))}
        </ul>
    );
};

export default PackageResults;
