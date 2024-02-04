const config = {
    db: {
        /* don't expose password or any sensitive info, done only for demo */
        host: "mysql",
        user: "api_user",
        password: "password",
        database: "uodLibraryOccupancy",
        port: 3306,
        connectTimeout: 60000
    },
    listPerPage: 10,
};
module.exports = config;