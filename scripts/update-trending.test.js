const test = require('node:test');
const assert = require('node:assert/strict');
const {
    categorizeProject,
    isOffensiveSecurityProject,
    parseTrendingPage,
} = require('./update-trending');

test('parses repository details and the period-specific star signal', () => {
    const html = `
        <article class="Box-row">
          <h2><a href="/octo/sample-project">octo / sample-project</a></h2>
          <p class="col-9 color-fg-muted">A &amp; B project</p>
          <span itemprop="programmingLanguage">TypeScript</span>
          <a href="/octo/sample-project/stargazers"><svg></svg> 12,345</a>
          <span>321 stars today</span>
        </article>`;

    assert.deepEqual(parseTrendingPage(html), [{
        owner: 'octo',
        name: 'sample-project',
        fullName: 'octo/sample-project',
        url: 'https://github.com/octo/sample-project',
        description: 'A & B project',
        primaryLanguage: 'TypeScript',
        stars: 12345,
        starsInPeriod: 321,
    }]);
});

test('keeps unavailable fields explicit when GitHub omits them', () => {
    const html = '<article><h2><a href="/octo/no-metadata">octo / no-metadata</a></h2></article>';
    const [project] = parseTrendingPage(html);

    assert.equal(project.description, null);
    assert.equal(project.primaryLanguage, null);
    assert.equal(project.stars, null);
    assert.equal(project.starsInPeriod, null);
});

test('categorizes projects using repository topics and description signals', () => {
    assert.deepEqual(
        categorizeProject({
            topics: ['machine-learning'],
            description: 'A toolkit for developers',
        }),
        { id: 'ai', label: 'AI' },
    );
    assert.deepEqual(
        categorizeProject({
            topics: ['cli'],
            description: 'CLI for managing project builds',
        }),
        { id: 'developer-tools', label: 'Developer tools' },
    );
    assert.deepEqual(
        categorizeProject({
            topics: [],
            description: 'An agentic coding framework',
        }),
        { id: 'ai', label: 'AI' },
    );
    assert.deepEqual(
        categorizeProject({
            topics: [],
            description: 'A project dashboard',
            language: 'TypeScript',
        }),
        { id: 'web-development', label: 'Web development' },
    );
});

test('omits repositories explicitly tagged for offensive security tooling', () => {
    assert.equal(isOffensiveSecurityProject({
        topics: ['offensive-security'],
        description: 'Security research project',
    }), true);
    assert.equal(isOffensiveSecurityProject({
        topics: ['defensive-security'],
        description: 'A vulnerability reporting dashboard',
    }), false);
});
