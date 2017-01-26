var express = require("express");
var bodyParser = require("body-parser");
var _ = require("underscore");
var db = require("./db");
var bcrypt = require("bcryptjs");

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get("/", function (req, res) {
    res.send("Todo API Root");
});

// GET /todos?completed=true&q=house
app.get("/todos", function(req, res) {
    var query = req.query;
    var where = {};
    
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
app.get("/todos/:id", function(req, res) {
    var todoID = parseInt(req.params.id, 10);
    var matched = db.todo.findById(todoID).then(function(todo) {
        todo !== null? res.json(todo) : res.status(404).send();
    }).catch(function() {
        res.status(500).send(); 
    });
});

// POST /todos
app.post("/todos", function(req, res) {
    var body = _.pick(req.body, "description", "completed");
    
    db.todo.create(body).then(function(todo) {
        res.json(todo);
    }).catch(function(e) {
        res.status(400).json(e); 
    });
});

// DELETE /todos/:id
app.delete("/todos/:id", function(request, response) {
    var todoID = parseInt(request.params.id, 10);
    db.todo.findById(todoID).then(function(todo) {
        if(todo !== null)
        {
            todo.destroy().then(function() {
                response.status(204).send(); // Everything went well and there's nothing to send back
            });
        }
        else
            response.status(404).json({error: "No todo with that ID!"});
    }).catch(function() {
        response.status(500).send(); 
    });
});

// PUT /todos/:id
app.put("/todos/:id", function(req, res) {
    var todoID = parseInt(req.params.id, 10);
    var body = _.pick(req.body, "description", "completed");
    var attributes = {}; // items we want to add to todo
    
    if(body.hasOwnProperty("completed"))
        attributes.completed = body.completed;
           
    if(body.hasOwnProperty("description"))
        attributes.description = body.description;
    
    db.todo.findById(todoID).then(function(todo) {
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
    
    db.user.authenticate(body).then(function(user) {
        res.json(user.toPublicJSON());
    }, function() {
        res.status(401).send();
    });
});

db.sequelize.sync({force: true, logging: console.log}).then(function() {
    app.listen(PORT, function() {
       console.log(`Express listening on port ${PORT}!`);
    });    
});

