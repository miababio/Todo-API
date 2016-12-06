////Object Example
//var person = {
//    name: "Mike",
//    age: 21
//};
//
//function updatePerson(obj) {
//    obj.age = 23;
//}
//
//updatePerson(person);
//console.log(person);

// Array Example
var grades = [15, 37];

function addGrades(gradesArr)
{
    //gradesArr = [15, 37, 99];
    gradesArr.push(99);
    debugger;
}

addGrades(grades);
console.log(grades);