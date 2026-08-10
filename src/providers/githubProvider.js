import axios from 'axios';

const GITHUB_USERS_URL = 'https://api.github.com/users';
const MAX_SOCIAL_LINKS = 5;

const PROVIDER_LABELS = {
    twitter: 'Twitter',
    linkedin: 'LinkedIn',
    bluesky: 'Bluesky',
    mastodon: 'Mastodon',
    instagram: 'Instagram',
    youtube: 'YouTube',
    facebook: 'Facebook',
};

let lastRateLimit = null;

function captureRateLimit(headers) {
    if (!headers || headers['x-ratelimit-remaining'] === undefined) return;
    lastRateLimit = {
        remaining: Number(headers['x-ratelimit-remaining']),
        limit: Number(headers['x-ratelimit-limit']),
        resetAt: new Date(Number(headers['x-ratelimit-reset']) * 1000),
    };
}

export function getLastRateLimit() {
    return lastRateLimit;
}

function labelForSocialAccount(account) {
    if (PROVIDER_LABELS[account.provider]) return PROVIDER_LABELS[account.provider];
    try {
        const host = new URL(account.url).hostname.replace(/^www\./, '');
        const name = host.split('.')[0];
        return name.charAt(0).toUpperCase() + name.slice(1);
    } catch {
        return 'Link';
    }
}

function buildLinks(data, socialAccounts) {
    const links = (socialAccounts || []).map((account) => ({
        label: labelForSocialAccount(account),
        url: account.url,
    }));

    if (!links.some((link) => link.label === 'Twitter') && data.twitter_username) {
        links.push({ label: 'Twitter', url: `https://twitter.com/${data.twitter_username}` });
    }

    if (data.blog) {
        const websiteUrl = /^https?:\/\//.test(data.blog) ? data.blog : `https://${data.blog}`;
        links.push({ label: 'Website', url: websiteUrl });
    }

    return links.slice(0, MAX_SOCIAL_LINKS);
}

function normalize(data, socialAccounts) {
    return {
        avatarUrl: data.avatar_url,
        name: data.name || data.login,
        handle: data.login,
        profileUrl: data.html_url,
        bio: data.bio || null,
        joinedAt: data.created_at,
        location: data.location || null,
        company: data.company || null,
        stats: [
            { key: 'repos', label: 'REPOS', value: data.public_repos },
            { key: 'followers', label: 'FOLLOWERS', value: data.followers },
            { key: 'following', label: 'FOLLOWING', value: data.following },
        ],
        links: buildLinks(data, socialAccounts),
    };
}

async function search(username) {
    let profileData;
    try {
        const response = await axios.get(`${GITHUB_USERS_URL}/${username}`);
        captureRateLimit(response.headers);
        profileData = response.data;
    } catch (err) {
        captureRateLimit(err.response?.headers);
        if (err.response?.status === 404) {
            throw new Error(`No profile found for "${username}"`);
        }
        if (err.response?.status === 403) {
            throw new Error('Rate limit exceeded. Please try again later.');
        }
        throw new Error('Something went wrong. Please try again.');
    }

    let socialAccounts = [];
    try {
        const socialResponse = await axios.get(`${GITHUB_USERS_URL}/${username}/social_accounts`);
        captureRateLimit(socialResponse.headers);
        socialAccounts = socialResponse.data;
    } catch {
        // social links are a bonus on top of the core profile - a hiccup here shouldn't fail the search
    }

    return normalize(profileData, socialAccounts);
}

/** @type {import('./types').Provider} */
const githubProvider = {
    id: 'github',
    label: 'GitHub',
    placeholder: 'octocat',
    search,
    getLastRateLimit,
};

export default githubProvider;
