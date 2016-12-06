var express = require("express");
var bodyParser = require("body-parser");
var _ = require("underscore");

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get("/", function (req, res) {
    res.send("Todo API Root");
});

// GET /todos?completed=true
app.get("/todos", function(req, res) {
    var queryParams = req.query;
    var filteredTodos = todos;

    if(queryParams.hasOwnProperty("completed") && queryParams.completed === 'true')
        filteredTodos = _.where(filteredTodos, {completed: true});
    else if(queryParams.hasOwnProperty("completed") && queryParams.completed === 'false')
        filteredTodos = _.where(filteredTodos, {completed: false}); 
   
    res.json(filteredTodos);
});

// GET /todos:id
app.get("/todos/:id", function(req, res) {
    var todoID = parseInt(req.params.id, 10);
    var matched = _.findWhere(todos, {id: todoID});
    matched !== undefined? res.json(matched) : res.status(404).send();
});

// POST /todos
app.post("/todos", function(req, res) {
    var body = _.pick(req.body, "description", "completed");
    
    if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0)
        return res.status(400).send(); // 400 = bad data sent
    
    // set body.desc to be trimmed value
    body.description = body.description.trim();
    
    body.id = todoNextId++;
    
    todos.push(body);
    
    res.json(body);
});

// DELETE /todos/:id
app.delete("/todos/:id", function(request, response) {
    var todoID = parseInt(request.params.id, 10);
    var matched = _.findWhere(todos, {id: todoID});
    if(matched === undefined)
        response.status(404).json({"error": "No TODO found with that ID"});
    else
    {
        var newTodos = _.without(todos, matched);
        todos = newTodos;
        response.json(matched);
    }
});

// PUT /todos/:id
app.put("/todos/:id", function(req, res) {
    var todoID = parseInt(req.params.id, 10);
    var matched = _.findWhere(todos, {id: todoID});
    var body = _.pick(req.body, "description", "completed");
    var validAttributes = {}; // items we want to add to todo
    
    if(!matched)
        return res.status(404).send(); // With send, it automatically stop below code from executing
    
    if(body.hasOwnProperty("completed") && _.isBoolean(body.completed))
        validAttributes.completed = body.completed;
    else if(body.hasOwnProperty("completed"))
    {   // entered a property, but it's bad input (not a boolean)
        return res.status(400).send();
    }
           
    if(body.hasOwnProperty("description") && _.isString(body.description) && body.description.trim().length > 0)
        validAttributes.description = body.description;
    else if(body.hasOwnProperty("description"))
    {   // entered a description, but it's bad input
        return res.status(400).send();
    }
    
    _.extend(matched, validAttributes); // matched gets changed explicitly cuz objects in Javascript are pass by reference
    res.json(matched);
});

app.listen(PORT, function() {
   console.log(`Express listening on port ${PORT}!`);
});