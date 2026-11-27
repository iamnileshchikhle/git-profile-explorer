import React, { useEffect, useMemo, useState } from 'react';

const PERIODS = [
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
];

const CATEGORY_ORDER = [
    'ai',
    'web-development',
    'developer-tools',
    'mobile',
    'infrastructure',
    'other',
];

const CATEGORY_LABELS = {
    ai: 'AI',
    'web-development': 'Web development',
    'developer-tools': 'Developer tools',
    mobile: 'Mobile',
    infrastructure: 'Infrastructure',
    other: 'Other',
};

const EMPTY_PROJECTS = [];

function formatNumber(value) {
    return typeof value === 'number' && Number.isFinite(value)
        ? new Intl.NumberFormat().format(value)
        : 'Not available';
}

function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Date unavailable';
    return `${new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'UTC',
    }).format(date)} UTC`;
}

function getPublicDataUrl() {
    const publicUrl = (process.env.PUBLIC_URL || '').replace(/\/$/, '');
    return `${publicUrl}/data/github-trending.json`;
}

function TrendingProjectCard({ project, starsLabel }) {
    return (
        <article className='trending-card'>
            <div className='trending-card-head'>
                <a href={project.url} target='_blank' rel='noreferrer' className='trending-repo-name'>
                    {project.fullName}
                </a>
                <span className='trending-stars'>★ {formatNumber(project.stars)}</span>
            </div>

            <p className='trending-description'>
                {project.description || 'No description published on GitHub.'}
            </p>

            <div className='trending-stack'>
                <span className='trending-label'>Language &amp; GitHub topics</span>
                <div className='trending-tags'>
                    {project.primaryLanguage && (
                        <span className='trending-tag'>{project.primaryLanguage}</span>
                    )}
                    {Array.isArray(project.topics) && project.topics.map((topic) => (
                        <span key={topic} className='trending-tag'>{topic}</span>
                    ))}
                    {project.topics === null && (
                        <span className='trending-unavailable'>Repository topics unavailable</span>
                    )}
                    {!project.primaryLanguage && project.topics === null && (
                        <span className='trending-unavailable'>Language not reported</span>
                    )}
                    {!project.primaryLanguage && Array.isArray(project.topics) && (
                        <span className='trending-unavailable'>Language not reported</span>
                    )}
                    {Array.isArray(project.topics) && project.topics.length === 0 && (
                        <span className='trending-unavailable'>No GitHub topics provided</span>
                    )}
                </div>
            </div>

            <div className='trending-card-meta'>
                <span>
                    <strong>Trending signal:</strong>{' '}
                    {project.starsInPeriod == null
                        ? `Star gain ${starsLabel} not reported`
                        : `+${formatNumber(project.starsInPeriod)} stars ${starsLabel}`}
                </span>
                <span>
                    <strong>Category:</strong> {project.category?.label || CATEGORY_LABELS.other} (inferred)
                </span>
            </div>
        </article>
    );
}

export default function TrendingProjects() {
    const [feed, setFeed] = useState(null);
    const [status, setStatus] = useState('loading');
    const [errorMessage, setErrorMessage] = useState('');
    const [period, setPeriod] = useState('daily');
    const [category, setCategory] = useState('all');
    const [query, setQuery] = useState('');

    const activePeriod = feed?.periods?.[period];
    const projects = activePeriod?.projects || EMPTY_PROJECTS;

    useEffect(() => {
        const controller = new AbortController();

        async function loadFeed() {
            try {
                const response = await fetch(getPublicDataUrl(), { signal: controller.signal });
                if (!response.ok) {
                    throw new Error(`Trending snapshot request failed with HTTP ${response.status}.`);
                }

                const data = await response.json();
                if (!data.generatedAt || !data.periods
                    || PERIODS.some((item) => !Array.isArray(data.periods[item.id]?.projects))) {
                    throw new Error('Trending snapshot is missing required data.');
                }
                setFeed(data);
                setStatus('success');
            } catch (error) {
                if (!controller.signal.aborted) {
                    setErrorMessage(error.message || 'Unable to load the trending snapshot.');
                    setStatus('error');
                }
            }
        }

        loadFeed();
        return () => controller.abort();
    }, []);

    useEffect(() => {
        if (category !== 'all' && activePeriod
            && !projects.some((project) => project.category?.id === category)) {
            setCategory('all');
        }
    }, [activePeriod, category, projects]);

    const availableCategories = useMemo(
        () => CATEGORY_ORDER.filter((id) => projects.some((project) => project.category?.id === id)),
        [projects],
    );
    const searchTerm = query.trim().toLowerCase();
    const matchingProjects = projects.filter((project) => {
        const searchableText = [
            project.fullName,
            project.description,
            project.primaryLanguage,
            ...(Array.isArray(project.topics) ? project.topics : []),
        ].filter(Boolean).join(' ').toLowerCase();
        return searchableText.includes(searchTerm);
    });
    const visibleCategories = availableCategories.filter((id) => (
        (category === 'all' || id === category)
        && matchingProjects.some((project) => project.category?.id === id)
    ));

    if (status === 'loading') {
        return <div className='trending-message' role='status'>Loading GitHub Trending snapshot…</div>;
    }

    if (status === 'error') {
        return <div className='trending-message trending-error' role='alert'>{errorMessage}</div>;
    }

    return (
        <section className='trending-board' aria-labelledby='trending-title'>
            <div className='trending-intro'>
                <div>
                    <h2 id='trending-title'>GitHub Trending</h2>
                    <p>
                        Snapshot captured {formatDate(feed.generatedAt)}. Star gains and repository details come
                        from GitHub. {feed.categoryNote} {feed.scopeNote}
                    </p>
                </div>
                <a href={activePeriod?.sourceUrl || 'https://github.com/trending'} target='_blank' rel='noreferrer'>
                    Open GitHub Trending ↗
                </a>
            </div>

            <div className='trending-controls'>
                <input
                    className='trending-search'
                    type='search'
                    aria-label='Filter repositories by project name, description, language, or topic'
                    placeholder='Filter projects and technologies'
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                />
                <div className='trending-control-group' role='group' aria-label='Trending period'>
                    {PERIODS.map((item) => (
                        <button
                            key={item.id}
                            type='button'
                            className={`trending-filter${period === item.id ? ' active' : ''}`}
                            aria-pressed={period === item.id}
                            onClick={() => setPeriod(item.id)}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
                <div className='trending-control-group' role='group' aria-label='Project category'>
                    <button
                        type='button'
                        className={`trending-filter${category === 'all' ? ' active' : ''}`}
                        aria-pressed={category === 'all'}
                        onClick={() => setCategory('all')}
                    >
                        All categories
                    </button>
                    {availableCategories.map((id) => (
                        <button
                            key={id}
                            type='button'
                            className={`trending-filter${category === id ? ' active' : ''}`}
                            aria-pressed={category === id}
                            onClick={() => setCategory(id)}
                        >
                            {CATEGORY_LABELS[id]}
                        </button>
                    ))}
                </div>
            </div>

            <p className='trending-source-note'>
                Showing repositories trending {activePeriod?.starsLabel || 'during this period'}.
                Technology details show the primary language and repository topics published by GitHub.
                Missing values are identified rather than guessed.
            </p>

            {visibleCategories.length === 0 && (
                <div className='trending-message'>
                    {projects.length === 0
                        ? 'No repositories are available for this period yet.'
                        : 'No trending repositories match the current filters.'}
                </div>
            )}

            {visibleCategories.map((id) => {
                const categoryProjects = matchingProjects.filter((project) => project.category?.id === id);
                return (
                    <section key={id} className='trending-category' aria-labelledby={`trending-${id}`}>
                        <h3 id={`trending-${id}`}>{CATEGORY_LABELS[id]}</h3>
                        <div className='trending-grid'>
                            {categoryProjects.map((project) => (
                                <TrendingProjectCard
                                    key={project.fullName}
                                    project={project}
                                    starsLabel={activePeriod?.starsLabel || 'in this period'}
                                />
                            ))}
                        </div>
                    </section>
                );
            })}
        </section>
    );
}
