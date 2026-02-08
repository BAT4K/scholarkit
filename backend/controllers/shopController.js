const pool = require('../config/db');

// 1. Get Groups (FIXED: Returns Universal Grades for ALL schools)
exports.getSchoolGroups = async (req, res) => {
    try {
        // We do NOT filter by schoolId anymore.
        // This ensures every school sees "Foundation", "Primary", "Senior".
        const query = `
            SELECT id, name, sort_order 
            FROM grade_groups 
            ORDER BY sort_order ASC
        `;
        
        const { rows } = await pool.query(query);
        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
};

// 2. Get Catalog (Kept same - filters products by school correctly)
exports.getGroupCatalog = async (req, res) => {
    try {
        // Extract school_id from query
        const { group_id, gender, school_id } = req.query;

        if (!group_id || !gender) {
            return res.status(400).json({ error: 'Missing group_id or gender' });
        }

        // Base Query
        let query = `
            SELECT 
                p.id, 
                p.name, 
                p.price, 
                p.image_url, 
                req.is_mandatory,
                req.gender as specific_gender,
                p.school_id
            FROM products p
            JOIN school_requirements req ON p.id = req.product_id
            WHERE req.grade_group_id = $1 
            AND (req.gender = $2 OR req.gender = 'Unisex')
        `;

        const queryParams = [group_id, gender];

        // Filter by School ID if provided
        if (school_id) {
            query += ` AND p.school_id = $3`;
            queryParams.push(school_id);
        }

        query += ` ORDER BY req.is_mandatory DESC, p.name ASC;`;

        const { rows } = await pool.query(query, queryParams);
        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
};