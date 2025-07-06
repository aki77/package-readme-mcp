export function extractRepositoryName(url: string): string | null {
  const githubMatch = url.match(/github\.com[/:]([^/]+\/[^/]+?)(?:\.git)?(?:[/#].*)?$/);
  return githubMatch ? githubMatch[1] : null;
}

export function extractGitHubUrlFromText(content: string): string | null {
  const githubUrlMatch = content.match(/https?:\/\/github\.com\/[^\/\s"'`]+\/[^\/\s"'`]+/);
  return githubUrlMatch ? githubUrlMatch[0] : null;
}

export function getRepositoryNameFromText(content: string): string | null {
  const githubUrl = extractGitHubUrlFromText(content);
  return githubUrl ? extractRepositoryName(githubUrl) : null;
}