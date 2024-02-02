const { validationResult } = require('express-validator');

function emptyOrRows(rows) {
    if (!rows) {
        return [];
    }
    return rows;
}

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};


module.exports = {
    emptyOrRows,
    validate
}