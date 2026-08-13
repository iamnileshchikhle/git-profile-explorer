import React, { useEffect } from 'react';
import { relativeTime } from '../utils/relativeTime';

function formatCount(n) {
    if (n == null) return null;
    return n.toLocaleString();
}

const PackageDetailModal = ({ pkg, onClose }) => {
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    return (
        <div className='modal-overlay' onClick={onClose}>
            <div
                className='modal-panel'
                role='dialog'
                aria-modal='true'
                aria-label={`${pkg.name} details`}
                onClick={(e) => e.stopPropagation()}
            >
                <button type='button' className='modal-close' onClick={onClose} aria-label='Close'>×</button>

                <div className='modal-head'>
                    <h3>{pkg.name}</h3>
                    <span className='package-version'>v{pkg.version}</span>
                </div>

                {pkg.description && <p className='modal-desc'>{pkg.description}</p>}

                {pkg.allKeywords.length > 0 && (
                    <div className='package-keywords'>
                        {pkg.allKeywords.map((kw) => (
                            <span key={kw} className='package-keyword'>{kw}</span>
                        ))}
                    </div>
                )}

                <div className='modal-fields'>
                    {pkg.weeklyDownloads != null && (
                        <div className='field'><span className='k'>Weekly downloads</span><span className='v'>{formatCount(pkg.weeklyDownloads)}</span></div>
                    )}
                    {pkg.monthlyDownloads != null && (
                        <div className='field'><span className='k'>Monthly downloads</span><span className='v'>{formatCount(pkg.monthlyDownloads)}</span></div>
                    )}
                    {pkg.license && (
                        <div className='field'><span className='k'>License</span><span className='v'>{pkg.license}</span></div>
                    )}
                    {pkg.publisher && (
                        <div className='field'><span className='k'>Publisher</span><span className='v'>{pkg.publisher}</span></div>
                    )}
                    {pkg.updatedAt && (
                        <div className='field'><span className='k'>Updated</span><span className='v'>{relativeTime(pkg.updatedAt)}</span></div>
                    )}
                </div>

                <div className='package-links'>
                    <a href={pkg.npmUrl} target='_blank' rel='noreferrer'>npm ↗</a>
                    {pkg.homepageUrl && <a href={pkg.homepageUrl} target='_blank' rel='noreferrer'>Homepage ↗</a>}
                    {pkg.repositoryUrl && <a href={pkg.repositoryUrl} target='_blank' rel='noreferrer'>Repo ↗</a>}
                </div>
            </div>
        </div>
    );
};

export default PackageDetailModal;
