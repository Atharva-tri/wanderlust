const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
 


module.exports.index = async (req, res) => {
  let { category, search } = req.query;
  let allListings;
  if (category) {
    allListings = await Listing.find({ category: category });
  } else if (search) {
    allListings = await Listing.find({
      $or: [
        { location: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } },
      ],
    });
  } else {
    allListings = await Listing.find({});
  }
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested does not exist");
    return res.redirect("/listings");
  }
  console.log(listing);
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();
  
  const newListing = new Listing(req.body.listing);
  if (req.file) {
    let url = req.file.path;
    let filename = req.file.filename;
    newListing.image = { url, filename };
  }
 
  newListing.owner = req.user._id;
  
  // FORCE GEOMETRY ASSIGNMENT
  if (response.body.features && response.body.features.length > 0) {
    newListing.geometry = response.body.features[0].geometry;
  } else {
    newListing.geometry = {
      type: "Point",
      coordinates: [77.209, 28.613]
    };
  }

  console.log("Saving new listing with geometry:", newListing.geometry);
  await newListing.save();
  req.flash("success", "Successfully made a new listing!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested does not exist");
    return res.redirect("/listings");
  }
 let originalImageUrl = listing.image.url;
 originalImageUrl=originalImageUrl.replace("/upload","/upload/h_300,w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  
  // Get coordinates first if location changed
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (response.body.features && response.body.features.length > 0) {
    listing.geometry = response.body.features[0].geometry;
  }

  if (req.file) {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
  }

  await listing.save();
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted the listing!");
  console.log(deletedListing);
  res.redirect("/listings");
};
