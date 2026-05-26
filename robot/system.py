import socket

try:
    import psutil
    PSUTIL_AVAILABLE = True
except ImportError:
    psutil = None
    PSUTIL_AVAILABLE = False

BATTERY_MIN_V = 7.0
BATTERY_MAX_V = 8.4


def battery_percent(voltage):
    if voltage is None:
        return None
    pct = (voltage - BATTERY_MIN_V) / (BATTERY_MAX_V - BATTERY_MIN_V) * 100.0
    return round(max(0.0, min(100.0, pct)), 1)


def cpu_percent():
    if not PSUTIL_AVAILABLE:
        return None
    return round(psutil.cpu_percent(interval=0.1), 1)


def ram():
    if not PSUTIL_AVAILABLE:
        return None
    mem = psutil.virtual_memory()
    return {
        'percent': round(mem.percent, 1),
        'used_mb': round(mem.used / 1_048_576),
        'total_mb': round(mem.total / 1_048_576),
    }


def cpu_temp():
    try:
        raw = open('/sys/class/thermal/thermal_zone0/temp').read()
        return round(float(raw) / 1000.0, 1)
    except Exception:
        return None


def disk():
    if not PSUTIL_AVAILABLE:
        return None
    usage = psutil.disk_usage('/')
    return {
        'percent': round(usage.percent, 1),
        'used_gb': round(usage.used / 1_073_741_824, 1),
        'total_gb': round(usage.total / 1_073_741_824, 1),
    }


def ip_address():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(0)
        s.connect(('10.254.254.254', 1))
        return s.getsockname()[0]
    except Exception:
        return None
