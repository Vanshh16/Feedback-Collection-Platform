const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Mongoose 6+ no longer requires the extra options like useNewUrlParser
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        // Exit process with failure
        process.exit(1);
    }
};

module.exports = connectDB;