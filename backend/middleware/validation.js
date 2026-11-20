const { HttpError } = require('./errors');

const isObjectId = value => typeof value === 'string' && /^[a-f0-9]{24}$/i.test(value);
const invalid = field => new HttpError(400, `Invalid ${field}`);

function body(req) {
  if (req.body === undefined || req.body === null) return {};
  if (typeof req.body !== 'object' || Array.isArray(req.body) || Buffer.isBuffer(req.body)) throw invalid('request body');
  return req.body;
}

function string(value, field, max, { optional = false, empty = false } = {}) {
  if (value === undefined && optional) return undefined;
  if (typeof value !== 'string') throw invalid(field);
  const result = value.trim();
  if ((!result && !empty) || result.length > max) throw invalid(field);
  return result;
}

function choice(value, field, values) {
  if (!values.includes(value)) throw invalid(field);
  return value;
}

function number(value, field, min, max) {
  if (typeof value !== 'number' && (typeof value !== 'string' || !/^\d+(?:\.\d+)?$/.test(value.trim()))) {
    throw invalid(field);
  }
  const result = Number(value);
  if (!Number.isFinite(result) || result < min || result > max) throw invalid(field);
  return result;
}

function integer(value, field, min, max) {
  const result = number(value, field, min, max);
  if (!Number.isSafeInteger(result)) throw invalid(field);
  return result;
}

function validateId(req, res, next, value) {
  next(isObjectId(value) ? undefined : invalid('identifier'));
}

function paginate(req, res, query) {
  if (req.query.page === undefined && req.query.limit === undefined) return query;
  const page = integer(req.query.page ?? '1', 'page', 1, 10000);
  const limit = integer(req.query.limit ?? '25', 'limit', 1, 100);
  const url = new URL(req.originalUrl, 'http://localhost');
  url.searchParams.set('limit', limit);
  const links = [];
  if (page > 1) {
    url.searchParams.set('page', page - 1);
    links.push(`<${url.pathname}${url.search}>; rel="prev"`);
  }
  // Fetch one extra record so the last page has no misleading next link.
  return query.skip((page - 1) * limit).limit(page === 10000 ? limit : limit + 1).then(records => {
    if (records.length > limit) {
      url.searchParams.set('page', page + 1);
      links.push(`<${url.pathname}${url.search}>; rel="next"`);
      records.pop();
    }
    if (links.length) res.set('Link', links.join(', '));
    return records;
  });
}

module.exports = { isObjectId, invalid, body, string, choice, number, integer, validateId, paginate };
