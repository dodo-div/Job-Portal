const { HttpError } = require('../middleware/errors');

const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;

async function readResults(response) {
  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  let complete = false;
  try {
    while (!complete) {
      const { done, value } = await reader.read();
      complete = done;
      if (done) break;
      size += value.byteLength;
      if (size > MAX_RESPONSE_BYTES) throw new HttpError(502, 'Candidate search returned an oversized response');
      chunks.push(value);
    }
  } finally {
    if (!complete) await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
  const { results } = JSON.parse(Buffer.concat(chunks, size).toString('utf8'));
  if (!Array.isArray(results)) throw new HttpError(502, 'Candidate search returned an invalid response');
  return results.filter(result => typeof result?.url === 'string' && /^https?:\/\//i.test(result.url));
}

async function searchPeople(apiKey, query, numResults) {
  if (!apiKey) throw new HttpError(503, 'Candidate search is not configured (EXA_API_KEY is missing)');
  try {
    const response = await fetch('https://api.exa.ai/search', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, category: 'people', type: 'auto', numResults, contents: { text: false } }),
      redirect: 'error',
      signal: AbortSignal.timeout(8000),
    });

    if (response.ok) return await readResults(response);
    await response.body?.cancel();
    if ([401, 403].includes(response.status)) {
      throw new HttpError(503, 'Candidate search credentials were rejected (Exa HTTP ' + response.status + ')');
    }
    if ([402, 429].includes(response.status)) {
      throw new HttpError(503, 'Candidate search quota or rate limit reached (Exa HTTP ' + response.status + ')');
    }
    throw new HttpError(502, 'Candidate search failed (Exa HTTP ' + response.status + ')');
  } catch (error) {
    if (error instanceof HttpError) throw error;
    if (['TimeoutError', 'AbortError'].includes(error.name)) throw new HttpError(504, 'Candidate search timed out');
    throw new HttpError(502, 'Candidate search request failed');
  }
}

module.exports = searchPeople;
