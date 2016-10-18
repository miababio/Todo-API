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

app.listen(PORT, function() {
   console.log(`Express listening on port ${PORT}!`);
});