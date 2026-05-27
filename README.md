# Maze Pi

![Python](https://img.shields.io/badge/Python-3.9%2B-blue?logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-2.3%2B-black?logo=flask&logoColor=white)
![Blockly](https://img.shields.io/badge/Blockly-latest-4285F4?logo=google&logoColor=white)
![Platform](https://img.shields.io/badge/Platform-Raspberry%20Pi-C51A4A?logo=raspberrypi&logoColor=white)

A web app that lets high school students program a TurboPi robot to navigate a maze — using either drag-and-drop block coding or a Python code editor.

## Pages

| Route | Description |
|---|---|
| `/` | Blockly drag-and-drop editor |
| `/code` | Python code editor (CodeMirror 6) |
| `/docs` | API & Python function reference |

## Install

Run once after cloning onto the robot:

```bash
bash install.sh
```

### Build the CodeMirror bundle (required for `/code` page)

```bash
npm install
npm run build
```

This generates `static/js/cm6.bundle.js`. Only needs to be run once after cloning (or after changing `static/js/src/cm6_editor.js`).

## Run

**On the robot:**
```bash
python app.py
```
Connect from any device on the same network at `http://<robot-ip>:5000`.

**Local development (no robot needed):**
```bash
./dev.sh
```
Opens at `http://127.0.0.1:5000`. All API endpoints work; hardware calls are silently skipped.

## Service

Install as a systemd service so Maze Pi starts automatically on boot:

```bash
sudo ./service/install_service.sh
```

```bash
sudo systemctl status mazepi
```

Remove the service:

```bash
sudo ./service/uninstall_service.sh
```

## Blocks

### Movement

| Block | Description |
|---|---|
| **Move Forward / Backward** | Drive for N seconds at speed 50–100 |
| **Turn Left / Right** | Spin in place — speed 50–100 maps to turn_rate 1.0–2.0 |
| **Strafe Left / Right** | Slide sideways at speed 50–100 |
| **Stop Motors** | Immediately stop all wheels |

### Control

| Block | Description |
|---|---|
| **Wait** | Pause for N seconds |
| **Repeat N times** | Run inner blocks N times |
| **While obstacle within X cm** | Loop while sonar detects something close |
| **While path clear past X cm** | Loop while path is open |
| **While line sensor N sees/doesn't see line** | Loop on infrared sensor state |

### Sonar

| Block | Description |
|---|---|
| **Wait until obstacle within X cm** | Pause until something close is detected |
| **Wait until path clear past X cm** | Pause until path is open |
| **If obstacle within X cm** | Branch if/else on sonar |

### Line Sensors

| Block | Description |
|---|---|
| **Follow line N sec at speed X** | Autonomous line following |
| **Wait until line sensor N sees/doesn't see line** | Pause until sensor state matches |
| **If line sensor N sees line** | Branch if/else on infrared sensor |

### Effects

| Block | Description |
|---|---|
| **Set LED to color** | Change the RGB LEDs |
| **Beep for N seconds** | Buzz the piezo buzzer |

## Python Code API

The `/code` page editor has access to these functions:

| Function | Description |
|---|---|
| `forward(duration, speed)` | Drive forward |
| `backward(duration, speed)` | Drive backward |
| `turn_left(duration, speed)` | Spin left |
| `turn_right(duration, speed)` | Spin right |
| `strafe_left(duration, speed)` | Slide left |
| `strafe_right(duration, speed)` | Slide right |
| `stop()` | Stop motors |
| `wait(duration)` | Pause (stoppable) |
| `set_led(color)` | Set RGB LEDs |
| `beep(duration)` | Play buzzer |
| `distance_cm()` | Sonar in cm |
| `read_line_sensor()` | List of 4 booleans |
| `follow_line(duration, speed)` | Autonomous line follow |
| `print(...)` | Show in output panel |

## REST API

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/run` | Run a block program |
| `POST` | `/api/stop` | Stop everything |
| `GET` | `/api/status` | Block executor state |
| `POST` | `/api/run_code` | Run Python code |
| `GET` | `/api/code/status` | Python runner state + output |
| `GET` | `/api/sensor/sonar` | Sonar distance in cm |
| `GET` | `/api/sensor/line` | 4-element infrared boolean array |
| `GET` | `/api/system` | Battery, CPU, RAM, disk, temp, IP |
| `GET` | `/api/info` | Mock mode info |
| `GET/PUT/DELETE` | `/api/saves/<name>` | Saved programs |
