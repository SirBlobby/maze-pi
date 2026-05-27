const modal          = document.getElementById('programs-modal');
const programsButton = document.getElementById('programs-button');
const modalClose     = document.getElementById('modal-close');
const saveNameInput  = document.getElementById('save-name-input');
const saveBtn        = document.getElementById('save-btn');
const exportBtn      = document.getElementById('export-btn');
const importBtn      = document.getElementById('import-btn');
const importInput    = document.getElementById('import-input');
const savesList      = document.getElementById('saves-list');

programsButton.addEventListener('click', openModal);
modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
});

function openModal() {
    modal.classList.add('open');
    loadSavesList();
    saveNameInput.focus();
}

function closeModal() {
    modal.classList.remove('open');
}

async function loadSavesList() {
    savesList.innerHTML = '<div class="saves-empty">Loading...</div>';
    try {
        const data = await (await fetch('/api/saves')).json();
        renderSavesList(data.saves || []);
    } catch (_) {
        savesList.innerHTML = '<div class="saves-empty">Could not reach server.</div>';
    }
}

function renderSavesList(saves) {
    if (saves.length === 0) {
        savesList.innerHTML = '<div class="saves-empty">No saved programs yet.</div>';
        return;
    }
    savesList.innerHTML = '';
    for (const name of saves) {
        const row = document.createElement('div');
        row.className = 'save-item';

        const label = document.createElement('span');
        label.className = 'save-item-name';
        label.textContent = name;

        const loadBtn = document.createElement('button');
        loadBtn.className = 'btn btn-load';
        loadBtn.textContent = 'Load';
        loadBtn.addEventListener('click', () => loadProgram(name));

        const delBtn = document.createElement('button');
        delBtn.className = 'btn btn-delete';
        delBtn.textContent = 'Delete';
        delBtn.addEventListener('click', () => deleteProgram(name, row));

        row.append(label, loadBtn, delBtn);
        savesList.appendChild(row);
    }
}

saveNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveBtn.click();
});

saveBtn.addEventListener('click', async () => {
    const name = saveNameInput.value.trim();
    if (!name) { saveNameInput.focus(); return; }

    const state = Blockly.serialization.workspaces.save(workspace);
    try {
        const res = await fetch('/api/saves/' + encodeURIComponent(name), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(state),
        });
        const data = await res.json();
        if (data.error) { alert(data.error); return; }
        saveNameInput.value = '';
        loadSavesList();
    } catch (_) {
        alert('Failed to save.');
    }
});

async function loadProgram(name) {
    try {
        const res = await fetch('/api/saves/' + encodeURIComponent(name));
        const state = await res.json();
        if (state.error) { alert(state.error); return; }
        Blockly.serialization.workspaces.load(state, workspace);
        closeModal();
    } catch (_) {
        alert('Failed to load program.');
    }
}

async function deleteProgram(name, rowEl) {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
        await fetch('/api/saves/' + encodeURIComponent(name), { method: 'DELETE' });
        rowEl.remove();
        if (savesList.children.length === 0) {
            savesList.innerHTML = '<div class="saves-empty">No saved programs yet.</div>';
        }
    } catch (_) {
        alert('Failed to delete.');
    }
}

exportBtn.addEventListener('click', () => {
    const state = Blockly.serialization.workspaces.save(workspace);
    const name  = saveNameInput.value.trim() || 'maze-pi-program';
    const blob  = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a     = document.createElement('a');
    a.href      = URL.createObjectURL(blob);
    a.download  = name + '.json';
    a.click();
    URL.revokeObjectURL(a.href);
});

importBtn.addEventListener('click', () => importInput.click());

importInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const state = JSON.parse(ev.target.result);
            Blockly.serialization.workspaces.load(state, workspace);
            closeModal();
        } catch (_) {
            alert('Invalid file. Could not load program.');
        }
    };
    reader.readAsText(file);
    importInput.value = '';
});
