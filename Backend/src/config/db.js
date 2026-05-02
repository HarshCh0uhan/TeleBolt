import mongoose  from "mongoose";

const connectDB = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Database Connection Established !!!");
}

export default connectDB