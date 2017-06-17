var cryptojs = require("crypto-js");

module.exports = function(db) { 
    return {
        requireAuthentication: function(req, res, next) {
            var token = req.get("Auth") || "";
            
            db.token.findOne({ // find token in the database that user provided
                where: {
                    tokenHash: cryptojs.MD5(token).toString()
                }
            }).then(function(tokenInstance) {
                if(!tokenInstance) // If there is no token
                    throw new Error();
                // save token to request object
                req.token = tokenInstance;
                return db.user.findByToken(token);
            }).then(function(user) {
                req.user = user; // set user object to request object
                next();
            }).catch(function() {
                res.status(401).send();
            });
        }    
    };
};