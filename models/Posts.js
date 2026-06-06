import mongoose from "mongoose";

const blogSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  image: {
    type: String
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  public_id: {
    type: String
  },
  isBlocked: {
    type: Boolean,
    required: true,
    default: false
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  //  Paid blogs ke liye price add karna zaroori hai jo Stripe me use hogi
  price: {
    type: Number,
    required: function() { return this.isPaid; }, // Agar isPaid true ho to price required ho jaye
    default: 0
  },
  //   Un users ki list jinhone Stripe ke zariye payment kar di hai
  purchasedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    }
  ]
}, {
  timestamps: true  
});

const Blog = mongoose.model('blog', blogSchema);

export default Blog;