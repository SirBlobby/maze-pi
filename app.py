import re
import json
import argparse
import pathlib

from flask import Flask, request, jsonify, send_from_directory

from robot.controller import RobotController
from robot.executor import CommandExecutor
from robot.code_runner import CodeRunner
from robot import system

SAVES_DIR = pathlib.Path(__file__).parent / 'saves'
SAVES_DIR.mkdir(exist_ok=True)

VALID_NAME = re.compile(r'^[\w][\w\s\-]{0,58}[\w]$|^[\w]$')


def sanitize_name(name):
    name = re.sub(r'[^\w\s\-]', '', str(name or '')).strip()
    name = re.sub(r'\s+', ' ', name)[:60]
    return name if VALID_NAME.match(name) else None


def create_app(mock=False):
    app = Flask(__name__, static_folder='static', static_url_path='')

    robot       = RobotController(mock=mock)
    executor    = CommandExecutor(robot)
    code_runner = CodeRunner(robot)

    @app.route('/')
    def index():
        return send_from_directory('static', 'index.html')

    @app.route('/code')
    def code_page():
        return send_from_directory('static', 'code.html')

    @app.route('/docs')
    def docs_page():
        return send_from_directory('static', 'docs.html')

    @app.route('/api/run', methods=['POST'])
    def run_program():
        payload  = request.get_json(silent=True) or {}
        commands = payload.get('commands', [])
        if not isinstance(commands, list):
            return jsonify({'error': 'commands must be a list'}), 400
        code_runner.stop()
        executor.run(commands)
        return jsonify({'status': 'started', 'count': len(commands)})

    @app.route('/api/stop', methods=['POST'])
    def stop_program():
        executor.stop()
        code_runner.stop()
        return jsonify({'status': 'stopped'})

    @app.route('/api/status')
    def status():
        return jsonify(executor.status())

    @app.route('/api/run_code', methods=['POST'])
    def run_code():
        payload = request.get_json(silent=True) or {}
        code    = payload.get('code', '')
        if not isinstance(code, str):
            return jsonify({'error': 'code must be a string'}), 400
        executor.stop()
        code_runner.run(code)
        return jsonify({'status': 'started'})

    @app.route('/api/code/status')
    def code_status():
        return jsonify(code_runner.status())

    @app.route('/api/sensor/<name>')
    def read_sensor(name):
        value = robot.read_sensor(name)
        return jsonify({'sensor': name, 'value': value, 'mock': robot.mock})

    @app.route('/api/system')
    def system_stats():
        voltage = robot.battery_voltage()
        return jsonify({
            'battery_v':   voltage,
            'battery_pct': system.battery_percent(voltage),
            'cpu_pct':     system.cpu_percent(),
            'cpu_temp_c':  system.cpu_temp(),
            'ram':         system.ram(),
            'disk':        system.disk(),
            'ip':          system.ip_address(),
            'mock':        robot.mock,
        })

    @app.route('/api/saves', methods=['GET'])
    def list_saves():
        names = sorted(f.stem for f in SAVES_DIR.glob('*.json'))
        return jsonify({'saves': names})

    @app.route('/api/saves/<name>', methods=['GET'])
    def get_save(name):
        safe = sanitize_name(name)
        if not safe:
            return jsonify({'error': 'invalid name'}), 400
        path = SAVES_DIR / f'{safe}.json'
        if not path.exists():
            return jsonify({'error': 'not found'}), 404
        return jsonify(json.loads(path.read_text()))

    @app.route('/api/saves/<name>', methods=['PUT'])
    def put_save(name):
        safe = sanitize_name(name)
        if not safe:
            return jsonify({'error': 'invalid name'}), 400
        state = request.get_json(silent=True)
        if state is None:
            return jsonify({'error': 'no state provided'}), 400
        path = SAVES_DIR / f'{safe}.json'
        path.write_text(json.dumps(state))
        return jsonify({'status': 'saved', 'name': safe})

    @app.route('/api/saves/<name>', methods=['DELETE'])
    def delete_save(name):
        safe = sanitize_name(name)
        if not safe:
            return jsonify({'error': 'invalid name'}), 400
        path = SAVES_DIR / f'{safe}.json'
        if path.exists():
            path.unlink()
        return jsonify({'status': 'deleted', 'name': safe})

    @app.route('/api/info')
    def info():
        return jsonify({
            'mock':               robot.mock,
            'hardware_available': robot.available,
        })

    return app


def parse_args():
    parser = argparse.ArgumentParser(description='Maze Pi web server')
    parser.add_argument('--host', default='0.0.0.0')
    parser.add_argument('--port', type=int, default=5000)
    parser.add_argument('--mock', action='store_true')
    parser.add_argument('--debug', action='store_true')
    return parser.parse_args()


if __name__ == '__main__':
    args = parse_args()
    app  = create_app(mock=args.mock)
    app.run(host=args.host, port=args.port, debug=args.debug, threaded=True)
