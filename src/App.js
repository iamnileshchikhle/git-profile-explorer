import React, { useState } from 'react';
import ThemeToggle from './components/ThemeToggle';
import ModeSwitch from './components/ModeSwitch';
import SearchBar from './components/SearchBar';
import RecentSearches from './components/RecentSearches';
import RateLimitNote from './components/RateLimitNote';
import ProfileCard from './components/ProfileCard';
import PackageResults from './components/PackageResults';
import EmptyState from './components/EmptyState';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import { useProfileSearch } from './hooks/useProfileSearch';
import { usePackageSearch } from './hooks/usePackageSearch';
import { useTheme } from './hooks/useTheme';
import './App.css';

function initialMode() {
    return new URLSearchParams(window.location.search).get('mode') === 'packages' ? 'packages' : 'person';
}

function App() {
    const [theme, setTheme] = useTheme();
    const [mode, setMode] = useState(initialMode);

    const person = useProfileSearch();
    const pkgs = usePackageSearch();

    const selectMode = (nextMode) => {
        if (nextMode === mode) return;
        setMode(nextMode);
        const url = new URL(window.location.href);
        url.searchParams.set('mode', nextMode);
        window.history.replaceState(null, '', url);
    };

    return (
        <div className='App'>
            <div className='page'>
                <div className='top-bar'>
                    <ThemeToggle theme={theme} onChange={setTheme} />
                </div>

                <header className='hero'>
                    <span className='eyebrow'>Public Record Lookup</span>
                    <h1>Profile Viewer</h1>
                </header>

                <ModeSwitch activeId={mode} onSelect={selectMode} />

                {mode === 'person' ? (
                    <>
                        <SearchBar
                            value={person.query}
                            onChange={person.setQuery}
                            onSubmit={person.search}
                            isLoading={person.status === 'loading'}
                            placeholder={person.provider.placeholder}
                            label='Enter Handle'
                            actionLabel='Pull Record'
                            loadingLabel='Pulling...'
                        />
                        <RecentSearches items={person.recentSearches} onSelect={person.search} />
                        <RateLimitNote rateLimit={person.rateLimit} />

                        {person.status === 'idle' && (
                            <EmptyState message='Enter a handle to pull their public record.' />
                        )}
                        {person.status === 'loading' && <LoadingState message='Scanning record...' />}
                        {person.status === 'error' && <ErrorState message={person.errorMessage} />}
                        {person.status === 'success' && person.profile && <ProfileCard profile={person.profile} />}
                    </>
                ) : (
                    <>
                        <SearchBar
                            value={pkgs.query}
                            onChange={pkgs.setQuery}
                            onSubmit={pkgs.search}
                            isLoading={pkgs.status === 'loading'}
                            placeholder='react'
                            label='Search Packages'
                            actionLabel='Search'
                            loadingLabel='Searching...'
                        />
                        <RecentSearches items={pkgs.recentSearches} onSelect={pkgs.search} prefix='' />

                        {pkgs.status === 'idle' && (
                            <EmptyState message='Search for a package, library, or tool.' />
                        )}
                        {pkgs.status === 'loading' && <LoadingState message='Searching npm...' />}
                        {pkgs.status === 'error' && <ErrorState message={pkgs.errorMessage} />}
                        {pkgs.status === 'success' && <PackageResults query={pkgs.query} packages={pkgs.results} />}
                    </>
                )}
            </div>
        </div>
    );
}

export default App;
