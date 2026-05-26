# Maze Pi

![Python](https://img.shields.io/badge/Python-3.9%2B-blue?logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-2.3%2B-black?logo=flask&logoColor=white)
![Blockly](https://img.shields.io/badge/Blockly-latest-4285F4?logo=google&logoColor=white)
![Platform](https://img.shields.io/badge/Platform-Raspberry%20Pi-C51A4A?logo=raspberrypi&logoColor=white)

A web app that lets high school students program a [Hiwonder TurboPi](https://www.hiwonder.com) robot to navigate a maze using drag-and-drop block coding — no prior programming experience required.

## Install

Run once after cloning onto the robot:

```bash
bash install.sh
```

Installs Python dependencies and makes all scripts executable.

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

| Category | Blocks |
|---|---|
| **Movement** | Forward, Backward, Turn Left, Turn Right, Strafe Left, Strafe Right, Stop |
| **Sensors** | Wait Until Obstacle, Wait Until Clear, If Obstacle (then/else) |
| **Control** | Wait, Repeat |
| **Effects** | Set LED Color, Beep |

## API

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/run` | Send `{ "commands": [...] }` to run a program |
| `POST` | `/api/stop` | Stop the robot immediately |
| `GET` | `/api/status` | Current run state and active command |
| `GET` | `/api/sensor/sonar` | Live sonar distance in cm |
| `GET` | `/api/info` | Whether the server is running in mock mode |
