var _ = require("underscore");

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('user', {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [7, 100] // password is 7-100 characters
            }
        }
    },  {
        hooks: {
            beforeValidate: function(user, options) {
                if(typeof user.email === "string")
                    user.email = user.email.toLowerCase();
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
};