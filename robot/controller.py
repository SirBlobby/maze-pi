import sys
import time
import threading

sys.path.append('/home/pi/TurboPi/')

try:
    import HiwonderSDK.Board as Board
    import HiwonderSDK.mecanum as mecanum
    import HiwonderSDK.Sonar as Sonar
    import HiwonderSDK.FourInfrared as FourInfrared
    HARDWARE_AVAILABLE = True
except ImportError:
    Board = None
    mecanum = None
    Sonar = None
    FourInfrared = None
    HARDWARE_AVAILABLE = False


COLORS = {
    'red':    (255, 0, 0),
    'orange': (255, 100, 0),
    'yellow': (255, 255, 0),
    'green':  (0, 255, 0),
    'blue':   (0, 0, 255),
    'purple': (180, 0, 220),
    'white':  (255, 255, 255),
    'off':    (0, 0, 0),
}

FORWARD_ANGLE  = 90
BACKWARD_ANGLE = 270
RIGHT_ANGLE    = 0
LEFT_ANGLE     = 180

DEFAULT_SPEED = 80
MIN_SPEED     = 50
MAX_SPEED     = 100


def _speed_to_turn_rate(speed):
    clamped = max(MIN_SPEED, min(MAX_SPEED, float(speed)))
    return clamped / 50.0


class RobotController:
    def __init__(self, mock=False):
        self._lock = threading.Lock()
        self.mock = mock or not HARDWARE_AVAILABLE
        self.available = HARDWARE_AVAILABLE and not mock
        if self.available:
            self.chassis     = mecanum.MecanumChassis()
            self.sonar       = Sonar.Sonar()
            self.board       = Board
            self.line_sensor = FourInfrared.FourInfrared()
        else:
            self.chassis     = None
            self.sonar       = None
            self.board       = None
            self.line_sensor = None
        self.set_led('off')

    def move(self, speed, direction, turn_rate):
        with self._lock:
            if self.chassis is None:
                return
            self.chassis.set_velocity(speed, direction, turn_rate)

    def forward(self, speed=DEFAULT_SPEED):
        self.move(max(MIN_SPEED, speed), FORWARD_ANGLE, 0)

    def backward(self, speed=DEFAULT_SPEED):
        self.move(max(MIN_SPEED, speed), BACKWARD_ANGLE, 0)

    def strafe_left(self, speed=DEFAULT_SPEED):
        self.move(max(MIN_SPEED, speed), LEFT_ANGLE, 0)

    def strafe_right(self, speed=DEFAULT_SPEED):
        self.move(max(MIN_SPEED, speed), RIGHT_ANGLE, 0)

    def turn_left(self, speed=DEFAULT_SPEED):
        self.move(0, FORWARD_ANGLE, _speed_to_turn_rate(speed))

    def turn_right(self, speed=DEFAULT_SPEED):
        self.move(0, FORWARD_ANGLE, -_speed_to_turn_rate(speed))

    def stop(self):
        self.move(0, 0, 0)

    def follow_line_step(self, speed=DEFAULT_SPEED):
        speed = max(MIN_SPEED, speed)
        data  = self.read_line_sensor()
        if data is None:
            self.forward(speed)
            return
        s1, s2, s3, s4 = data
        if s2 and s3:
            self.move(speed, FORWARD_ANGLE, 0)
        elif s3 and not s2:
            self.move(speed, FORWARD_ANGLE, 0.25)
        elif s2 and not s3:
            self.move(speed, FORWARD_ANGLE, -0.25)
        elif s4:
            self.move(speed, FORWARD_ANGLE, 0.55)
        elif s1:
            self.move(speed, FORWARD_ANGLE, -0.55)
        else:
            self.forward(speed)

    def distance_cm(self):
        if self.sonar is None:
            return None
        try:
            raw_mm = self.sonar.getDistance()
        except Exception:
            return None
        if raw_mm is None:
            return None
        return float(raw_mm) / 10.0

    def read_line_sensor(self):
        if self.mock:
            return [False, False, False, False]
        if self.line_sensor is None:
            return None
        try:
            return self.line_sensor.readData()
        except Exception:
            return None

    def battery_voltage(self):
        if self.board is None:
            return None
        try:
            raw_mv = self.board.getBattery()
            if raw_mv and 0 < raw_mv < 16000:
                return round(float(raw_mv) / 1000.0, 2)
        except Exception:
            pass
        return None

    def read_sensor(self, name):
        name = (name or '').lower()
        if name in ('sonar', 'distance', 'ultrasonic'):
            return self.distance_cm()
        if name in ('line', 'infrared', 'line_sensor'):
            return self.read_line_sensor()
        return None

    def set_led(self, color):
        if self.board is None:
            return
        r, g, b = COLORS.get(color, COLORS['off'])
        with self._lock:
            self.board.RGB.setPixelColor(0, self.board.PixelColor(r, g, b))
            self.board.RGB.setPixelColor(1, self.board.PixelColor(r, g, b))
            self.board.RGB.show()

    def beep(self, duration=0.1):
        if self.board is None:
            time.sleep(duration)
            return
        with self._lock:
            self.board.setBuzzer(1)
        time.sleep(duration)
        with self._lock:
            self.board.setBuzzer(0)
