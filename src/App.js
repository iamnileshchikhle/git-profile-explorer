import React from 'react';
import SearchBar from './components/SearchBar';
import RecentSearches from './components/RecentSearches';
import RateLimitNote from './components/RateLimitNote';
import ProfileCard from './components/ProfileCard';
import EmptyState from './components/EmptyState';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import { useProfileSearch } from './hooks/useProfileSearch';
import './App.css';

function App() {
    const {
        provider,
        query,
        setQuery,
        profile,
        errorMessage,
        status,
        search,
        rateLimit,
        recentSearches,
    } = useProfileSearch();

    return (
        <div className='App'>
            <div className='page'>
                <header className='hero'>
                    <span className='eyebrow'>Public Record Lookup</span>
                    <h1>Profile Viewer</h1>
                </header>

                <SearchBar
                    value={query}
                    onChange={setQuery}
                    onSubmit={search}
                    isLoading={status === 'loading'}
                    placeholder={provider.placeholder}
                />
                <RecentSearches items={recentSearches} onSelect={search} />
                <RateLimitNote rateLimit={rateLimit} />

                {status === 'idle' && <EmptyState />}
                {status === 'loading' && <LoadingState />}
                {status === 'error' && <ErrorState message={errorMessage} />}
                {status === 'success' && profile && <ProfileCard profile={profile} />}
            </div>
        </div>
    );
}

export default App;
