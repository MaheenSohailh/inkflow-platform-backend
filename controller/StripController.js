import Stripe from 'stripe';
import Blog from '../models/Posts.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const checkoutSession = async (req, res) => {
    try {
        const { blogId, userId } = req.body;

        // get blog details to verify price
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        // create session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: blog.title,
                            description: "Premium Blog Access",
                        },
                        unit_amount: blog.price * 100, //$1 = 100 cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            //  redirect URL's
            success_url: `${process.env.FRONTEND_URL}/payment-success?blogId=${blogId}&userId=${userId}`,
            cancel_url: `${process.env.FRONTEND_URL}/blogs`,
        });
        // send session URL to frontend 
        res.json({ url: session.url });

    } catch (error) {
        console.error("Stripe Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

//  add user in list 
export const webHook = async (req, res) => {
    try {
        const { blogId, userId } = req.body;


        await Blog.findByIdAndUpdate(blogId, {
            $addToSet: { purchasedBy: userId }
        });

        res.status(200).json({ success: true, message: "Blog unlocked successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error unlocking blog" });
    }
}