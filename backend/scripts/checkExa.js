const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const searchPeople = require('../services/exa');

searchPeople(process.env.EXA_API_KEY?.trim(), 'public professional profile of a software engineer', 1)
  .then(results => {
    console.log('Exa returned HTTP success with ' + results.length + ' usable result(s)');
  })
  .catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
