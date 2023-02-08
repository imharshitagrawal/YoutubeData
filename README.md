This is a server which invokes [Youtube Search API](https://developers.google.com/youtube/v3/docs/search/list) to fetch video data corresponding to a search query. This project also exposes 2 APIs viz.

1. GET API for retrieving the data stored in database in a paginated form
2. A Search API for querying the database.

Key pointers:

1. Youtube Search API has a daily limit of 10000 units. Each API call consumes 100 units. Hence, it is only possible to invoke the Youtube Search API 100 times a day (10000/100). Hence, it is very difficult to keep the database refreshed by repeatedly calling the API. I have taken the refresh frequency as 60 seconds.

2. When we call Youtube API, it gives `50` results at max in a single call. This means we need to use nextPageToken to make another call to retrieve next 50 results. This essentially means we need to make a number of API calls to fetch good number of results. Keeping this in mind, I have made `2 API calls` per database refresh. Hence, at any point of time, we have `100 results in our database`.

3. Database used - `PostgreSql` for the simple reason that we are not storing a huge amount of data and we need efficient querying and filtering on title and descriptions. SQL aids us.

Follow these instructions to replicate the flow:

1. Make sure Docker is installed on your system.
2. Go to https://developers.google.com/youtube/v3/getting-started and follow the instructions to create API key and enable YouTube Data API v3
3. Download this git repository and open the folder on your computer.
4. Create .env file in root of the project directory and add the following in it. Make sure to replace the API key with the key generated in above step.

   DB_USER = postgres\
   DB_HOST = postgres\
   DB_NAME = youtube\
   DB_PASSWORD = mysecretpassword\
   DB_PORT = 5432\
   PORT = 8080\
   API_KEY = your_api_key\
   SEARCH_QUERY = Football\
   DB_REFRESH_INTERVAL = 60000

5. Run `docker-compose up` command and wait for the images to build and containers to spin up. A schema with name `ytvideos` will be created in the postgres container. Once you see `Server started at port 8080`, the server will start calling Youtube API continously every 100 seconds.

6. Go to http://localhost:8080/api/v1/youtubeData?page=2&limit=10 to see the date stored in Postgres. Feel free to play with page and limit. `limit` corresponds to maximum number of results on a page.

7. Go to http://localhost:8080/api/v1/search?title=xyz&description=abc. Change the query parameters title and description to view desired results.
