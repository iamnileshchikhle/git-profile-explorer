import { useEffect, useState } from 'react';
import { searchPackages } from '../services/npmRegistry';

const RECENT_KEY = 'profileViewer.recentPackageSearches';
const RECENT_LIMIT = 6;

function loadRecent() {
    try {
        const raw = window.localStorage.getItem(RECENT_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveRecent(list) {
    try {
        window.localStorage.setItem(RECENT_KEY, JSON.stringify(list));
    } catch {
        // localStorage unavailable (private mode / quota) - recent list just won't persist
    }
}

function syncUrl(query) {
    const url = new URL(window.location.href);
    url.searchParams.set('mode', 'packages');
    url.searchParams.set('q', query);
    url.searchParams.delete('u');
    window.history.replaceState(null, '', url);
}

export function usePackageSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [errorMessage, setErrorMessage] = useState(null);
    const [status, setStatus] = useState('idle');
    const [recentSearches, setRecentSearches] = useState(loadRecent);

    const search = async (text) => {
        const trimmed = text.trim();
        if (!trimmed || status === 'loading') return;

        setQuery(trimmed);
        setStatus('loading');
        setErrorMessage(null);
        try {
            const packages = await searchPackages(trimmed);
            setResults(packages);
            setStatus('success');
            syncUrl(trimmed);
            setRecentSearches((prev) => {
                const next = [trimmed, ...prev.filter((q) => q.toLowerCase() !== trimmed.toLowerCase())].slice(0, RECENT_LIMIT);
                saveRecent(next);
                return next;
            });
        } catch (err) {
            setResults([]);
            setErrorMessage(err.message);
            setStatus('error');
        }
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const sharedQuery = params.get('q');
        if (params.get('mode') === 'packages' && sharedQuery) {
            search(sharedQuery);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { query, setQuery, results, errorMessage, status, search, recentSearches };
}
