const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
  const alllistings = await Listing.find({});
  res.render("listings/index", { alllistings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  try {
    // 🛑 Step 2: Listing ढूंढें और `populate()` करें

    const listing = await Listing.findById(id)
      .populate({ path: "reviews", populate: { path: "author" } })
      .populate("owner");

    if (!listing) {
      req.flash("error", "Listing you requested for does not exist");
      //   return res.status(404).send("Listing not found");
      return res.redirect("/listings");
    }
    // console.log("listing Data", listing);
    // console.log("Owner Data", listing.owner);
    res.render("listings/show.ejs", { listing });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

module.exports.createListing = async (req, res, next) => {
  let url = req.file.path;
  let filename = req.file.filename;

  const newlisting = new Listing(req.body.listing);
  // console.log(req.user);
  newlisting.owner = req.user._id;
  newlisting.image = { url, filename };
  await newlisting.save();

  req.flash("success", "New Listing created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist");

    //   return res.status(404).send("Listing not found");

    res.redirect("/listings");
  }

  // console.log("Editing Listing Image URL:", listing.image); // Debugging
  let originalImageUrl = listing.image.url;
  originalImageUrl= originalImageUrl.replace("/uploads", "/uploads/h_300, w_250");
  res.render("listings/edit.ejs", { listing , originalImageUrl});
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  // let listing = await Listing.findById(id)*/
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  req.flash("success", "Listing Updated");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing deleted");

  res.redirect("/listings");
};
