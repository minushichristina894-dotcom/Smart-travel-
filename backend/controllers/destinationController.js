const pool = require('../config/database');

/**
 * GET /api/destinations
 */
exports.getAllDestinations = async (req, res) => {
  try {
    const { active } = req.query;
    let query = 'SELECT * FROM destinations';
    const params = [];

    if (active === 'true') {
      query += ' WHERE is_active = TRUE';
    }

    query += ' ORDER BY name ASC';
    const [destinations] = await pool.query(query, params);

    // Parse JSON fields
    const parsed = destinations.map((d) => ({
      ...d,
      gallery: typeof d.gallery === 'string' ? JSON.parse(d.gallery) : d.gallery,
    }));

    res.json({ success: true, destinations: parsed });
  } catch (error) {
    console.error('Get destinations error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * GET /api/destinations/:id
 */
exports.getDestinationById = async (req, res) => {
  try {
    const [destinations] = await pool.query('SELECT * FROM destinations WHERE id = ?', [req.params.id]);

    if (destinations.length === 0) {
      return res.status(404).json({ success: false, message: 'Destination not found.' });
    }

    const destination = {
      ...destinations[0],
      gallery: typeof destinations[0].gallery === 'string' ? JSON.parse(destinations[0].gallery) : destinations[0].gallery,
    };

    const [activities] = await pool.query(
      'SELECT * FROM activities WHERE destination_id = ? AND is_active = TRUE',
      [req.params.id]
    );

    res.json({ success: true, destination, activities });
  } catch (error) {
    console.error('Get destination error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * POST /api/destinations (admin)
 */
exports.createDestination = async (req, res) => {
  try {
    const { name, country, description, image_url, gallery, activities, price, latitude, longitude } = req.body;

    if (!name || !country || !description || !image_url || !price) {
      return res.status(400).json({ success: false, message: 'Required fields missing.' });
    }

    const [result] = await pool.query(
      `INSERT INTO destinations (name, country, description, image_url, gallery, price, latitude, longitude)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, country, description, image_url,
        JSON.stringify(gallery || []),
        price, latitude || null, longitude || null,
      ]
    );

    res.status(201).json({ success: true, message: 'Destination created.', id: result.insertId });
  } catch (error) {
    console.error('Create destination error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * PUT /api/destinations/:id (admin)
 */
exports.updateDestination = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, country, description, image_url, gallery, price, latitude, longitude, is_active } = req.body;

    const [existing] = await pool.query('SELECT id FROM destinations WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Destination not found.' });
    }

    await pool.query(
      `UPDATE destinations SET name=?, country=?, description=?, image_url=?, gallery=?,
       price=?, latitude=?, longitude=?, is_active=? WHERE id=?`,
      [
        name, country, description, image_url,
        JSON.stringify(gallery || []),
        price, latitude || null, longitude || null, is_active !== false, id,
      ]
    );

    res.json({ success: true, message: 'Destination updated.' });
  } catch (error) {
    console.error('Update destination error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error.' });
  }
};

/**
 * DELETE /api/destinations/:id (admin)
 */
exports.deleteDestination = async (req, res) => {
  try {
    await pool.query('DELETE FROM destinations WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Destination deleted.' });
  } catch (error) {
    console.error('Delete destination error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
