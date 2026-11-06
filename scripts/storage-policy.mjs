export const thresholdBytes = 850_000_000;
export function due(status) {
 if (!Number.isSafeInteger(status.databaseBytes) || status.databaseBytes < 0) throw Error('Database storage reading unavailable.');
 return Boolean(status.activeJob || status.draining || (status.databaseBytes >= thresholdBytes && (status.queued || status.queuedIcons)));
}
export function sameApp(tag, version) {
 const bundle = /^download-(\d+\.\d+\.\d+)-[a-f0-9]{32}$/.exec(tag);
 return tag === 'v' + version || bundle?.[1] === version;
}
