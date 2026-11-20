"""
Flask API routes — returns JSON for React frontend
"""

from flask import request, jsonify
from weather_analysis import analyze_travel_risk


def register_routes(app):
    @app.route('/api/health', methods=['GET'])
    def health():
        return jsonify({
            'success': True,
            'service': 'Python Flask — Weather Risk Analysis',
            'status': 'running',
        })

    @app.route('/api/analyze', methods=['POST'])
    def analyze():
        """
        Weather risk analysis endpoint.
        React / Node sends JSON: { temperature, rain_mm, wind_speed_kmh, humidity, description? }
        Returns JSON with risk_level, label, recommendation.
        """
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'Weather data required.'}), 400

        required = ['temperature', 'rain_mm', 'wind_speed_kmh', 'humidity']
        for field in required:
            if field not in data:
                return jsonify({'success': False, 'message': f'Missing field: {field}'}), 400

        result = analyze_travel_risk(data)
        return jsonify({'success': True, 'analysis': result})
