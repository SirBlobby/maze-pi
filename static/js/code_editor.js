const STARTER_CODE =
`print('Starting...')

forward(1, 80)
turn_right(0.8, 100)
forward(1, 80)

set_led('green')
beep(0.2)
print('Done!')
`;

const runBtn   = document.getElementById('run-btn');
const stopBtn  = document.getElementById('stop-btn');
const clearBtn = document.getElementById('clear-btn');
const outputEl = document.getElementById('output');
const statusEl = document.getElementById('run-status');

let pollTimer        = null;
let lastOutputLength = 0;
let errorShown       = false;

const editor = cm6.createEditor(
    document.getElementById('editor'),
    STARTER_CODE,
    () => handleRun()
);

runBtn.addEventListener('click',  () => handleRun());
stopBtn.addEventListener('click', () => handleStop());
clearBtn.addEventListener('click', () => handleClear());

async function handleRun() {
    handleClear();
    setStatus('Running…');
    runBtn.disabled = true;
    try {
        await postJSON('/api/run_code', { code: cm6.getCode(editor) });
        startPolling();
    } catch (err) {
        setStatus('Error: ' + err.message);
        runBtn.disabled = false;
    }
}

async function handleStop() {
    stopPolling();
    try {
        await postJSON('/api/stop');
        setStatus('Stopped');
    } catch (err) {
        setStatus('Error: ' + err.message);
    }
    runBtn.disabled = false;
}

function handleClear() {
    outputEl.innerHTML = '';
    lastOutputLength   = 0;
    errorShown         = false;
    setStatus('Ready');
}

function setStatus(text) {
    statusEl.textContent = text;
}

function startPolling() {
    stopPolling();
    pollTimer = setInterval(poll, 300);
}

function stopPolling() {
    if (pollTimer !== null) {
        clearInterval(pollTimer);
        pollTimer = null;
    }
}

async function poll() {
    try {
        const data = await (await fetch('/api/code/status')).json();
        appendNewLines(data.output, data.error);
        if (!data.running) {
            stopPolling();
            runBtn.disabled = false;
            setStatus(data.error ? 'Error' : 'Finished');
        }
    } catch (_) {}
}

function appendNewLines(lines, error) {
    for (let i = lastOutputLength; i < lines.length; i++) {
        const div = document.createElement('div');
        div.className = 'output-line';
        div.textContent = lines[i];
        outputEl.appendChild(div);
    }
    lastOutputLength = lines.length;

    if (error && !errorShown) {
        const div = document.createElement('div');
        div.className = 'output-line output-error';
        div.textContent = error;
        outputEl.appendChild(div);
        errorShown = true;
    }

    outputEl.scrollTop = outputEl.scrollHeight;
}

async function postJSON(url, body) {
    const res = await fetch(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
}
