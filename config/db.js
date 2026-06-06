import mongoose from 'mongoose';

const dbConnection = async () => {
  try {
    let db = await mongoose.connect(process.env.CONNECTION_STR);
    console.log('DB connected');

    return db;
  } catch (error) {
    console.log('ERROR in db connection ', error);
  }
}

export default dbConnection;