const config = {
    db: {
        host: "mysql",
        user: "api_user",
        // password not secure, must be changed for prod 
        password: "password",
        database: "uodLibraryOccupancy",
        port: 3306,
        connectTimeout: 60000
    },
    listPerPage: 10,
};
module.exports = config;
