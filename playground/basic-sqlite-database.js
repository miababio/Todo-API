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

sequelize.sync({/*force: true,*/ logging: console.log}).then(function() {
    console.log("Everything is synced");
    
    Todo.findById(3).then(function(todo) {
        console.log(todo? todo.toJSON() : "No todo found!");
    });
    
    /*Todo.create({
        description: "Take out trash"
    }).then(function(todo) {
        return Todo.create({
            description: "Clean room"
        });
    }).then(function () {
        // return Todo.findById(1);
        return Todo.findAll({
            where: {
                description: {
                    $like: "%Room%"
                }
            }
        });
    }).then(function(todos) {
        if(todos)
        {
            todos.forEach(function (todo) {
                console.log(todo.toJSON());
            });
        }
        else
            console.log("No todo found!");
    }).catch(function (e) {
        console.log(e);
    });*/
});