var Sequelize = require("sequelize");
var sequelize = new Sequelize(undefined, undefined, undefined, {
    "dialect": "sqlite",
    "storage": __dirname + "/basic-sqlite-database.sqlite"
});

var Todo = sequelize.define('todo', {
    description: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            len: [1, 250] // makes description have to be a length between 1 and 250 characters
        }
    },
    completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false // If a status isn't provided, make it false by default
    }
});

var User = sequelize.define("user", {
    email: Sequelize.STRING // shorthand for email: {type: Sequelize.STRING}
});

Todo.belongsTo(User); // User = model that the todo belongs to
User.hasMany(Todo);

sequelize.sync({/*force: true, */logging: console.log}).then(function() {
    console.log("Everything is synced");
    
    User.findById(1).then(function(user) {
        user.getTodos({where: {completed: false}}).then(function (todos) {
            todos.forEach(function (todo) {
                console.log(todo.toJSON());
            });
        });
    });
    
    /*User.create({
        email: "michael@example.com"
    }).then(function() {
        return Todo.create({
            description: "Clean yard"
        });
    }).then(function (todo) {
        User.findById(1).then(function (user) {
            user.addTodo(todo);
        });
    });*/
});