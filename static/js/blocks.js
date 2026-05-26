Blockly.defineBlocksWithJsonArray([
    {
        type: 'maze_forward',
        message0: 'move forward for %1 seconds at speed %2',
        args0: [
            { type: 'field_number', name: 'DURATION', value: 1, min: 0, max: 30, precision: 0.1 },
            { type: 'field_number', name: 'SPEED', value: 50, min: 0, max: 100 }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 120,
        tooltip: 'Drive the robot forward.'
    },
    {
        type: 'maze_backward',
        message0: 'move backward for %1 seconds at speed %2',
        args0: [
            { type: 'field_number', name: 'DURATION', value: 1, min: 0, max: 30, precision: 0.1 },
            { type: 'field_number', name: 'SPEED', value: 50, min: 0, max: 100 }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 120,
        tooltip: 'Drive the robot backward.'
    },
    {
        type: 'maze_turn_left',
        message0: 'turn left for %1 seconds',
        args0: [
            { type: 'field_number', name: 'DURATION', value: 1, min: 0, max: 30, precision: 0.1 }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 160,
        tooltip: 'Spin in place to the left.'
    },
    {
        type: 'maze_turn_right',
        message0: 'turn right for %1 seconds',
        args0: [
            { type: 'field_number', name: 'DURATION', value: 1, min: 0, max: 30, precision: 0.1 }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 160,
        tooltip: 'Spin in place to the right.'
    },
    {
        type: 'maze_strafe_left',
        message0: 'strafe left for %1 seconds at speed %2',
        args0: [
            { type: 'field_number', name: 'DURATION', value: 1, min: 0, max: 30, precision: 0.1 },
            { type: 'field_number', name: 'SPEED', value: 50, min: 0, max: 100 }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 200,
        tooltip: 'Slide sideways to the left.'
    },
    {
        type: 'maze_strafe_right',
        message0: 'strafe right for %1 seconds at speed %2',
        args0: [
            { type: 'field_number', name: 'DURATION', value: 1, min: 0, max: 30, precision: 0.1 },
            { type: 'field_number', name: 'SPEED', value: 50, min: 0, max: 100 }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 200,
        tooltip: 'Slide sideways to the right.'
    },
    {
        type: 'maze_stop',
        message0: 'stop motors',
        previousStatement: null,
        nextStatement: null,
        colour: 0,
        tooltip: 'Stop the robot immediately.'
    },
    {
        type: 'maze_wait',
        message0: 'wait %1 seconds',
        args0: [
            { type: 'field_number', name: 'DURATION', value: 1, min: 0, max: 60, precision: 0.1 }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 60,
        tooltip: 'Pause before running the next block.'
    },
    {
        type: 'maze_repeat',
        message0: 'repeat %1 times',
        args0: [
            { type: 'field_number', name: 'COUNT', value: 3, min: 1, max: 100 }
        ],
        message1: 'do %1',
        args1: [
            { type: 'input_statement', name: 'BODY' }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 30,
        tooltip: 'Run the inner blocks multiple times.'
    },
    {
        type: 'maze_set_led',
        message0: 'set LED to %1',
        args0: [
            {
                type: 'field_dropdown',
                name: 'COLOR',
                options: [
                    ['red', 'red'],
                    ['orange', 'orange'],
                    ['yellow', 'yellow'],
                    ['green', 'green'],
                    ['blue', 'blue'],
                    ['purple', 'purple'],
                    ['white', 'white'],
                    ['off', 'off']
                ]
            }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 290,
        tooltip: 'Light up the robot LEDs.'
    },
    {
        type: 'maze_beep',
        message0: 'beep for %1 seconds',
        args0: [
            { type: 'field_number', name: 'DURATION', value: 0.2, min: 0, max: 5, precision: 0.05 }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 290,
        tooltip: 'Play a buzzer beep.'
    },
    {
        type: 'maze_wait_until_obstacle',
        message0: 'wait until obstacle within %1 cm',
        args0: [
            { type: 'field_number', name: 'THRESHOLD', value: 30, min: 1, max: 400 }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 230,
        tooltip: 'Pause until something is detected close ahead.'
    },
    {
        type: 'maze_wait_until_clear',
        message0: 'wait until path clear past %1 cm',
        args0: [
            { type: 'field_number', name: 'THRESHOLD', value: 30, min: 1, max: 400 }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 230,
        tooltip: 'Pause until the path ahead is clear.'
    },
    {
        type: 'maze_if_obstacle',
        message0: 'if obstacle within %1 cm',
        args0: [
            { type: 'field_number', name: 'THRESHOLD', value: 30, min: 1, max: 400 }
        ],
        message1: 'then %1',
        args1: [
            { type: 'input_statement', name: 'THEN' }
        ],
        message2: 'else %1',
        args2: [
            { type: 'input_statement', name: 'ELSE' }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: 'Choose a branch based on the sonar distance.'
    }
]);
