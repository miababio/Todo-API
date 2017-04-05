var _ = require("underscore");
var bcrypt = require("bcryptjs");
var cryptojs = require("crypto-js");
var jwt = require("jsonwebtoken");

module.exports = function(sequelize, DataTypes) {
    var user = sequelize.define('user', {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        salt: {
          type: DataTypes.STRING  
        },
        password_hash: {
            type: DataTypes.STRING
        },
        password: {
            type: DataTypes.VIRTUAL,
            allowNull: false,
            validate: {
                len: [7, 100] // password is 7-100 characters
            },
            set: function(value) {
                var salt = bcrypt.genSaltSync(10); // # salt rounds
                var hashedPassword = bcrypt.hashSync(value, salt); // value you want hashed, salt to add to hash
                
                this.setDataValue("password", value);
                this.setDataValue("salt", salt);
                this.setDataValue("password_hash", hashedPassword);
            }
        }
    },  {
        hooks: {
            beforeValidate: function(user, options) {
                if(typeof user.email === "string")
                    user.email = user.email.toLowerCase();
            }
        },
        classMethods: {
            authenticate: function(body) {
                return new Promise(function (resolve, reject) {
                    var where = {email: body.email};
                    
                    if(typeof body.email !==  "string" || typeof body.password !== "string")
                        return reject();

                    user.findOne({where: where}).then(function(user) {
                        if(!user || !bcrypt.compareSync(body.password, user.get("password_hash")))
                            return reject();
                        resolve(user);
                    }, function(e) {
                        reject();
                    });
                });
            }
        },
        instanceMethods: {
            toPublicJSON: function() {
                var json = this.toJSON();
                return _.pick(json, "id", "email", "updatedAt", "createdAt");
            },
            generateToken: function(type) {
                // create a new, encrypted token that gets returned back to the user
                if(!_.isString(type))
                    return undefined;
                try
                {
                    // takes user's id and type, and turns in into a JSON string
                    var stringData = JSON.stringify({id: this.get("id"), type: type}); 
                    //take user's id and token type, and encrypt both
                    var encryptedData = cryptojs.AES.encrypt(stringData, "abc123!!").toString();
                    var token = jwt.sign({
                        token: encryptedData
                    }, "qwerty123");
                    return token;
                }
                catch(e)
                {
                    console.error(e);
                    return undefined; // no valid token generated
                }
            }
        }
    }, {
        validate: {
            emailIsString: function() {
                if(!_.isString(this.email))
                    throw new Error("Email must be a string.")
            },
            passwordIsString: function() {
                if(!_.isString(this.password))
                    throw new Error("Password must be a string.")
            }
        }       
    });
    
    return user;
};