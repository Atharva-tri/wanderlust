 const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "698ad4e3f683c0bbc214a9a4",
    geometry: {
      type: "Point",
      coordinates: [77.209, 28.613], // Default coordinates (Delhi)
    },
  }));
  await Listing.deleteMany({});
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();