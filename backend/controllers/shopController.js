const pool = require('../config/db');

// 1. Get Groups
exports.getSchoolGroups = async (req, res) => {
    try {
        const { schoolId } = req.params;

        const query = `
            SELECT id, name, sort_order 
            FROM grade_groups 
            WHERE school_id = $1 
            ORDER BY sort_order ASC
        `;
        
        const { rows } = await pool.query(query, [schoolId]);
        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
};

// 2. Get Catalog
exports.getGroupCatalog = async (req, res) => {
    try {
        const { group_id, gender } = req.query;

        if (!group_id || !gender) {
            return res.status(400).json({ error: 'Missing group_id or gender' });
        }

        const query = `
            SELECT 
                p.id, 
                p.name, 
                p.price, 
                p.image_url, 
                req.is_mandatory,
                req.gender as specific_gender
            FROM products p
            JOIN school_requirements req ON p.id = req.product_id
            WHERE req.grade_group_id = $1 
            AND (req.gender = $2 OR req.gender = 'Unisex') -- The "Smart" Gender Logic
            ORDER BY req.is_mandatory DESC, p.name ASC;
        `;

        const { rows } = await pool.query(query, [group_id, gender]);
        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
};