import React, { useState } from 'react';
import PackageDetailModal from './PackageDetailModal';

function formatDownloads(n) {
    if (n == null) return null;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${Math.round(n / 1000)}K`;
    return String(n);
}

const CopyInstallButton = ({ name }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async (e) => {
        e.stopPropagation();
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
    const [detailPkg, setDetailPkg] = useState(null);

    if (packages.length === 0) {
        return (
            <div className='mini-badge'>
                <div className='mini-line short' />
                <p className='mini-hint'>No packages found for "{query}"</p>
            </div>
        );
    }

    return (
        <>
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
                        </div>

                        <div className='package-actions'>
                            <button type='button' className='package-details-btn' onClick={() => setDetailPkg(pkg)}>
                                Details
                            </button>
                            <CopyInstallButton name={pkg.name} />
                        </div>
                    </li>
                ))}
            </ul>

            {detailPkg && <PackageDetailModal pkg={detailPkg} onClose={() => setDetailPkg(null)} />}
        </>
    );
};

export default PackageResults;
