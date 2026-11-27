const fs = require('node:fs');
const path = require('node:path');

const PERIODS = [
    { id: 'daily', label: 'Daily', starsLabel: 'today' },
    { id: 'weekly', label: 'Weekly', starsLabel: 'this week' },
    { id: 'monthly', label: 'Monthly', starsLabel: 'this month' },
];

const CATEGORY_LABELS = {
    ai: 'AI',
    'web-development': 'Web development',
    'developer-tools': 'Developer tools',
    mobile: 'Mobile',
    infrastructure: 'Infrastructure',
    other: 'Other',
};

const OFFENSIVE_TOPIC_FLAGS = new Set([
    'exploit',
    'exploit-kit',
    'malware',
    'ransomware',
    'offensive-security',
    'red-team',
    'pentest',
    'pentesting',
    'penetration-testing',
    'credential-stealer',
    'keylogger',
    'webshell',
    'botnet',
]);

function decodeHtmlEntities(value) {
    return value.replace(/&(#(?:x[\da-f]+|\d+)|amp|lt|gt|quot|apos|nbsp);/gi, (entity, code) => {
        if (code[0] === '#') {
            const point = code[1].toLowerCase() === 'x'
                ? Number.parseInt(code.slice(2), 16)
                : Number.parseInt(code.slice(1), 10);
            return Number.isFinite(point) ? String.fromCodePoint(point) : entity;
        }

        return {
            amp: '&',
            lt: '<',
            gt: '>',
            quot: '"',
            apos: "'",
            nbsp: ' ',
        }[code.toLowerCase()] || entity;
    });
}

function textFromHtml(value) {
    return decodeHtmlEntities(value.replace(/<[^>]*>/g, ' '))
        .replace(/\s+/g, ' ')
        .trim();
}

function parseCount(value) {
    if (!value) return null;
    const match = value.replace(/,/g, '').match(/^([\d.]+)\s*([kmb])?$/i);
    if (!match) return null;

    const multiplier = { k: 1_000, m: 1_000_000, b: 1_000_000_000 }[match[2]?.toLowerCase()] || 1;
    const count = Number(match[1]) * multiplier;
    return Number.isFinite(count) ? Math.round(count) : null;
}

function parseTrendingPage(html) {
    const articles = [...html.matchAll(/<article\b[\s\S]*?<\/article>/gi)];
    return articles.flatMap(([article]) => {
        const heading = article.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i);
        const repositoryLink = heading?.[1].match(/<a\b[^>]*href="\/([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
        if (!repositoryLink) return [];

        const segments = repositoryLink[1].split('/').filter(Boolean);
        if (segments.length !== 2) return [];

        const [owner, name] = segments.map(decodeURIComponent);
        const descriptionMatch = article.match(/<p\b(?=[^>]*class="[^"]*\bcol-9\b[^"]*")[^>]*>([\s\S]*?)<\/p>/i);
        const languageMatch = article.match(/<span\b[^>]*itemprop="programmingLanguage"[^>]*>([\s\S]*?)<\/span>/i);
        const starsMatch = article.match(/<a\b[^>]*href="\/[^/]+\/[^/]+\/stargazers"[^>]*>([\s\S]*?)<\/a>/i);
        const articleText = textFromHtml(article);
        const trendingStarsMatch = articleText.match(/([\d,.]+\s*[kmb]?)\s+stars?\s+(today|this week|this month)\b/i);

        return [{
            owner,
            name,
            fullName: `${owner}/${name}`,
            url: `https://github.com/${owner}/${name}`,
            description: descriptionMatch ? textFromHtml(descriptionMatch[1]) : null,
            primaryLanguage: languageMatch ? textFromHtml(languageMatch[1]) : null,
            stars: starsMatch ? parseCount(textFromHtml(starsMatch[1])) : null,
            starsInPeriod: trendingStarsMatch ? parseCount(trendingStarsMatch[1]) : null,
        }];
    });
}

function categorizeProject({ topics = [], description = '', name = '', language = '' }) {
    const topicSet = new Set(topics.map((topic) => topic.toLowerCase()));
    const text = `${topics.join(' ')} ${description} ${name} ${language}`.toLowerCase();
    const hasTopic = (...values) => values.some((value) => topicSet.has(value));
    const matches = (pattern) => pattern.test(text);

    if (hasTopic(
        'ai',
        'ai-agents',
        'ai-security',
        'agent-skills',
        'anthropic',
        'artificial-intelligence',
        'claude',
        'claude-code',
        'codex',
        'generative-ai',
        'llm',
        'llms',
        'machine-learning',
        'openai',
    )
        || matches(/\b(ai|agentic|artificial intelligence|machine learning|deep learning|large language model|generative ai|claude|llm)\b/)) {
        return { id: 'ai', label: CATEGORY_LABELS.ai };
    }
    if (hasTopic('android', 'ios', 'mobile', 'react-native', 'flutter')
        || matches(/\b(android|ios|mobile app|react native|flutter|app store|google play)\b/)) {
        return { id: 'mobile', label: CATEGORY_LABELS.mobile };
    }
    if (hasTopic(
        'content-cache',
        'database',
        'devops',
        'docker',
        'infrastructure',
        'kubernetes',
        'load-balancer',
        'observability',
        'reverse-proxy',
        'terraform',
        'web-server',
    )
        || matches(/\b(devops|kubernetes|docker|cloud infrastructure|terraform|observability|reverse proxy|web server|load balancer|nginx)\b/)) {
        return { id: 'infrastructure', label: CATEGORY_LABELS.infrastructure };
    }
    if (hasTopic('cli', 'command-line', 'compiler', 'developer-tools', 'devtools', 'ide', 'plugin', 'plugins')
        || matches(/\b(cli|developer tools|command line|terminal|compiler|debugger|code editor|plugins?|mcp|agent skills|cursor)\b/)) {
        return { id: 'developer-tools', label: CATEGORY_LABELS['developer-tools'] };
    }
    if (hasTopic('web', 'frontend', 'backend', 'react', 'vue', 'svelte', 'nextjs')
        || matches(/\b(web app|web framework|frontend|backend|react|vue|svelte|next\.?js)\b/)
        || ['javascript', 'typescript', 'html', 'css'].includes(String(language).toLowerCase())) {
        return { id: 'web-development', label: CATEGORY_LABELS['web-development'] };
    }

    return { id: 'other', label: CATEGORY_LABELS.other };
}

function isOffensiveSecurityProject({ topics = [], description = '' }) {
    const topicSet = new Set((Array.isArray(topics) ? topics : []).map((topic) => topic.toLowerCase()));
    return [...OFFENSIVE_TOPIC_FLAGS].some((topic) => topicSet.has(topic))
        || /\b(red[- ]team|offensive security|exploit kit|malware|ransomware|credential stealer|keylogger|webshell|botnet)\b/i.test(description);
}

async function fetchTrendingPage(period) {
    const url = `https://github.com/trending?since=${period.id}`;
    const response = await fetch(url, {
        headers: { 'User-Agent': 'git-profile-explorer-trending-feed' },
        signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) {
        throw new Error(`GitHub Trending returned HTTP ${response.status} for ${period.label.toLowerCase()} results.`);
    }

    const projects = parseTrendingPage(await response.text());
    if (projects.length === 0) {
        throw new Error(`No repositories could be parsed from GitHub Trending (${period.label.toLowerCase()}).`);
    }
    return projects;
}

async function fetchRepositoryMetadata(project) {
    if (githubApiRateLimited && !process.env.GITHUB_TOKEN) {
        return {
            fullName: project.fullName,
            url: project.url,
            description: project.description,
            primaryLanguage: project.primaryLanguage,
            stars: project.stars,
            topics: null,
        };
    }

    const headers = {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'git-profile-explorer-trending-feed',
        'X-GitHub-Api-Version': '2022-11-28',
    };
    if (process.env.GITHUB_TOKEN) {
        headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const response = await fetch(`https://api.github.com/repos/${project.fullName}`, {
        headers,
        signal: AbortSignal.timeout(20_000),
    });
    if (response.status === 404) {
        console.warn(`Skipping ${project.fullName}: repository was no longer available during verification.`);
        return null;
    }
    if (response.status === 403
        && !process.env.GITHUB_TOKEN
        && response.headers.get('x-ratelimit-remaining') === '0') {
        if (!githubApiRateLimited) {
            console.warn('GitHub API rate limit reached; remaining repository topics will be marked unavailable.');
        }
        githubApiRateLimited = true;
        return {
            fullName: project.fullName,
            url: project.url,
            description: project.description,
            primaryLanguage: project.primaryLanguage,
            stars: project.stars,
            topics: null,
        };
    }
    if (!response.ok) {
        throw new Error(`GitHub API returned HTTP ${response.status} while verifying ${project.fullName}.`);
    }

    const repository = await response.json();
    return {
        fullName: repository.full_name,
        url: repository.html_url,
        description: repository.description,
        primaryLanguage: repository.language,
        stars: repository.stargazers_count,
        topics: Array.isArray(repository.topics) ? repository.topics : null,
    };
}

let githubApiRateLimited = false;

async function mapWithConcurrency(items, limit, callback) {
    const results = new Array(items.length);
    let nextIndex = 0;

    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
        while (nextIndex < items.length) {
            const index = nextIndex++;
            results[index] = await callback(items[index]);
        }
    }));

    return results;
}

async function updateTrending() {
    const periodResults = await Promise.all(PERIODS.map(async (period) => ({
        period,
        projects: await fetchTrendingPage(period),
    })));
    const uniqueProjects = new Map();
    for (const { projects } of periodResults) {
        for (const project of projects) uniqueProjects.set(project.fullName, project);
    }

    const metadata = await mapWithConcurrency(
        [...uniqueProjects.values()],
        6,
        fetchRepositoryMetadata,
    );
    const metadataByName = new Map(
        metadata.filter(Boolean).map((repository) => [repository.fullName, repository]),
    );
    const excludedRepos = new Set();
    for (const repository of metadataByName.values()) {
        if (isOffensiveSecurityProject(repository)) {
            excludedRepos.add(repository.fullName);
            console.warn(`Omitting ${repository.fullName}: its public metadata identifies offensive security tooling.`);
        }
    }

    const periods = {};
    for (const { period, projects } of periodResults) {
        periods[period.id] = {
            label: period.label,
            starsLabel: period.starsLabel,
            sourceUrl: `https://github.com/trending?since=${period.id}`,
            projects: projects.flatMap((project) => {
                const repository = metadataByName.get(project.fullName);
                if (!repository || excludedRepos.has(project.fullName)) return [];

                const description = repository.description || project.description;
                const language = repository.primaryLanguage || project.primaryLanguage;
                const topics = repository.topics;

                return [{
                    ...project,
                    url: repository.url,
                    description,
                    primaryLanguage: language,
                    stars: repository.stars ?? project.stars,
                    topics,
                    category: categorizeProject({
                        topics: topics || [],
                        description: description || '',
                        name: project.name,
                        language: language || '',
                    }),
                }];
            }),
        };
    }

    const feed = {
        source: 'GitHub Trending',
        generatedAt: new Date().toISOString(),
        categoryNote: 'Categories are inferred from repository descriptions and GitHub topics.',
        scopeNote: 'Repositories whose public metadata identifies explicit offensive-security or malware tooling are omitted.',
        periods,
    };
    const outputPath = path.join(__dirname, '..', 'public', 'data', 'github-trending.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, `${JSON.stringify(feed, null, 2)}\n`);
    const listingCount = Object.values(periods).reduce((total, item) => total + item.projects.length, 0);
    console.log(`Updated GitHub Trending snapshot at ${feed.generatedAt} (${listingCount} period listings).`);
}

if (require.main === module) {
    updateTrending().catch((error) => {
        console.error(`Unable to update GitHub Trending snapshot: ${error.message}`);
        process.exitCode = 1;
    });
}

module.exports = {
    categorizeProject,
    isOffensiveSecurityProject,
    parseCount,
    parseTrendingPage,
};
