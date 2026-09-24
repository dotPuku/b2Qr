import Prefix from "./prefix.model.js";
import { ObjectId } from 'mongodb';

export const getPrefix = async (req, res) => {
    try {
        const prefixes = await Prefix.find();

        res.status(200).json({
            success: true,
            prefixes
        });
    } catch (error) {
        console.error("Error fetching prefixes:", error);

        res.status(500).json({
            success: false,
            message: "Server Error: Could not fetch data.",
            error: error.message
        });
    }
};

export const addPrefix = async (req, res) => {
    try {
        const { prefix } = req.body;

        const newPrefix = new Prefix({ prefix });

        const savedPrefix = await newPrefix.save();

        res.status(201).json({
            success: true,
            message: 'Prefix Added successfully!',
            prefix: savedPrefix
        });

    } catch (error) {
        console.error('Error saving prefix:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to add prefix',
            error: error.message
        });
    }
}

export const deletePrefix = async (req, res) => {
    try {
        const { deleteId } = req.body;

        const deletedPrefix = await Prefix.findByIdAndDelete(deleteId);

        if (!deletedPrefix) {
            return res.status(404).json({
                success: false,
                message: 'Prefix not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Prefix deleted successfully!',
            data: deletedPrefix
        });
    } catch (error) {
        console.error('Error deleting prefix:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete prefix',
            error: error.message
        });
    }
}
