const pool = require('../dbConnection');
const queries = require('./queries');

//Handles GET API request to retrieve all videos in a paginated way
const getVideos = async (req, res) => {
    try {
        const results = {}
        const databaseVideos = [];

        // Querying database
        const videos = await pool.query(queries.getVideos);
        databaseVideos.push(...videos.rows);

        
        // Pagination
        const page = parseInt(req.query.page) || 1;  // Default page 1
        const limit = parseInt(req.query.limit) || 10;  // Default limit 10
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        if(endIndex < databaseVideos.length) {
            results.next = {
                page: page + 1,
                limit: limit
            }
        }
        if(startIndex > 0) {
            results.previous = {
                page: page - 1,
                limit: limit
            }
        }
        results.results = databaseVideos.slice(startIndex, endIndex);

        res.status(200).json(results);

    } catch(error) {
        console.log(err);
        res.status(500).json({error: true, message: "Internal Server Error"});
    }
};

// Handles search API to query based on input title and/or description
const searchVideos = async (req, res) => {
    try {
        const results = {}

        let title = req.query.title;
        let description = req.query.description;
        
        // If there is no input for a field, we need not consider it
        if(!title)
        title = '$-';  // this regex ensures no matches
        if(!description)
        description = '$-';

        /* 
        Optimising search api. Idea is to tokenize the input string into words and query database for all words
        Forming a regex like 'manchester|united|destroyed' from title (manchester united destroyed) input by user
        */
        const titleTokens = title.split(" ");
        let titles = '';
        titleTokens.forEach(token => {
            titles = titles + token + '|';
        });
        titles = titles.slice(0, -1);
                
        const descriptionTokens = description.split(" ");
        let descriptions = '';
        descriptionTokens.forEach(description => {
            descriptions = descriptions + description + '|';
        });
        descriptions = descriptions.slice(0, -1);

        // Querying the database
        const dbResponse = await pool.query(queries.searchVideos, [titles, descriptions]);
        const videos = dbResponse.rows;

        // Forming javascript object
        results.count = videos.length;
        results.results = videos

        res.status(200).json(results);

    } catch(error) {
        console.log(error);
        res.status(500).json({error: true, message: "Internal Server Error"});
    }
}

module.exports = {
    getVideos,
    searchVideos,
}
