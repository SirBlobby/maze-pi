import time
import threading


POLL_INTERVAL = 0.02
SENSOR_POLL_INTERVAL = 0.05


class CommandExecutor:
    def __init__(self, robot):
        self.robot = robot
        self._thread = None
        self._stop_flag = threading.Event()
        self._running = False
        self._current = None
        self._lock = threading.Lock()

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
    speed = float(cmd.get('speed', 50))
    duration = float(cmd.get('duration', 1.0))
    ex.robot.forward(speed)
    ex._sleep(duration)
    ex.robot.stop()


def _handle_backward(ex, cmd):
    speed = float(cmd.get('speed', 50))
    duration = float(cmd.get('duration', 1.0))
    ex.robot.backward(speed)
    ex._sleep(duration)
    ex.robot.stop()


def _handle_turn_left(ex, cmd):
    rate = float(cmd.get('rate', 1.0))
    duration = float(cmd.get('duration', 1.0))
    ex.robot.turn_left(rate)
    ex._sleep(duration)
    ex.robot.stop()


def _handle_turn_right(ex, cmd):
    rate = float(cmd.get('rate', 1.0))
    duration = float(cmd.get('duration', 1.0))
    ex.robot.turn_right(rate)
    ex._sleep(duration)
    ex.robot.stop()


def _handle_strafe_left(ex, cmd):
    speed = float(cmd.get('speed', 50))
    duration = float(cmd.get('duration', 1.0))
    ex.robot.strafe_left(speed)
    ex._sleep(duration)
    ex.robot.stop()


def _handle_strafe_right(ex, cmd):
    speed = float(cmd.get('speed', 50))
    duration = float(cmd.get('duration', 1.0))
    ex.robot.strafe_right(speed)
    ex._sleep(duration)
    ex.robot.stop()


def _handle_stop(ex, cmd):
    ex.robot.stop()


def _handle_wait(ex, cmd):
    duration = float(cmd.get('duration', 1.0))
    ex._sleep(duration)


def _handle_set_led(ex, cmd):
    color = cmd.get('color', 'off')
    ex.robot.set_led(color)


def _handle_beep(ex, cmd):
    duration = float(cmd.get('duration', 0.1))
    ex.robot.beep(duration)


def _handle_repeat(ex, cmd):
    count = int(cmd.get('count', 1))
    body = cmd.get('body', [])
    if not isinstance(body, list):
        return
    for _ in range(max(0, count)):
        if ex._stop_flag.is_set():
            return
        ex._run_block(body)


def _wait_for_sonar(ex, threshold, want_close):
    threshold = float(threshold)
    while not ex._stop_flag.is_set():
        distance = ex.robot.distance_cm()
        if distance is None:
            time.sleep(SENSOR_POLL_INTERVAL)
            continue
        is_close = distance < threshold
        if is_close == want_close:
            return
        time.sleep(SENSOR_POLL_INTERVAL)


def _handle_wait_until_obstacle(ex, cmd):
    threshold = cmd.get('threshold', 30)
    _wait_for_sonar(ex, threshold, want_close=True)


def _handle_wait_until_clear(ex, cmd):
    threshold = cmd.get('threshold', 30)
    _wait_for_sonar(ex, threshold, want_close=False)


def _handle_if_obstacle(ex, cmd):
    threshold = float(cmd.get('threshold', 30))
    distance = ex.robot.distance_cm()
    is_close = distance is not None and distance < threshold
    branch = 'body' if is_close else 'else_body'
    body = cmd.get(branch, [])
    if isinstance(body, list):
        ex._run_block(body)


HANDLERS = {
    'forward': _handle_forward,
    'backward': _handle_backward,
    'turn_left': _handle_turn_left,
    'turn_right': _handle_turn_right,
    'strafe_left': _handle_strafe_left,
    'strafe_right': _handle_strafe_right,
    'stop': _handle_stop,
    'wait': _handle_wait,
    'set_led': _handle_set_led,
    'beep': _handle_beep,
    'repeat': _handle_repeat,
    'wait_until_obstacle': _handle_wait_until_obstacle,
    'wait_until_clear': _handle_wait_until_clear,
    'if_obstacle': _handle_if_obstacle,
}
