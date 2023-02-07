require('dotenv').config()

const express = require('express');
const { google } = require('googleapis');

const pool = require("./dbConnection");
const queries = require("./src/queries");
const getDataRoutes = require('./src/getDataRoutes');
const searchDataRoutes = require('./src/searchDataRoutes');

const app = express();
const PORT = process.env.PORT || 8080;
const searchQuery = process.env.SEARCH_QUERY || "Football";
const dbRefreshInterval = process.env.DB_REFRESH_INTERVAL || 60000;  // We are refreshing database every 60 seconds

const youtube = google.youtube({
    version: "v3",
    auth: process.env.API_KEY,
});

async function refreshDataBase() {
    try {
        let iterations = 2; // We are invoking youtube api 2 times (1 invocation gives maximum 50 results hence we use nextPageToken to retrieve 100 results in total)
        let nextPageToken = undefined;
        const videos = []
        do {
            const response = await youtube.search.list({
                type: "video",
                order: "date",
                publishedAfter: "2010-01-01T00:00:00Z",
                part: "snippet",
                maxResults: "50",
                pageToken: nextPageToken,
                q: searchQuery,
            });
            console.log(response.data.pageInfo);
            nextPageToken = response.data.nextPageToken;
            videos.push(...response.data.items);
        } while(--iterations);

        console.log(`Retrieved ${videos.length} videos from Youtube API`);
        await pool.query(queries.deleteData);
        console.log("Delete data from database successful !!");
        videos.forEach(video => {
            pool.query(queries.insertData, [video.snippet.title, video.snippet.description, new Date(video.snippet.publishedAt), video.snippet.thumbnails.medium.url]);
        });
        console.log("Refreshed database !");
        console.log('Wait for 60 seconds...');

    } catch(err) {
        console.log(err);
        throw err;
    }
}
refreshDataBase();
setInterval(refreshDataBase, dbRefreshInterval);


app.get("/", async (req, res) => {
    const message = "Welcome to this server. Please use the following APIs : \n 1. GET API to retrieve data stored in database. \n 2. Search API to query database based on query.";
    res.send(message);
});

app.use("/api/v1/youtubeData", getDataRoutes);  // API for retrieving data stores in database
app.use("/api/v1/search", searchDataRoutes);  // API for searching data based on query

app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
});
