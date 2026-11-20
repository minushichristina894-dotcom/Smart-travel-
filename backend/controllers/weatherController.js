const pool = require('../config/database');
const { fetchLiveWeather, analyzeWithPython } = require('../utils/weatherPipeline');
const { resolvePlace, searchPlaces } = require('../utils/geocodingService');
const { sendRiskAlertEmail, sendEmail } = require('../utils/emailService');
const { buildWeatherRiskPdf, reportFileName } = require('../utils/weatherPdf');

/**
 * GET /api/weather/places?q=kandy
 * Search any place in Sri Lanka
 */
exports.searchPlaces = async (req, res) => {
  try {
    const { q } = req.query;
    const result = await searchPlaces(q || '');
    res.json({ success: true, places: result.places });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/weather/analyze
 * Accepts: place_name OR destination_id + travel_date
 * Flow: Geocode → OpenWeatherMap → Python Flask → Risk
 */
exports.analyzeWeather = async (req, res) => {
  try {
    const { destination_id, activity_id, travel_date, place_name } = req.body;

    if (!travel_date) {
      return res.status(400).json({ success: false, message: 'Travel date is required.' });
    }

    let destination = null;
    let lat;
    let lon;

    // Option 1: User typed any place name in Sri Lanka
    if (place_name?.trim()) {
      const resolved = await resolvePlace(place_name);
      lat = resolved.lat;
      lon = resolved.lon;
      destination = {
        id: null,
        name: resolved.name,
        country: 'Sri Lanka',
        state: resolved.state || '',
      };

      // Try match existing destination in DB for logging
      const [matches] = await pool.query(
        'SELECT id, name, country FROM destinations WHERE LOWER(name) = LOWER(?) LIMIT 1',
        [resolved.name]
      );
      if (matches.length) destination.id = matches[0].id;
    }
    // Option 2: Selected from app destinations list
    else if (destination_id) {
      const [destinations] = await pool.query(
        'SELECT id, name, country, latitude, longitude FROM destinations WHERE id = ?',
        [destination_id]
      );
      if (!destinations.length) {
        return res.status(404).json({ success: false, message: 'Destination not found.' });
      }
      destination = destinations[0];
      if (!destination.latitude || !destination.longitude) {
        return res.status(400).json({ success: false, message: 'Destination coordinates unavailable.' });
      }
      lat = destination.latitude;
      lon = destination.longitude;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Enter a place name in Sri Lanka or select a destination.',
      });
    }

    const weather = await fetchLiveWeather(lat, lon, travel_date);
    const analysis = await analyzeWithPython(weather);

    // Log if we have a destination_id in DB
    const userId = req.user?.id || null;
    if (destination.id) {
      try {
        await pool.query(
          `INSERT INTO weather_logs (user_id, destination_id, activity_id, travel_date, temperature, rain_mm, wind_speed_kmh, humidity, risk_level, recommendation, python_response)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId, destination.id, activity_id || null, travel_date,
            weather.temperature, weather.rain_mm, weather.wind_speed_kmh, weather.humidity,
            analysis.risk_level, analysis.recommendation,
            JSON.stringify({ ...analysis, searched_place: place_name || destination.name }),
          ]
        );
      } catch (logErr) {
        console.warn('Weather log skipped:', logErr.message);
      }
    }

    if (req.user?.role === 'customer' && ['moderate', 'high'].includes(analysis.risk_level)) {
      const [users] = await pool.query(
        'SELECT full_name, email FROM users WHERE id = ?',
        [req.user.id]
      );
      if (users.length) {
        await sendRiskAlertEmail(users[0], {
          destination: destination.name,
          travel_date: travel_date,
          risk_level: analysis.risk_level,
          recommendation: analysis.recommendation,
          temperature: weather.temperature,
          rain_mm: weather.rain_mm,
          wind_speed_kmh: weather.wind_speed_kmh,
        });
      }
    }

    res.json({
      success: true,
      destination: {
        id: destination.id,
        name: destination.name,
        country: destination.country,
        state: destination.state,
      },
      travel_date,
      weather: {
        temperature: weather.temperature,
        rain_mm: weather.rain_mm,
        wind_speed_kmh: weather.wind_speed_kmh,
        humidity: weather.humidity,
        description: weather.description,
        icon: weather.icon,
        source: weather.source,
        provider: weather.provider || 'OpenWeatherMap',
        fetchedAt: weather.fetchedAt,
        isLive: weather.isLive,
      },
      analysis: {
        risk_level: analysis.risk_level,
        label: analysis.label,
        emoji: analysis.emoji,
        recommendation: analysis.recommendation,
        analyzed_by: analysis.analyzed_by,
      },
    });
  } catch (error) {
    console.error('Weather analyze error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Weather analysis failed.',
    });
  }
};

exports.getCurrentWeather = async (req, res) => {
  try {
    const [destinations] = await pool.query(
      'SELECT id, name, latitude, longitude FROM destinations WHERE id = ?',
      [req.params.destinationId]
    );
    if (!destinations.length) return res.status(404).json({ success: false, message: 'Destination not found.' });

    const destination = destinations[0];
    const weather = await fetchLiveWeather(destination.latitude, destination.longitude, new Date().toISOString().split('T')[0]);
    const analysis = await analyzeWithPython(weather);

    res.json({ success: true, destination: destination.name, weather, analysis });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch current weather.' });
  }
};

function reportFromBody(body = {}) {
  const destination = body.destination || { name: body.place_name };
  const weather = body.weather || {};
  const analysis = body.analysis || {};
  if (!destination.name || !body.travel_date || analysis.risk_level == null) {
    return null;
  }
  return {
    destination,
    travel_date: body.travel_date,
    weather,
    analysis,
  };
}

exports.downloadWeatherPdf = async (req, res) => {
  try {
    const report = reportFromBody(req.body);
    if (!report) {
      return res.status(400).json({ success: false, message: 'Generate a weather risk result first.' });
    }
    const pdf = await buildWeatherRiskPdf(report);
    const filename = reportFileName(report);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(pdf);
  } catch (error) {
    console.error('Weather PDF error:', error.message);
    res.status(500).json({ success: false, message: 'Could not generate the PDF.' });
  }
};

exports.emailWeatherPdf = async (req, res) => {
  try {
    const report = reportFromBody(req.body);
    if (!report) {
      return res.status(400).json({ success: false, message: 'Generate a weather risk result first.' });
    }

    const [[user]] = await pool.query(
      'SELECT full_name, email FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!user?.email) {
      return res.status(404).json({ success: false, message: 'No email is saved on your account.' });
    }

    const pdf = await buildWeatherRiskPdf(report);
    const filename = reportFileName(report);
    const sent = await sendEmail({
      to: user.email,
      subject: `Weather risk PDF — ${report.destination.name} (${String(report.analysis.risk_level).toUpperCase()})`,
      text: `Hi ${user.full_name},\n\nYour weather risk report for ${report.destination.name} on ${report.travel_date} is attached as a PDF.\nRisk: ${report.analysis.risk_level}\n\nSmart Travel Planner`,
      html: `<p>Hi ${user.full_name},</p><p>Your weather risk report for <strong>${report.destination.name}</strong> on <strong>${report.travel_date}</strong> is attached as a PDF.</p><p>Risk level: <strong>${String(report.analysis.risk_level).toUpperCase()}</strong></p><p>Smart Travel Planner</p>`,
      attachments: [{ filename, content: pdf, contentType: 'application/pdf' }],
    });

    if (!sent.ok) {
      return res.status(502).json({ success: false, message: 'Could not email the PDF. Please try download instead.' });
    }

    res.json({ success: true, message: `PDF sent to ${user.email}.`, email: user.email });
  } catch (error) {
    console.error('Weather PDF email error:', error.message);
    res.status(500).json({ success: false, message: 'Could not email the PDF.' });
  }
};

/** Staff/Admin: view weather alert logs */
exports.getWeatherLogs = async (req, res) => {
  try {
    const [logs] = await pool.query(
      `SELECT wl.*, d.name AS destination_name, a.name AS activity_name,
              u.full_name AS user_name
       FROM weather_logs wl
       JOIN destinations d ON wl.destination_id = d.id
       LEFT JOIN activities a ON wl.activity_id = a.id
       LEFT JOIN users u ON wl.user_id = u.id
       ORDER BY wl.created_at DESC LIMIT 100`
    );
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
