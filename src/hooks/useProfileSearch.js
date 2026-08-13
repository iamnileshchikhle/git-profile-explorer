import { useEffect, useState } from 'react';
import { providers, defaultProviderId } from '../providers';

const RECENT_KEY = 'profileViewer.recentSearches';
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

function syncUrl(handle) {
    const url = new URL(window.location.href);
    url.searchParams.set('mode', 'person');
    url.searchParams.set('u', handle);
    url.searchParams.delete('q');
    window.history.replaceState(null, '', url);
}

export function useProfileSearch() {
    const [providerId] = useState(defaultProviderId);
    const [query, setQuery] = useState('');
    const [profile, setProfile] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [status, setStatus] = useState('idle');
    const [rateLimit, setRateLimit] = useState(null);
    const [recentSearches, setRecentSearches] = useState(loadRecent);

    const provider = providers[providerId];

    const search = async (username) => {
        const trimmed = username.trim();
        if (!trimmed || status === 'loading') return;

        setQuery(trimmed);
        setStatus('loading');
        setErrorMessage(null);
        try {
            const result = await provider.search(trimmed);
            setProfile(result);
            setStatus('success');
            syncUrl(trimmed);
            setRecentSearches((prev) => {
                const next = [trimmed, ...prev.filter((h) => h.toLowerCase() !== trimmed.toLowerCase())].slice(0, RECENT_LIMIT);
                saveRecent(next);
                return next;
            });
        } catch (err) {
            setProfile(null);
            setErrorMessage(err.message);
            setStatus('error');
        } finally {
            setRateLimit(provider.getLastRateLimit?.() ?? null);
        }
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const sharedHandle = params.get('u');
        if (sharedHandle && params.get('mode') !== 'packages') {
            search(sharedHandle);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { provider, query, setQuery, profile, errorMessage, status, search, rateLimit, recentSearches };
}
