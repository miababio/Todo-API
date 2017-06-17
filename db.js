var Sequelize = require("sequelize");
var env = process.env.NODE_ENV || "development";
var sequelize;

if(env === "production") // only true when running on heroku
{
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: "postgres"
    });
}
else
{
    sequelize = new Sequelize(undefined, undefined, undefined, {
    "dialect": "sqlite",
    "storage": __dirname + "/data/dev-todo-api.sqlite"
    });
}


var db = {};

db.todo = sequelize.import(__dirname + "/models/todo.js"); //import todo model (todo.js)
db.user = sequelize.import(__dirname + "/models/user.js");
db.token = sequelize.import(__dirname + "/models/token.js");
db.sequelize = sequelize; //create sequelize object
db.Sequelize = Sequelize;

db.todo.belongsTo(db.user);
db.user.hasMany(db.todo);

module.exports = db; //can return multiple things using an object