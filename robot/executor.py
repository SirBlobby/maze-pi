import time
import threading


POLL_INTERVAL        = 0.02
SENSOR_POLL_INTERVAL = 0.05


class CommandExecutor:
    def __init__(self, robot):
        self.robot      = robot
        self._thread    = None
        self._stop_flag = threading.Event()
        self._running   = False
        self._current   = None
        self._lock      = threading.Lock()

    def run(self, commands):
        self.stop()
        self._stop_flag.clear()
        with self._lock:
            self._running = True
            self._current = None
        self._thread = threading.Thread(
            target=self._execute,
            args=(commands,),
            daemon=True,
        )
        self._thread.start()

    def stop(self):
        self._stop_flag.set()
        thread = self._thread
        if thread and thread.is_alive():
            thread.join(timeout=2)
        self.robot.stop()
        with self._lock:
            self._running = False
            self._current = None

    def status(self):
        with self._lock:
            return {
                'running': self._running,
                'current': self._current,
            }

    def _execute(self, commands):
        try:
            self._run_block(commands)
        finally:
            self.robot.stop()
            with self._lock:
                self._running = False
                self._current = None

    def _run_block(self, commands):
        for command in commands:
            if self._stop_flag.is_set():
                return
            self._dispatch(command)

    def _dispatch(self, command):
        if not isinstance(command, dict):
            return
        action = command.get('action')
        with self._lock:
            self._current = {'action': action}
        handler = HANDLERS.get(action)
        if handler is None:
            return
        handler(self, command)

    def _sleep(self, duration):
        try:
            duration = float(duration)
        except (TypeError, ValueError):
            return
        deadline = time.time() + max(0.0, duration)
        while time.time() < deadline:
            if self._stop_flag.is_set():
                return
            time.sleep(POLL_INTERVAL)


def _handle_forward(ex, cmd):
    speed    = max(50, float(cmd.get('speed', 80)))
    duration = float(cmd.get('duration', 1.0))
    ex.robot.forward(speed)
    ex._sleep(duration)
    ex.robot.stop()


def _handle_backward(ex, cmd):
    speed    = max(50, float(cmd.get('speed', 80)))
    duration = float(cmd.get('duration', 1.0))
    ex.robot.backward(speed)
    ex._sleep(duration)
    ex.robot.stop()


def _handle_turn_left(ex, cmd):
    speed    = max(50, float(cmd.get('speed', 80)))
    duration = float(cmd.get('duration', 1.0))
    ex.robot.turn_left(speed)
    ex._sleep(duration)
    ex.robot.stop()


def _handle_turn_right(ex, cmd):
    speed    = max(50, float(cmd.get('speed', 80)))
    duration = float(cmd.get('duration', 1.0))
    ex.robot.turn_right(speed)
    ex._sleep(duration)
    ex.robot.stop()


def _handle_strafe_left(ex, cmd):
    speed    = max(50, float(cmd.get('speed', 80)))
    duration = float(cmd.get('duration', 1.0))
    ex.robot.strafe_left(speed)
    ex._sleep(duration)
    ex.robot.stop()


def _handle_strafe_right(ex, cmd):
    speed    = max(50, float(cmd.get('speed', 80)))
    duration = float(cmd.get('duration', 1.0))
    ex.robot.strafe_right(speed)
    ex._sleep(duration)
    ex.robot.stop()


def _handle_stop(ex, cmd):
    ex.robot.stop()


def _handle_wait(ex, cmd):
    ex._sleep(float(cmd.get('duration', 1.0)))


def _handle_repeat(ex, cmd):
    count = int(cmd.get('count', 1))
    body  = cmd.get('body', [])
    if not isinstance(body, list):
        return
    for _ in range(max(0, count)):
        if ex._stop_flag.is_set():
            return
        ex._run_block(body)


def _handle_set_led(ex, cmd):
    ex.robot.set_led(cmd.get('color', 'off'))


def _handle_beep(ex, cmd):
    ex.robot.beep(float(cmd.get('duration', 0.1)))


def _poll_sonar_until(ex, threshold, want_close):
    threshold = float(threshold)
    while not ex._stop_flag.is_set():
        distance = ex.robot.distance_cm()
        if distance is None:
            time.sleep(SENSOR_POLL_INTERVAL)
            continue
        if (distance < threshold) == want_close:
            return
        time.sleep(SENSOR_POLL_INTERVAL)


def _handle_wait_until_obstacle(ex, cmd):
    _poll_sonar_until(ex, cmd.get('threshold', 30), want_close=True)


def _handle_wait_until_clear(ex, cmd):
    _poll_sonar_until(ex, cmd.get('threshold', 30), want_close=False)


def _handle_if_obstacle(ex, cmd):
    threshold = float(cmd.get('threshold', 30))
    distance  = ex.robot.distance_cm()
    is_close  = distance is not None and distance < threshold
    body      = cmd.get('body' if is_close else 'else_body', [])
    if isinstance(body, list):
        ex._run_block(body)


def _handle_while_obstacle(ex, cmd):
    threshold = float(cmd.get('threshold', 30))
    body      = cmd.get('body', [])
    if not isinstance(body, list):
        return
    while not ex._stop_flag.is_set():
        distance = ex.robot.distance_cm()
        if distance is None or distance >= threshold:
            break
        ex._run_block(body)


def _handle_while_clear(ex, cmd):
    threshold = float(cmd.get('threshold', 30))
    body      = cmd.get('body', [])
    if not isinstance(body, list):
        return
    while not ex._stop_flag.is_set():
        distance = ex.robot.distance_cm()
        if distance is not None and distance < threshold:
            break
        ex._run_block(body)


def _read_line_channel(ex, channel):
    data = ex.robot.read_line_sensor()
    if data is None or len(data) < 4:
        return False
    return bool(data[max(0, min(3, int(channel) - 1))])


def _handle_wait_until_line(ex, cmd):
    channel   = int(cmd.get('channel', 2))
    want_line = cmd.get('state', 'on') == 'on'
    while not ex._stop_flag.is_set():
        if _read_line_channel(ex, channel) == want_line:
            return
        time.sleep(SENSOR_POLL_INTERVAL)


def _handle_if_line(ex, cmd):
    channel   = int(cmd.get('channel', 2))
    sees_line = _read_line_channel(ex, channel)
    body      = cmd.get('body' if sees_line else 'else_body', [])
    if isinstance(body, list):
        ex._run_block(body)


def _handle_while_line(ex, cmd):
    channel   = int(cmd.get('channel', 2))
    want_line = cmd.get('state', 'on') == 'on'
    body      = cmd.get('body', [])
    if not isinstance(body, list):
        return
    while not ex._stop_flag.is_set():
        if _read_line_channel(ex, channel) != want_line:
            break
        ex._run_block(body)


def _handle_follow_line(ex, cmd):
    speed    = max(50, float(cmd.get('speed', 60)))
    deadline = time.time() + max(0.0, float(cmd.get('duration', 5.0)))
    while time.time() < deadline and not ex._stop_flag.is_set():
        ex.robot.follow_line_step(speed)
        time.sleep(POLL_INTERVAL)
    ex.robot.stop()


HANDLERS = {
    'forward':             _handle_forward,
    'backward':            _handle_backward,
    'turn_left':           _handle_turn_left,
    'turn_right':          _handle_turn_right,
    'strafe_left':         _handle_strafe_left,
    'strafe_right':        _handle_strafe_right,
    'stop':                _handle_stop,
    'wait':                _handle_wait,
    'repeat':              _handle_repeat,
    'set_led':             _handle_set_led,
    'beep':                _handle_beep,
    'wait_until_obstacle': _handle_wait_until_obstacle,
    'wait_until_clear':    _handle_wait_until_clear,
    'if_obstacle':         _handle_if_obstacle,
    'while_obstacle':      _handle_while_obstacle,
    'while_clear':         _handle_while_clear,
    'wait_until_line':     _handle_wait_until_line,
    'if_line':             _handle_if_line,
    'while_line':          _handle_while_line,
    'follow_line':         _handle_follow_line,
}
