const express = require("express");
      app = express();
      bodyParser = require("body-parser");
      mongoose = require('mongoose');
      methodOverride = require("method-override");
      expressSanitizer = require("express-sanitizer");

//APP CONFIG
mongoose.connect('mongodb://localhost:27017/restful_blog', {useNewUrlParser: true});
mongoose.set('useFindAndModify', false);
app.set("view engine", "ejs"); //so rendered pages do not need .ejs to be specified
app.use(express.static("public")); //middleware to serve static pages (.html/.css/.js) from root "public"
app.use(bodyParser.urlencoded({extended: true})); //to parse the JSON data
app.use(expressSanitizer());
app.use(methodOverride("_method")); //treats method as PUT or DELETE request instead of POST

//MONGOOSE MODEL CONFIG
var blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  body: String,
  created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

//CREATE SAMPLE DATA
// Blog.create({
//   title: "Test blog",
//   image: "https://images.unsplash.com/photo-1562569633-622303bafef5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=668&q=80",
//   body: "This is a test blog post"
// });

// RESTFUL ROUTES
app.get("/", function(req, res){
  res.redirect("/blogs");
});

//INDEX ROUTE
app.get("/blogs", function(req, res){
  Blog.find({}, function(err, blogs){
    if(err){
      console.log("error");
    } else {
      res.render("index", {blogs: blogs});
    }
  });
});

//NEW ROUTE
app.get("/blogs/new", function(req, res){
    res.render("new");
});

//CREATE ROUTE
app.post("/blogs", function(req, res){
  //to sanitize blog[body] from new.ejs
  req.body.blog.body = req.sanitize(req.body.blog.body);
  // create blog
  Blog.create(req.body.blog, function(err, newBlog){
    if (err) {
      res.render("new");
      console.log(err);
    }else {
      res.redirect("/blogs");
    }
  });
});

// SHOW ROUTE
app.get("/blogs/:id", function(req, res){
  // Blog.findById(id, callback)
  Blog.findById(req.params.id, function(err, foundBlog){
    if (err) {
      res.redirect("/blogs");
      console.log(err);
    } else {
      res.render("show", {blog: foundBlog});
    }
  });
});

// EDIT ROUTE
//get form to update
app.get("/blogs/:id/edit", function(req, res){
  // Blog.findById(id, callback)
  Blog.findById(req.params.id, function(err, foundBlog){
    if (err) {
      res.redirect("/blogs");
      console.log(err);
    } else {
      res.render("edit", {blog: foundBlog});
    }
  });
});

// UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
  //middleware to sanitize blog[body] from new.ejs
  req.body.blog.body = req.sanitize(req.body.blog.body);
  // Blog.findByIdAndUpdate(id, new data, callback)
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
    if (err) {
      res.redirect("/blogs");
      console.log(err);
    } else {
      res.redirect("/blogs/" + req.params.id);
    }
  });
});

//DELETE ROUTE
app.delete("/blogs/:id", function(req, res){
  // Blog.findByIdAndRemove(id, callback)
  Blog.findByIdAndRemove(req.params.id, function(err){
    if (err) {
      res.redirect("/blogs");
      console.log(err);
    } else {
      res.redirect("/blogs");
    }
  });

});

app.listen(3000, function(){
  console.log("serving RESTfulBlog to port 3000");
});
