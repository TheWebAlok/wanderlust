const mongoose = require("mongoose");
const initData = require("./data.js");
const listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
main()
  .then(() => {
    console.log("connection successful");
  })
  .catch((err) => console.log(err));
async function main() {
  await mongoose.connect(MONGO_URL);
}
const initDB = async () => {
      try {
        await listing.deleteMany({});
        initData.data = initData.data.map((obj) =>({...obj, owner:"67d5108a76bddddb5eb73846" 
        }));
        await listing.insertMany(initData.data);
        console.log("Data initialized successfully.");
      } catch (error) {
        console.error("Error initializing data:", error);
      }
    };
    
    initDB();