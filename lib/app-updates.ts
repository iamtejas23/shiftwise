const LATEST_RELEASE_API = 'https://api.github.com/repos/iamtejas23/shiftwise/releases/latest';
const RELEASE_PAGE = 'https://github.com/iamtejas23/shiftwise/releases/latest';

export type LatestAppRelease = {
  version: string;
  pageUrl: string;
  apkUrl: string | null;
};

type GitHubRelease = {
  tag_name?: unknown;
  html_url?: unknown;
  assets?: unknown;
};

function parseVersion(version: string): {
  core: number[];
  prerelease: Array<number | string> | null;
} | null {
  const match = /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/.exec(version.trim());
  if (!match) {
    return null;
  }

  const prereleaseParts = match[4]?.split('.') ?? null;
  if (
    prereleaseParts?.some(
      (part) => !part || (/^\d+$/.test(part) && part.length > 1 && part.startsWith('0'))
    )
  ) return null;
  const prerelease = prereleaseParts?.map((part) => (/^\d+$/.test(part) ? Number(part) : part)) ?? null;

  return {
    core: [Number(match[1]), Number(match[2]), Number(match[3])],
    prerelease,
  };
}

/** Returns a positive number when `left` is newer, or zero when equal. */
export function compareAppVersions(left: string, right: string): number | null {
  const a = parseVersion(left);
  const b = parseVersion(right);
  if (!a || !b) {
    return null;
  }

  for (let index = 0; index < a.core.length; index += 1) {
    if (a.core[index] !== b.core[index]) {
      return a.core[index] - b.core[index];
    }
  }

  if (a.prerelease === null || b.prerelease === null) {
    if (a.prerelease === b.prerelease) return 0;
    return a.prerelease === null ? 1 : -1;
  }

  const length = Math.max(a.prerelease.length, b.prerelease.length);
  for (let index = 0; index < length; index += 1) {
    const leftPart = a.prerelease[index];
    const rightPart = b.prerelease[index];
    if (leftPart === undefined || rightPart === undefined) {
      return leftPart === rightPart ? 0 : leftPart === undefined ? -1 : 1;
    }
    if (leftPart === rightPart) continue;
    if (typeof leftPart === 'number' && typeof rightPart === 'string') return -1;
    if (typeof leftPart === 'string' && typeof rightPart === 'number') return 1;
    if (typeof leftPart === 'number' && typeof rightPart === 'number') {
      return leftPart - rightPart;
    }
    return String(leftPart).localeCompare(String(rightPart));
  }
  return 0;
}

export async function getLatestAppRelease(): Promise<LatestAppRelease> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  let response: Response;
  try {
    response = await fetch(LATEST_RELEASE_API, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
  if (!response.ok) {
    throw new Error(`Release check failed (${response.status}).`);
  }

  const release = (await response.json()) as GitHubRelease;
  if (typeof release.tag_name !== 'string') {
    throw new Error('The latest release did not include a version tag.');
  }

  const version = release.tag_name.replace(/^v/i, '');
  if (!parseVersion(version)) {
    throw new Error('The latest release has an invalid version tag.');
  }

  const assets = Array.isArray(release.assets) ? release.assets : [];
  const apkAsset = assets.find((asset) => {
    if (!asset || typeof asset !== 'object') return false;
    const item = asset as { name?: unknown; browser_download_url?: unknown };
    return item.name === `Shiftwise-v${version}.apk` && typeof item.browser_download_url === 'string';
  }) as { browser_download_url: string } | undefined;

  const apkUrl = apkAsset?.browser_download_url;
  return {
    version,
    pageUrl:
      typeof release.html_url === 'string' && release.html_url.startsWith('https://github.com/')
        ? release.html_url
        : RELEASE_PAGE,
    apkUrl:
      apkUrl?.startsWith('https://github.com/iamtejas23/shiftwise/releases/download/')
        ? apkUrl
        : null,
  };
}

