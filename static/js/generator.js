const BLOCK_GENERATORS = {
    maze_forward: (b) => ({
        action: 'forward',
        duration: Number(b.getFieldValue('DURATION')),
        speed: Number(b.getFieldValue('SPEED'))
    }),
    maze_backward: (b) => ({
        action: 'backward',
        duration: Number(b.getFieldValue('DURATION')),
        speed: Number(b.getFieldValue('SPEED'))
    }),
    maze_turn_left: (b) => ({
        action: 'turn_left',
        duration: Number(b.getFieldValue('DURATION'))
    }),
    maze_turn_right: (b) => ({
        action: 'turn_right',
        duration: Number(b.getFieldValue('DURATION'))
    }),
    maze_strafe_left: (b) => ({
        action: 'strafe_left',
        duration: Number(b.getFieldValue('DURATION')),
        speed: Number(b.getFieldValue('SPEED'))
    }),
    maze_strafe_right: (b) => ({
        action: 'strafe_right',
        duration: Number(b.getFieldValue('DURATION')),
        speed: Number(b.getFieldValue('SPEED'))
    }),
    maze_stop: () => ({ action: 'stop' }),
    maze_wait: (b) => ({
        action: 'wait',
        duration: Number(b.getFieldValue('DURATION'))
    }),
    maze_set_led: (b) => ({
        action: 'set_led',
        color: b.getFieldValue('COLOR')
    }),
    maze_beep: (b) => ({
        action: 'beep',
        duration: Number(b.getFieldValue('DURATION'))
    }),
    maze_repeat: (b) => ({
        action: 'repeat',
        count: Number(b.getFieldValue('COUNT')),
        body: chainToCommands(b.getInputTargetBlock('BODY'))
    }),
    maze_wait_until_obstacle: (b) => ({
        action: 'wait_until_obstacle',
        threshold: Number(b.getFieldValue('THRESHOLD'))
    }),
    maze_wait_until_clear: (b) => ({
        action: 'wait_until_clear',
        threshold: Number(b.getFieldValue('THRESHOLD'))
    }),
    maze_if_obstacle: (b) => ({
        action: 'if_obstacle',
        threshold: Number(b.getFieldValue('THRESHOLD')),
        body: chainToCommands(b.getInputTargetBlock('THEN')),
        else_body: chainToCommands(b.getInputTargetBlock('ELSE'))
    })
};

function blockToCommand(block) {
    if (!block || block.isInsertionMarker()) {
        return null;
    }
    const generator = BLOCK_GENERATORS[block.type];
    if (!generator) {
        return null;
    }
    return generator(block);
}

function chainToCommands(firstBlock) {
    const commands = [];
    let current = firstBlock;
    while (current) {
        const command = blockToCommand(current);
        if (command) {
            commands.push(command);
        }
        current = current.getNextBlock();
    }
    return commands;
}

function workspaceToCommands(workspace) {
    const topBlocks = workspace.getTopBlocks(true);
    const commands = [];
    for (const block of topBlocks) {
        for (const command of chainToCommands(block)) {
            commands.push(command);
        }
    }
    return commands;
}
