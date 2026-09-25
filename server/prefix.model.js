import mongoose from 'mongoose';

const prefixSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
    },
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
    },
}, { timestamps: true });

export default mongoose.model('Prefix', prefixSchema);