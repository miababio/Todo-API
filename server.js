var express = require("express");
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [{
    id: 1,
    description: "Meet dad for lunch",
    completed: false
}, {
    id: 2,
    description: "Go to the store",
    completed: false
}, {
    id: 3,
    description: "Finish this video",
    completed: true
}];

app.get("/", function (req, res) {
    res.send("Todo API Root");
});

// GET /todos
app.get("/todos", function(req, res) {
    res.json(todos);
});

// GET /todos:id
app.get("/todos/:id", function(req, res) {
    var todoID = parseInt(req.params.id, 10);
    // iterate over todos array, find the match
    //if do, send res.json with match
    var matched = null;
    for(var i = 0; i < todos.length; i++)
    {
        if(todos[i].id === todoID)
            matched = todos[i];
    }
    matched !== null? res.json(matched) : res.status(404).send();
});

app.listen(PORT, function() {
   console.log(`Express listening on port ${PORT}!`);
});