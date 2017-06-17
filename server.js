var express = require("express");
var bodyParser = require("body-parser");
var _ = require("underscore");
var db = require("./db");
var bcrypt = require("bcryptjs");
var middleware = require("./middleware")(db);

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get("/", function (req, res) {
    res.send("Todo API Root");
});

// GET /todos?completed=true&q=house
app.get("/todos", middleware.requireAuthentication, function(req, res) {
    var query = req.query;
    var where = {userId: req.user.get('id')};
    
    if(query.hasOwnProperty("completed") && query.completed === 'true')
        where.completed = true;
    else if(query.hasOwnProperty("completed") && query.completed === 'false')
        where.completed = false;
    if(query.hasOwnProperty("q") && query.q.length > 0)
        where.description = {$like: "%" + query.q + "%"};
    db.todo.findAll({where: where}).then(function(todos) {
        res.json(todos);
    }).catch(function(e) {
        res.status(500).send();
    });
});

// GET /todos:id
app.get("/todos/:id", middleware.requireAuthentication, function(req, res) {
    var todoID = parseInt(req.params.id, 10);
    var matched = db.todo.findOne({
        where: {
            id: todoID,
            userId: req.user.get("id")
        }
    }).then(function(todo) { //findOne, then check if user id = id, and todo id = id
        todo !== null? res.json(todo) : res.status(404).send();
    }).catch(function() {
        res.status(500).send(); 
    });
});

// POST /todos
app.post("/todos", middleware.requireAuthentication, function(req, res) {
    var body = _.pick(req.body, "description", "completed");
    
    db.todo.create(body).then(function(todo) {
        req.user.addTodo(todo).then(function() {
           return todo.reload();    // We reload because the todo above is different than the one in the database
        }).then(function (todo) {   // This is the updated todo
           res.json(todo.toJSON());          // Then we do as before
        });
    }, function(e) {
        res.status(400).json(e); 
    });
});

// DELETE /todos/:id
app.delete("/todos/:id", middleware.requireAuthentication, function(request, response) {
    var todoID = parseInt(request.params.id, 10);
    db.todo.destroy({
        where: {
            id: todoID,
            userId: request.user.get("id")
        }
    }).then(function(rowsDeleted) {
        if(rowsDeleted !== 0)
            response.status(204).send(); // Everything went well and there's nothing to send back
        else
            response.status(404).json({error: "No todo with that ID!"});
    }).catch(function() {
        response.status(500).send(); 
    });
});

// PUT /todos/:id
app.put("/todos/:id", middleware.requireAuthentication, function(req, res) {
    var todoID = parseInt(req.params.id, 10);
    var body = _.pick(req.body, "description", "completed");
    var attributes = {}; // items we want to add to todo
    
    if(body.hasOwnProperty("completed"))
        attributes.completed = body.completed;
           
    if(body.hasOwnProperty("description"))
        attributes.description = body.description;
    
    db.todo.findOne({
        where: {
            id: todoID,
            userId: req.user.get("id")
        }
    }).then(function(todo) { //same as get todos/:id
        if(todo)
        {
            todo.update(attributes).then(function(todo) { // update was successful
                res.json(todo.toJSON());
            }, function(e) {      // update failed
                res.status(400).json(e);
            });
        }
        else
            res.status(404).send();
    }, function() {
        res.status(500).send();
    });
});

// POST /users
app.post("/users", function(req, res) {
    var body = _.pick(req.body, "email", "password");
    
    db.user.create(body).then(function(user) {
        res.json(user.toPublicJSON());
    }).catch(function(e) {
        res.status(400).json(e); 
    });
});

// POST /users/login
app.post("/users/login", function(req, res) {
    var body = _.pick(req.body, "email", "password");
    var userInstance;
    
    db.user.authenticate(body).then(function(user) {
        var token = user.generateToken("authentication");
        userInstance = user;
        return db.token.create({
            token: token // though the token is saved here, the HASH is what gets made and put in the database
        });
    }).then(function(tokenInstance){
        res.header("Auth", tokenInstance.get('token')).json(userInstance.toPublicJSON());
    }).catch(function(e) {
        console.log("e", e);
        res.status(401).send();
    });
});

// DELETE /users/login
app.delete("/users/login", middleware.requireAuthentication, function(req, res) {
    req.token.destroy().then(function() {
        res.status(204).send();
    }).catch(function() {
        res.status(500).send();
    });
});

db.sequelize.sync({logging: console.log, force: true}).then(function() {
    app.listen(PORT, function() {
       console.log(`Express listening on port ${PORT}!`);
    });    
});

