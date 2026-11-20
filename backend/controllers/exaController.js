const { body, integer, string } = require('../middleware/validation');
const searchPeople = require('../services/exa');

async function searchPeopleRoute(req, res) {
  const input = body(req);
  const query = string(input.query, 'search query', 500);
  const numResults = input.numResults === undefined ? 10 : integer(input.numResults, 'numResults', 1, 10);
  res.json(await searchPeople(req.app.locals.config.exaApiKey, query, numResults));
}

module.exports = searchPeopleRoute;
