require("dotenv").config();
console.log(process.env.SECRET);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const Listing = require("./models/listing"); // Ensure the correct path
const listing = require("./models/listing");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");


const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const review = require("./models/review.js");

const reviewRouter = require("./routes/reviews.js");
const listingRouter = require("./routes/listing.js");
const userRouter = require("./routes/user.js");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// connection to Database:

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
// require('dotenv').config();
// const mongoose = require('mongoose');

const dbUrl = process.env.ATLASDB_URL;

main()
  .then(() => console.log("MongoDB connection successful"))
  .catch((err) => console.log("MongoDB connection error:", err));

async function main() {
  if (!dbUrl) {
    throw new Error("ATLASDB_URL is not defined. Check your .env file.");
  }
  await mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}


app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


const store = MongoStore.create({
  mongoUrl:dbUrl,
  crypto:{
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600
})
store.on("error", ()=>{
  console.log("Error in Mongo session Store", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
  },
};

// app.get("/", (req, res) => {
//   res.redirect("/listings");
// });


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware to pass flash messages to all views
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

///////////////////////
//   app.get("/demouser", async(req, res )=>{
//       let fakeUser = new User({
//             email: "student@gmail.com",
//             username: "ALokPrakash"
//       });
//       let registerUser = await User.register(fakeUser, "HelloWorld");
//       res.send(registerUser);
//   });

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

const PORT = process.env.PORT || 8088;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// app.listen(8088, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// // Your route
// app.post("/listings", async (req, res) => {
//       console.log("---- Incoming Request ----");
//       console.log("Headers:", req.headers);
//       console.log("Full Request Body:", req.body);
//       console.log("Extracted Listing:", req.body?.listing); // Using optional chaining
//       console.log("--------------------------");

//       res.json({ message: "Received", listing: req.body.listing });
//   });

/*
app.get("/testlisting", (req, res) =>{
let samplelisting  = new listing({
      title: "My new Villa",
      description: "By the Beach",
      price: 12000,
      location: "goa",
      country: "India",
});;
samplelisting.save();
console.log("samplelisting was saved");
res.send("successful");
});
*/
// app.use((err, req, res, next) =>{
//       let {statusCode = 500, message = "Something went wrong!"} = err;
//       res.render("error.ejs");
//       // res.status(statusCode).send(message);
// })

// validateListing
/*
const validateListing = (req, res, next) =>{
      let {error}= listingSchema.validate(req.body);
     if(error){
      let errmsg = error.details.map((el) => el.message).join(",");
      throw new ExpressError(404, errmsg);
     }else{
      next();
     }
}
// validate Review
const validateReview = (req, res, next) =>{
      let {error}= reviewSchema.validate(req.body);
     if(error){
      let errmsg = error.details.map((el) => el.message).join(",");
      throw new ExpressError(404, errmsg);
     }else{
      next();
     }
}*/
