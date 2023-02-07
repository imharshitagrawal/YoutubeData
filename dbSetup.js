const pool = require("./dbConnection");
const queries = require("./src/queries");

const executeQuery = (query) => {
    pool.query(query)
    .then((res) => {
        console.log(res);
        
    })
    .catch((err) => {
        console.log(err);
    });
};

(async () => {
    await executeQuery(queries.createTable);
})();
