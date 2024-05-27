const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require('express-session');


app.use('/css', express.static('css'));
app.use('/image',express.static('image'));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: true }));
mongoose
  .connect(
      "mongodb+srv://chaithanya12:1234@cluster0.ujsqv7d.mongodb.net/pet" )
  .then((x) => {
    console.log('connected to mongodb:',x.connections[0].name);
  }).catch((err)=>{
    console.log("error conecting to mongo",err);
  });

  const booking_schema = new mongoose.Schema({
    service: String,
    user:String,
    name: String,
    contact: String,
    email: String,
    breed: String,
    pet: String,
    start_date: Date,
    end_date: Date,
    review: String
  });
  
  const user_schema = new mongoose.Schema({
    username: String,
    password: String
  });

  const sign_up_schema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
  });

  const feedback_schema = new mongoose.Schema({
    username: String,
    email: String,
    number: String,
    notice: String,
  });  
  
  const booking = mongoose.model("booking", booking_schema);
  const user = mongoose.model("user", user_schema);
  const signup = mongoose.model("signup",sign_up_schema);
  const feedback = mongoose.model("feedback",feedback_schema);

  
  
  app.use(express.urlencoded({ extended: true }));
  
  app.get("/", function (req, res) {
    res.sendFile(__dirname + "/signup.html");
  });
  
  app.get("/signup",function(req,res){
    res.sendFile(__dirname + "/signup.html");
  });

  app.get("/index",function(req,res){
    res.sendFile(__dirname + "/index.html");
  });

  
  app.get("/login",function(req,res){
    if(req.session.user){
      res.redirect("/cart.html");
    }
    else{
      res.sendFile(__dirname + "/login.html");
    }
  });

  app.post("/login",(req,res)=>{
    const username=req.body.username;
    const password=req.body.password;
    console.log(username);
    signup.findOne({email:`${username}`,password:`${password}`})
      .then((usr)=>{
        if(usr){
          console.log(usr.email);
          let new_user = new user({
            username:username,
            password:password
          });
        
          new_user.save();
          req.session.user=usr.email;
          res.redirect("/index");
        }
        else{
          res.redirect("/signup");
        }
      })
      .catch((err)=>{
        console.log(err);
      });

        
        
  });
  
  app.get("/cart", function (req, res) {
    res.sendFile(__dirname + "/cart.html");
  });
  
  app.post("/cart",(req,res)=>{
    let new_booking = new booking({
      service:req.body.service,
      user:req.session.user,
      name:req.body.name,
      contact:req.body.contact,
      email:req.body.email,
      breed:req.body.breed,
      pet:req.body.pet,
      start_date:req.body.start_date,
      end_date:req.body.end_date,
      review:req.body.review
    });
  
    new_booking.save();
    res.write("<h1>booking successfull</h1>")
  });

  app.post("/signup",(req,res)=>{
    let new_signup = new signup({
      username:req.body.name,
      email:req.body.email,
      password:req.body.password,
    });
  
    new_signup.save();
        console.log("User saved successfully!");
        req.session.user=req.body.name;
        res.redirect("/login");
  });


  async function getItems(user) {
    if(user){
    const Items = await booking.find({email:user});
    return Items;}
    else{
      const Items = await booking.find({});
    return Items;
    }
  }

  async function getfeedback() {

      const Items = await feedback.find({});
    return Items;
    
  }

  app.post("/fetchDetails", function (req, res) {
    console.log("working");
    res.write("<h1> bookings of :" + req.session.user + "</h1>");
    getItems(req.session.user).then(function (FoundItems) {
      for (const ele of FoundItems) {
                  res.write("<h1>Booking </h1>");
                  res.write("<h4> id: " + ele._id + "</h4>");
                  res.write("<h4> name: " + ele.name + "</h4>");
                  res.write("<h4> pet: " + ele.pet + "</h4>");
                  res.write("<h4> service: " + ele.service + "</h4>");
                  const loc="window.location='/delete?id="+ele._id+"'";
                  res.write('<button onclick="'+loc+'">Delete booking</button>');
              }
              res.send();
            });
            
  });

  app.get("/delete",(req,res)=>{
        booking.deleteOne({_id:req.query.id})
          .then(()=>{
            console.log('deleted');
            res.send('deleted');
          })
          .catch((err)=>{
            console.log(err);
          })
    });

    app.post("/review", function (req, res) {
      console.log("working");
      res.write("<h1> review of user </h1>");
      getItems().then(function (FoundItems) {
        for (const ele of FoundItems) {
                    res.write("<h1>Review </h1>");
                    res.write("<h4> id: " + ele._id + "</h4>");
                    res.write("<h4> name: " + ele.name + "</h4>");
                    res.write("<h4> pet: " + ele.review + "</h4>");
                }
                res.send();
              });
              
    });

    app.post("/enterFeedback",function (req,res){
      var name=req.body.name;
      var email=req.body.email;
      var phno=req.body.number;
      var mess=req.body.message;
      const new_feedback=new feedback({
        username:name,
        email:email,
        number:phno,
        notice:mess
      });
      new_feedback.save();
      res.redirect("/index");
    });

    app.post("/fetchFeedback",function (req,res){
      res.write("<h1> feedback of others users </h1>");
      getfeedback().then(function (FoundItems) {
        for (const ele of FoundItems) {
                    res.write("<h1>feedback </h1>");
                    res.write("<h4> user: " + ele.username + "</h4>");
                    res.write("<h4> notice: " + ele.notice + "</h4>");
                }
                res.send();
              });
    })

  app.listen(3000, function () {
    console.log("Server is running on port:", 3000);
  });
