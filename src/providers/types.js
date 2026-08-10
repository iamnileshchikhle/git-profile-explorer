/**
 * @typedef {Object} ProfileStat
 * @property {string} key
 * @property {string} label
 * @property {string|number} value
 */

/**
 * @typedef {Object} ProfileLink
 * @property {string} label
 * @property {string} url
 */

/**
 * @typedef {Object} NormalizedProfile
 * @property {string|null} avatarUrl
 * @property {string} name
 * @property {string} handle
 * @property {string} profileUrl
 * @property {string|null} bio
 * @property {string} joinedAt
 * @property {string|null} location
 * @property {string|null} company
 * @property {ProfileStat[]} stats     3 headline numbers, provider-defined (repos/followers/following for GitHub, ratings for Chess.com, etc.)
 * @property {ProfileLink[]} links     secondary links beyond the primary profileUrl (Twitter, Twitch, ...)
 */

/**
 * @typedef {Object} Provider
 * @property {string} id
 * @property {string} label
 * @property {string} placeholder    example handle shown in the search input
 * @property {(username: string) => Promise<NormalizedProfile>} search
 */

export {};
