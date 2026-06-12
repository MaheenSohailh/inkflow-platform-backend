import express from 'express';
import 'dotenv/config';
import dbConnection from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import cors from "cors";
import blogRouter from './routes/blogRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import stripeRouter from './routes/stripeRoutes.js';
import cookieParser from 'cookie-parser';

const app = express();

dbConnection();

// Middleware
app.use(express.json());
app.use(cookieParser());

// DYNAMIC CORS CONFIGURATION
const allowedOrigins = [
  "http://localhost:5173", 
  "https://inkflow-platform-frontend.vercel.app", // Yahan apna final URL daal dein
  "https://inkflow-platform-frontend-git-main-username.vercel.app" // Vercel preview URL bhi add kar sakte hain
];

app.use(cors({
  origin: function (origin, callback) {
    // Postman ya bina origin wale requests ko allow karne ke liye !origin check karein
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRouter);
app.use('/api/admin', adminRouter);
app.use('/api', stripeRouter);

app.get('/', (req, res) => {
    res.send("Backend Deployed Successfully");
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}
export default app; // Vercel ke liye export zaroori hai
