import mongoose from "mongoose";

const prefix = new mongoose.Schema({
    prefix: {
        type: String,
        required: true,
        unique: true
    }
}, { timestamps: true });

export default mongoose.model('Prefix', prefix);