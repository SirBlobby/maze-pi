const workspace = Blockly.inject('blockly-container', {
    toolbox: MAZE_TOOLBOX,
    grid: {
        spacing: 20,
        length: 3,
        colour: '#d1d5db',
        snap: true
    },
    zoom: {
        controls: true,
        wheel: true,
        startScale: 0.95,
        minScale: 0.4,
        maxScale: 2.0
    },
    trashcan: true,
    move: {
        scrollbars: true,
        drag: true,
        wheel: false
    }
});

const runButton      = document.getElementById('run-button');
const stopButton     = document.getElementById('stop-button');
const clearButton    = document.getElementById('clear-button');
const statusInfo     = document.getElementById('status-info');
const sonarValue     = document.getElementById('sonar-value');
const lsDots         = [1, 2, 3, 4].map(i => document.getElementById('ls-' + i));
const programPreview = document.getElementById('program-preview');

const batteryBar  = document.getElementById('battery-bar');
const batteryText = document.getElementById('battery-text');
const cpuBar      = document.getElementById('cpu-bar');
const cpuText     = document.getElementById('cpu-text');
const ramBar      = document.getElementById('ram-bar');
const ramText     = document.getElementById('ram-text');
const diskBar     = document.getElementById('disk-bar');
const diskText    = document.getElementById('disk-text');
const tempText    = document.getElementById('temp-text');
const ipText      = document.getElementById('ip-text');

let lastStatusText = 'Ready';

function setStatus(text) {
    lastStatusText = text;
    statusInfo.textContent = text;
}

function updatePreview() {
    try {
        const commands = workspaceToCommands(workspace);
        programPreview.textContent = JSON.stringify(commands, null, 2);
    } catch (err) {
        programPreview.textContent = 'Error: ' + err.message;
    }
}

workspace.addChangeListener(updatePreview);
updatePreview();

function barColor(percent, invert = false) {
    if (percent === null || percent === undefined) return '#9ca3af';
    const high = invert ? percent < 25 : percent > 75;
    const mid  = invert ? percent < 50 : percent > 50;
    if (high) return invert ? '#ef4444' : '#ef4444';
    if (mid)  return '#f59e0b';
    return '#10b981';
}

function batteryColor(percent) {
    if (percent === null || percent === undefined) return '#9ca3af';
    if (percent < 20) return '#ef4444';
    if (percent < 40) return '#f59e0b';
    return '#10b981';
}

function setBar(barEl, textEl, percent, label) {
    const pct = percent ?? 0;
    barEl.style.width = pct + '%';
    textEl.textContent = label ?? '--';
}

async function postJSON(url, body) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body)
    });
    if (!response.ok) throw new Error('Server returned ' + response.status);
    return response.json();
}

runButton.addEventListener('click', async () => {
    const commands = workspaceToCommands(workspace);
    if (commands.length === 0) {
        setStatus('Nothing to run. Add some blocks first.');
        return;
    }
    setStatus('Sending program...');
    try {
        const data = await postJSON('/api/run', { commands });
        setStatus('Running (' + data.count + ' command' + (data.count === 1 ? '' : 's') + ')');
    } catch (err) {
        setStatus('Error: ' + err.message);
    }
});

stopButton.addEventListener('click', async () => {
    try {
        await postJSON('/api/stop');
        setStatus('Stopped');
    } catch (err) {
        setStatus('Error: ' + err.message);
    }
});

clearButton.addEventListener('click', () => {
    workspace.clear();
    setStatus('Cleared');
});

async function refreshStatus() {
    try {
        const data = await (await fetch('/api/status')).json();
        if (data.running) {
            const current = data.current?.action ?? '...';
            setStatus('Running: ' + current);
        } else if (lastStatusText.startsWith('Running')) {
            setStatus('Finished');
        }
    } catch (_) {}
}

async function refreshSonar() {
    try {
        const data = await (await fetch('/api/sensor/sonar')).json();
        sonarValue.textContent = typeof data.value === 'number'
            ? data.value.toFixed(1) + ' cm'
            : '--';
    } catch (_) {
        sonarValue.textContent = '--';
    }
}

async function refreshLineSensors() {
    try {
        const data = await (await fetch('/api/sensor/line')).json();
        const values = data.value;
        if (Array.isArray(values)) {
            lsDots.forEach((dot, i) => {
                if (dot) dot.classList.toggle('active', values[i] === true);
            });
        }
    } catch (_) {}
}

async function refreshSystem() {
    try {
        const d = await (await fetch('/api/system')).json();

        const bPct = d.battery_pct;
        batteryBar.style.backgroundColor = batteryColor(bPct);
        setBar(batteryBar, batteryText, bPct,
            d.battery_v !== null ? d.battery_v?.toFixed(1) + 'V' : '--');

        cpuBar.style.backgroundColor = barColor(d.cpu_pct, true);
        setBar(cpuBar, cpuText, d.cpu_pct,
            d.cpu_pct !== null ? d.cpu_pct + '%' : '--');

        if (d.ram) {
            ramBar.style.backgroundColor = barColor(d.ram.percent, true);
            setBar(ramBar, ramText, d.ram.percent,
                d.ram.used_mb + 'M');
        }

        if (d.disk) {
            diskBar.style.backgroundColor = barColor(d.disk.percent, true);
            setBar(diskBar, diskText, d.disk.percent,
                d.disk.used_gb + '/' + d.disk.total_gb + 'G');
        }

        tempText.className = 'stat-value stat-value-wide';
        if (d.cpu_temp_c !== null) {
            tempText.textContent = d.cpu_temp_c + ' °C';
            if (d.cpu_temp_c > 75) tempText.classList.add('temp-hot');
            else if (d.cpu_temp_c > 60) tempText.classList.add('temp-warm');
        } else {
            tempText.textContent = '--';
        }

        ipText.textContent = d.ip ?? '--';

    } catch (_) {}
}

setInterval(refreshStatus, 500);
setInterval(refreshSonar, 500);
setInterval(refreshLineSensors, 250);
setInterval(refreshSystem, 2000);

refreshSystem();

(async () => {
    try {
        const data = await (await fetch('/api/info')).json();
        if (data.mock) {
            document.getElementById('commands-section').style.display = '';
        }
    } catch (_) {}
})();
