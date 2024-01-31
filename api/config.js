const config = {
    db: {
        /* don't expose password or any sensitive info, done only for demo */
        host: "10.8.0.1",
        user: "react",
        password: "password",
        database: "uodLibraryOccupancy",
        port: 3307,
        connectTimeout: 60000
    },
    listPerPage: 10,
};
module.exports = config;