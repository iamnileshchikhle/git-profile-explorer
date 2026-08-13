import axios from 'axios';

const NPM_SEARCH_URL = 'https://registry.npmjs.org/-/v1/search';
const RESULTS_SIZE = 20;
const MAX_KEYWORDS = 4;

function normalize(objects) {
    return objects.map(({ package: pkg, downloads, updated }) => ({
        name: pkg.name,
        description: pkg.description || null,
        version: pkg.version,
        license: pkg.license || null,
        weeklyDownloads: downloads?.weekly ?? null,
        monthlyDownloads: downloads?.monthly ?? null,
        keywords: (pkg.keywords || []).slice(0, MAX_KEYWORDS),
        allKeywords: pkg.keywords || [],
        publisher: pkg.publisher?.username || null,
        updatedAt: updated || pkg.date || null,
        npmUrl: pkg.links?.npm,
        homepageUrl: pkg.links?.homepage || null,
        repositoryUrl: pkg.links?.repository ? pkg.links.repository.replace(/^git\+/, '').replace(/\.git$/, '') : null,
    }));
}

export async function searchPackages(query) {
    try {
        const { data } = await axios.get(NPM_SEARCH_URL, {
            params: { text: query, size: RESULTS_SIZE },
        });
        return normalize(data.objects);
    } catch {
        throw new Error('Something went wrong. Please try again.');
    }
}
