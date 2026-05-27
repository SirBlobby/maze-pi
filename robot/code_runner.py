import sys
import time
import threading


POLL_INTERVAL   = 0.02
MAX_OUTPUT_LINES = 1000


class CodeRunner:
    def __init__(self, robot):
        self.robot      = robot
        self._thread    = None
        self._stop_flag = threading.Event()
        self._running   = False
        self._output    = []
        self._error     = None
        self._lock      = threading.Lock()

    def run(self, code):
        self.stop()
        self._stop_flag.clear()
        with self._lock:
            self._running = True
            self._output  = []
            self._error   = None
        self._thread = threading.Thread(
            target=self._execute,
            args=(code,),
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

    def status(self):
        with self._lock:
            return {
                'running': self._running,
                'output':  list(self._output),
                'error':   self._error,
            }

    def _append(self, text):
        with self._lock:
            if len(self._output) < MAX_OUTPUT_LINES:
                self._output.append(str(text))

    def _build_namespace(self):
        robot  = self.robot
        flag   = self._stop_flag
        append = self._append

        def _timed_sleep(duration):
            deadline = time.time() + max(0.0, float(duration))
            while time.time() < deadline:
                if flag.is_set():
                    raise KeyboardInterrupt
                time.sleep(POLL_INTERVAL)

        def forward(duration=1, speed=80):
            robot.forward(speed)
            _timed_sleep(duration)
            robot.stop()

        def backward(duration=1, speed=80):
            robot.backward(speed)
            _timed_sleep(duration)
            robot.stop()

        def turn_left(duration=1, speed=80):
            robot.turn_left(speed)
            _timed_sleep(duration)
            robot.stop()

        def turn_right(duration=1, speed=80):
            robot.turn_right(speed)
            _timed_sleep(duration)
            robot.stop()

        def strafe_left(duration=1, speed=80):
            robot.strafe_left(speed)
            _timed_sleep(duration)
            robot.stop()

        def strafe_right(duration=1, speed=80):
            robot.strafe_right(speed)
            _timed_sleep(duration)
            robot.stop()

        def stop():
            robot.stop()

        def wait(duration=1):
            _timed_sleep(duration)

        def set_led(color='off'):
            robot.set_led(color)

        def beep(duration=0.2):
            robot.beep(float(duration))

        def distance_cm():
            return robot.distance_cm()

        def read_line_sensor():
            return robot.read_line_sensor()

        def follow_line(duration=5, speed=60):
            deadline = time.time() + max(0.0, float(duration))
            while time.time() < deadline:
                if flag.is_set():
                    raise KeyboardInterrupt
                robot.follow_line_step(speed)
                time.sleep(POLL_INTERVAL)
            robot.stop()

        def robot_print(*args, sep=' ', **kwargs):
            append(sep.join(str(a) for a in args))

        return {
            'print':            robot_print,
            'forward':          forward,
            'backward':         backward,
            'turn_left':        turn_left,
            'turn_right':       turn_right,
            'strafe_left':      strafe_left,
            'strafe_right':     strafe_right,
            'stop':             stop,
            'wait':             wait,
            'set_led':          set_led,
            'beep':             beep,
            'distance_cm':      distance_cm,
            'read_line_sensor': read_line_sensor,
            'follow_line':      follow_line,
        }

    def _execute(self, code):
        namespace = self._build_namespace()
        flag      = self._stop_flag

        def _trace(frame, event, arg):
            if flag.is_set():
                raise KeyboardInterrupt
            return _trace

        sys.settrace(_trace)
        try:
            exec(compile(code, '<robot>', 'exec'), namespace)
        except KeyboardInterrupt:
            self._append('[stopped]')
        except SyntaxError as e:
            with self._lock:
                self._error = f'SyntaxError line {e.lineno}: {e.msg}'
        except Exception as e:
            with self._lock:
                self._error = type(e).__name__ + ': ' + str(e)
        finally:
            sys.settrace(None)
            self.robot.stop()
            with self._lock:
                self._running = False
