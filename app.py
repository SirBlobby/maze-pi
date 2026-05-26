import argparse

from flask import Flask, request, jsonify, send_from_directory

from robot.controller import RobotController
from robot.executor import CommandExecutor
from robot import system


def create_app(mock=False):
    app = Flask(__name__, static_folder='static', static_url_path='')

    robot = RobotController(mock=mock)
    executor = CommandExecutor(robot)

    @app.route('/')
    def index():
        return send_from_directory('static', 'index.html')

    @app.route('/api/run', methods=['POST'])
    def run_program():
        payload = request.get_json(silent=True) or {}
        commands = payload.get('commands', [])
        if not isinstance(commands, list):
            return jsonify({'error': 'commands must be a list'}), 400
        executor.run(commands)
        return jsonify({'status': 'started', 'count': len(commands)})

    @app.route('/api/stop', methods=['POST'])
    def stop_program():
        executor.stop()
        return jsonify({'status': 'stopped'})

    @app.route('/api/status')
    def status():
        return jsonify(executor.status())

    @app.route('/api/sensor/<name>')
    def read_sensor(name):
        value = robot.read_sensor(name)
        return jsonify({'sensor': name, 'value': value, 'mock': robot.mock})

    @app.route('/api/system')
    def system_stats():
        voltage = robot.battery_voltage()
        return jsonify({
            'battery_v': voltage,
            'battery_pct': system.battery_percent(voltage),
            'cpu_pct': system.cpu_percent(),
            'cpu_temp_c': system.cpu_temp(),
            'ram': system.ram(),
            'disk': system.disk(),
            'ip': system.ip_address(),
            'mock': robot.mock,
        })

    @app.route('/api/info')
    def info():
        return jsonify({
            'mock': robot.mock,
            'hardware_available': robot.available,
        })

    return app


def parse_args():
    parser = argparse.ArgumentParser(description='Maze Pi web server')
    parser.add_argument('--host', default='0.0.0.0')
    parser.add_argument('--port', type=int, default=5000)
    parser.add_argument('--mock', action='store_true',
                        help='Run without robot hardware (for testing the website).')
    parser.add_argument('--debug', action='store_true',
                        help='Enable Flask debug mode with auto-reload.')
    return parser.parse_args()


if __name__ == '__main__':
    args = parse_args()
    app = create_app(mock=args.mock)
    app.run(host=args.host, port=args.port, debug=args.debug, threaded=True)
