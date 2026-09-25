import Prefix from './prefix.model.js';

const normalizeName = (value) => {
    if (!value && value !== 0) return '';
    return String(value).trim().toUpperCase();
};

const normalizeCode = (value) => {
    if (!value && value !== 0) return '';
    return String(value)
        .trim()
        .toUpperCase()
        .replace(/_/g, '-')
        .replace(/\s+/g, '');
};

const normalizeEntry = (entry) => {
    if (!entry || typeof entry !== 'object') {
        return null;
    }

    const name = normalizeName(entry.name ?? entry.prefixName ?? entry.prefix ?? entry.code);
    const code = normalizeCode(entry.code ?? entry.prefix ?? entry.value ?? '');

    if (!name || !code) {
        return null;
    }

    return { name, code };
};

export const getPrefix = async (req, res) => {
    try {
        const preparedData = [
            { name: 'BB Now', code: 'BB[10]' }, { name: 'PBS', code: 'PBS-[10]' }, { name: 'PBM', code: 'PBM-[10]' },
            { name: 'PBHM', code: 'PBHM-[10]' }, { name: 'PBL', code: 'PBL-[10]' }, { name: 'INSULATED', code: 'GP25-IN-IBG-C[4]' },
            { name: 'PCM PAD', code: 'PCM-BLU-SM-E[4]' }, { name: 'CRATE', code: 'BN[2]-PO01' }, { name: 'SB-IFC', code: 'SB-IFC-123456' },
            { name: 'COMP MED', code: 'CBM-[10]' }, { name: 'COMP LARGE', code: 'CBL-[10]' }, { name: 'BULK CREATE', code: 'GP25-KL-BC-(1)[4]' },
            { name: 'COMP HAZARD', code: 'CBHM-[10]' }
        ];

        await Prefix.insertMany(preparedData);
        const prefixes = await Prefix.find();

        res.status(200).json({
            success: true,
            prefixes: prefixes.map((item) => ({
                ...item.toObject(),
                name: normalizeName(item.name ?? item.prefix ?? item.code),
                code: normalizeCode(item.code ?? item.prefix ?? item.name),
            })),
        });
    } catch (error) {
        console.error('Error fetching prefixes:', error);

        res.status(500).json({
            success: false,
            message: 'Server Error: Could not fetch data.',
            error: error.message,
        });
    }
};

export const addPrefix = async (req, res) => {
    try {
        const entry = normalizeEntry(req.body);

        if (!entry) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid prefix name and code',
            });
        }

        const existing = await Prefix.findOne({
            $or: [
                { name: entry.name },
                { code: entry.code },
            ],
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'This prefix name or code already exists',
            });
        }

        const created = await Prefix.create(entry);

        return res.status(201).json({
            success: true,
            message: 'Prefix added successfully!',
            prefix: created,
        });
    } catch (error) {
        console.error('Error saving prefix:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to add prefix',
            error: error.message,
        });
    }
};

export const updatePrefix = async (req, res) => {
    try {
        const { id, newCode, newName, code, name, newPrefix, accessKey } = req.body;
        const expectedAccessKey = process.env.ACCESS_KEY || 'ATANU04@#';

        if (accessKey && String(accessKey).trim() !== expectedAccessKey) {
            return res.status(401).json({
                success: false,
                message: 'Access key is invalid.',
            });
        }

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Prefix id is required',
            });
        }

        const normalizedCode = normalizeCode(newCode ?? code ?? newPrefix ?? '');
        const normalizedName = normalizeName(newName ?? name ?? '');

        if (!normalizedCode || !normalizedName) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid prefix name and code',
            });
        }

        const duplicate = await Prefix.findOne({
            $or: [
                { code: normalizedCode },
                { name: normalizedName },
            ],
            _id: { $ne: id },
        });

        if (duplicate) {
            return res.status(409).json({
                success: false,
                message: 'This prefix name or code already exists',
            });
        }

        const updated = await Prefix.findByIdAndUpdate(
            id,
            { code: normalizedCode, name: normalizedName },
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
        const { deleteId, accessKey } = req.body;
        const expectedAccessKey = process.env.ACCESS_KEY || 'ATANU04@#';

        if (accessKey && String(accessKey).trim() !== expectedAccessKey) {
            return res.status(401).json({
                success: false,
                message: 'Access key is invalid.',
            });
        }

        const deletedPrefix = await Prefix.findByIdAndDelete(deleteId);

        if (!deletedPrefix) {
            return res.status(404).json({
                success: false,
                message: 'Prefix not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Prefix deleted successfully!',
            data: deletedPrefix,
        });
    } catch (error) {
        console.error('Error deleting prefix:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete prefix',
            error: error.message,
        });
    }
};
