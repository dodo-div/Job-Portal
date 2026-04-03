const axios = require('axios');

const searchPeople = async (req, res) => {
  try {
    const { query, numResults = 10 } = req.body;

    if (!query) return res.status(400).json({ message: 'Search query is required' });

    const response = await axios.post(
      'https://api.exa.ai/search',
      {
        query,
        category: 'people',
        type: 'auto',
        numResults,
      },
      {
        headers: {
          'x-api-key': process.env.EXA_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json(response.data.results);
  } catch (error) {
    res.status(500).json({ message: error.response?.data?.message || error.message });
  }
};

module.exports = { searchPeople };
