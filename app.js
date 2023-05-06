const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash"); 


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://shashi:i0uiSUrRNa62puTo@cluster0.gj7khj8.mongodb.net/todolistDB");

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to the Todo-List!"
}) 
const item2 = new Item({
  name: "Click the + button to add a new item."
}) 
const item3 = new Item({
  name: "<-- Hit this to delete an item."
}) 

const defaultItems = [item1, item2, item3];


const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res){
  Item.find()
.then(function(items) {
  if(items.length === 0){
    Item.insertMany(defaultItems)
.then(function(){
console.log("Items inserted successfully");
})
.catch(function(err){
console.log(err);
});
res.redirect("/");
}
else{
  res.render("list", {listTitle: "Today", newListItems: items});
}

})
.catch(function(err){
  console.log(err);
  });
});


app.get("/:customListName", function(req, res) {
const customListName = _.capitalize(req.params.customListName);

List.findOne({name: customListName})
  .then(function(lists){
      if(!lists){
        //Create anew list
// console.log("List not found");
  const list = new List({
  name: customListName,
  items: defaultItems,
  });
  list.save();
  res.redirect("/" + customListName);
  }
else{
  //Show an existing list
    // console.log("List found successfully");
    res.render("list", {listTitle: lists.name, newListItems: lists.items});
  }
})
  .catch(function(err){
  console.log(err);
  });


});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName})
    .then(function(list){
      list.items.push(item);
      list.save();
      res.redirect("/" + listName);
    })
    .catch(function(err){
      console.log(err);
    });
  }

});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId).exec();
    console.log("Sucessfully deleted checked item.");
    res.redirect("/");
  }



else{
  List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}})
  .then(function(list){
      res.redirect("/"+ listName);
  })
  .catch(function(err){
    console.log(err);
  });
}
});


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});


