const PDFDocument = require('pdfkit');

const GREEN = '#2E7D32';
const DARK = '#0D3B10';
const MUTED = '#4b5563';

function riskColor(level) {
  const key = String(level || '').toLowerCase();
  if (key === 'high') return '#b91c1c';
  if (key === 'moderate') return '#b45309';
  return GREEN;
}

function buildWeatherRiskPdf(report) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 48 });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const dest = report.destination?.name || report.place_name || 'Sri Lanka';
    const date = report.travel_date || '—';
    const weather = report.weather || {};
    const analysis = report.analysis || {};
    const level = (analysis.risk_level || 'safe').toLowerCase();
    const label = level === 'high' ? 'HIGH RISK' : level === 'moderate' ? 'MODERATE RISK' : 'SAFE';

    doc.rect(0, 0, doc.page.width, 92).fill(DARK);
    doc.fillColor('#ffffff').fontSize(11).text('SMART TRAVEL PLANNER  ·  SRI LANKA', 48, 28);
    doc.fontSize(22).text('Weather Risk Report', 48, 48);

    doc.fillColor(DARK).fontSize(16).text(dest, 48, 118);
    doc.fillColor(MUTED).fontSize(11).text(`Travel date: ${date}`, 48, 140);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 48, 156);
    doc.text(`Source: ${weather.provider || weather.source || 'OpenWeatherMap'} + Python risk module`, 48, 172);

    doc.roundedRect(48, 200, 500, 56, 8).fillAndStroke('#E8F5E9', GREEN);
    doc.fillColor(riskColor(level)).fontSize(18).text(label, 64, 218);
    doc.fillColor(MUTED).fontSize(10).text('Python decision: High = rain > 20mm or wind > 35 km/h', 64, 240);

    const stats = [
      ['Temperature', `${Math.round(Number(weather.temperature) || 0)}°C`],
      ['Rainfall', `${weather.rain_mm ?? 0} mm`],
      ['Wind', `${Math.round(Number(weather.wind_speed_kmh) || 0)} km/h`],
      ['Humidity', `${weather.humidity ?? 0}%`],
    ];
    stats.forEach((pair, i) => {
      const x = 48 + (i % 2) * 260;
      const y = 280 + Math.floor(i / 2) * 64;
      doc.roundedRect(x, y, 240, 52, 8).stroke('#C8E6C9');
      doc.fillColor(MUTED).fontSize(10).text(pair[0], x + 14, y + 10);
      doc.fillColor(DARK).fontSize(16).text(pair[1], x + 14, y + 26);
    });

    doc.fillColor(DARK).fontSize(13).text('Recommendation', 48, 420);
    doc.fillColor('#111827').fontSize(11).text(analysis.recommendation || 'No recommendation available.', 48, 440, {
      width: 500,
      lineGap: 4,
    });

    if (weather.description) {
      doc.fillColor(MUTED).fontSize(11).text(`Condition: ${weather.description}`, 48, 520);
    }

    doc.fillColor('#9ca3af').fontSize(9).text(
      'This report does not change the weather-risk algorithm. Safe / Moderate / High classifications are produced by the existing Python module.',
      48,
      740,
      { width: 500 }
    );

    doc.end();
  });
}

function reportFileName(report) {
  const dest = String(report.destination?.name || 'sri-lanka').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const date = String(report.travel_date || 'report').replace(/[^0-9-]/g, '');
  return `weather-risk-${dest}-${date}.pdf`;
}

module.exports = { buildWeatherRiskPdf, reportFileName };
