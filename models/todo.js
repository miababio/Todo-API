module.exports = function(sequelize, DataTypes) {
    return sequelize.define('todo', {
        description: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 250] // makes description have to be a length between 1 and 250 characters
            }
        },
        completed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false // If a status isn't provided, make it false by default
        }
    });
};