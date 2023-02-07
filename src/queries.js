const createTable = `CREATE TABLE IF NOT EXISTS ytvideos
    (title VARCHAR(255), 
    description VARCHAR(255),
    publishDateTime TIMESTAMPTZ,
    thumbnailUrl VARCHAR(255))`;

const insertData = "INSERT INTO ytvideos (title, description, publishDateTime, thumbnailUrl) VALUES ($1, $2, $3, $4)";
const deleteData = "DELETE FROM ytvideos";
const getVideos = "SELECT * FROM ytvideos ORDER BY publishDateTime DESC";
const searchVideos = "SELECT * FROM ytvideos WHERE title ~* ($1) OR description ~* ($2) ORDER BY publishDateTime DESC";

module.exports = { createTable, insertData, deleteData, getVideos, searchVideos };
