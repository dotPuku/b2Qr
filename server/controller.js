import Prefix from "./prefix.model.js";
import { ObjectId } from 'mongodb';

const normalizePrefix = (value) => {
    if (!value && value !== 0) return '';
    return String(value)
        .trim()
        .toUpperCase()
        .replace(/_/g, '-')
        .replace(/\s+/g, '');
};

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
        const prefixList = Array.isArray(prefix)
            ? prefix
            : String(prefix || '')
                .split(',')
                .map((item) => normalizePrefix(item));

        const cleanedList = [...new Set(
            prefixList
                .map((item) => normalizePrefix(item))
                .filter(Boolean)
        )];

        if (!cleanedList.length) {
            return res.status(400).json({
                success: false,
                message: 'Please provide at least one valid prefix',
            });
        }

        const existing = await Prefix.find({ prefix: { $in: cleanedList } });
        const existingSet = new Set(existing.map((item) => item.prefix));
        const newValues = cleanedList.filter((item) => !existingSet.has(item));

        if (!newValues.length) {
            return res.status(409).json({
                success: false,
                message: 'All prefixes already exist',
            });
        }

        const created = await Prefix.insertMany(
            newValues.map((value) => ({ prefix: value }))
        );

        return res.status(201).json({
            success: true,
            message: created.length > 1 ? 'Prefixes added successfully!' : 'Prefix Added successfully!',
            prefixes: created,
            prefix: created[0],
        });
    } catch (error) {
        console.error('Error saving prefix:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to add prefix',
            error: error.message
        });
    }
};

export const updatePrefix = async (req, res) => {
    try {
        const { id, newPrefix } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Prefix id is required',
            });
        }

        const normalized = normalizePrefix(newPrefix);

        if (!normalized) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid prefix value',
            });
        }

        const duplicate = await Prefix.findOne({
            prefix: normalized,
            _id: { $ne: id },
        });

        if (duplicate) {
            return res.status(409).json({
                success: false,
                message: 'This prefix already exists',
            });
        }

        const updated = await Prefix.findByIdAndUpdate(
            id,
            { prefix: normalized },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Prefix not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Prefix updated successfully!',
            prefix: updated,
        });
    } catch (error) {
        console.error('Error updating prefix:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update prefix',
            error: error.message,
        });
    }
};

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
};
