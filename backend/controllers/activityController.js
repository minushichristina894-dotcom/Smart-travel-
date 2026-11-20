const pool = require('../config/database');

const VALID_AGE_CATEGORIES = ['Kids', 'Adults', 'All Ages'];

const normalizeAgeCategory = (value) =>
  VALID_AGE_CATEGORIES.includes(value) ? value : 'All Ages';

exports.getAllActivities = async (req, res) => {
  try {
    const { destination_id } = req.query;
    let query = `
      SELECT a.*, d.name AS destination_name, d.country, d.image_url AS destination_image
      FROM activities a JOIN destinations d ON a.destination_id = d.id
      WHERE a.is_active = TRUE`;
    const params = [];
    if (destination_id) { query += ' AND a.destination_id = ?'; params.push(destination_id); }
    query += ' ORDER BY a.name';
    const [activities] = await pool.query(query, params);
    res.json({ success: true, activities });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getActivityById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, d.name AS destination_name, d.country, d.image_url AS destination_image
       FROM activities a JOIN destinations d ON a.destination_id = d.id WHERE a.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Activity not found.' });
    res.json({ success: true, activity: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.createActivity = async (req, res) => {
  try {
    const { destination_id, name, description, price, duration_hours, image_url, age_category } = req.body;
    const [result] = await pool.query(
      'INSERT INTO activities (destination_id, name, description, price, duration_hours, image_url, age_category) VALUES (?,?,?,?,?,?,?)',
      [destination_id, name, description, price || 0, duration_hours || 2, image_url, normalizeAgeCategory(age_category)]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.updateActivity = async (req, res) => {
  try {
    const { destination_id, name, description, price, duration_hours, image_url, age_category, is_active } = req.body;
    await pool.query(
      'UPDATE activities SET destination_id=?, name=?, description=?, price=?, duration_hours=?, image_url=?, age_category=?, is_active=? WHERE id=?',
      [destination_id, name, description, price, duration_hours, image_url, normalizeAgeCategory(age_category), is_active !== false, req.params.id]
    );
    res.json({ success: true, message: 'Activity updated.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.deleteActivity = async (req, res) => {
  try {
    await pool.query('DELETE FROM activities WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Activity deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
