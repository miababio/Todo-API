module.exports = function(db) { 
    return {
        requireAuthentication: function(req, res, next) {
            var token = req.get("Auth"); // Get out token
            db.user.findByToken(token).then(function (user) { // Find a user by the token (custom method we made)
                // Add a user to the request object; Let's us access user inside of each individual request
                req.user = user;
                next();
            }, function() {
               res.status(401).send(); 
            }); 
        }    
    };
};