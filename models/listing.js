const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Review=require("./review.js");
const listingSchema=new Schema({
    title: {
          type:String,
          require:true    
        },
    description: String,
    image: {
        url: {
          type: String,
          default:
            "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
        },
        filename: String,
    },
    price:Number,
    location:String,
    country :String,
    category: {
      type: String,
      enum: ["Trending","Rooms","Iconic Citys","Iconic Cities","Mountian","Mountains","Castle","Castles", "Amezing Pools","Amazing Pools","Camping","Farms","Actic","Arctic","Domes","Boats"],
      required: true
    },
      reviews: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Review"
        }
      ],
      owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      geometry:{
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  }
});


listingSchema.post("findOneAndDelete", async (listening) => {
  if (listening) {
    await Review.deleteMany({ _id: { $in: listening.reviews } });
  }
});

const Listing=mongoose.model("Listing",listingSchema);

module.exports=Listing;