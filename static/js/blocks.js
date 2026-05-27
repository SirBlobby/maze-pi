Blockly.defineBlocksWithJsonArray([

    {
        type: 'maze_forward',
        message0: 'move forward %1 sec  speed %2',
        args0: [
            { type: 'field_number', name: 'DURATION', value: 1,  min: 0,  max: 30,  precision: 0.1 },
            { type: 'field_number', name: 'SPEED',    value: 80, min: 50, max: 100 }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 120,
        tooltip: 'Drive the robot forward.'
    },
    {
        type: 'maze_backward',
        message0: 'move backward %1 sec  speed %2',
        args0: [
            { type: 'field_number', name: 'DURATION', value: 1,  min: 0,  max: 30,  precision: 0.1 },
            { type: 'field_number', name: 'SPEED',    value: 80, min: 50, max: 100 }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 120,
        tooltip: 'Drive the robot backward.'
    },
    {
        type: 'maze_turn_left',
        message0: 'turn left %1 sec  speed %2',
        args0: [
            { type: 'field_number', name: 'DURATION', value: 1,  min: 0,  max: 30,  precision: 0.1 },
            { type: 'field_number', name: 'SPEED',    value: 80, min: 50, max: 100 }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 160,
        tooltip: 'Spin left in place. Higher speed = sharper turn.'
    },
    {
        type: 'maze_turn_right',
        message0: 'turn right %1 sec  speed %2',
        args0: [
            { type: 'field_number', name: 'DURATION', value: 1,  min: 0,  max: 30,  precision: 0.1 },
            { type: 'field_number', name: 'SPEED',    value: 80, min: 50, max: 100 }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 160,
        tooltip: 'Spin right in place. Higher speed = sharper turn.'
    },
    {
        type: 'maze_strafe_left',
        message0: 'strafe left %1 sec  speed %2',
        args0: [
            { type: 'field_number', name: 'DURATION', value: 1,  min: 0,  max: 30,  precision: 0.1 },
            { type: 'field_number', name: 'SPEED',    value: 80, min: 50, max: 100 }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 200,
        tooltip: 'Slide sideways to the left.'
    },
    {
        type: 'maze_strafe_right',
        message0: 'strafe right %1 sec  speed %2',
        args0: [
            { type: 'field_number', name: 'DURATION', value: 1,  min: 0,  max: 30,  precision: 0.1 },
            { type: 'field_number', name: 'SPEED',    value: 80, min: 50, max: 100 }
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
        tooltip: 'Run the inner blocks a set number of times.'
    },
    {
        type: 'maze_while_obstacle',
        message0: 'while obstacle within %1 cm',
        args0: [
            { type: 'field_number', name: 'THRESHOLD', value: 30, min: 1, max: 400 }
        ],
        message1: 'do %1',
        args1: [
            { type: 'input_statement', name: 'BODY' }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 30,
        tooltip: 'Keep repeating while the sonar detects something closer than the threshold.'
    },
    {
        type: 'maze_while_clear',
        message0: 'while path clear past %1 cm',
        args0: [
            { type: 'field_number', name: 'THRESHOLD', value: 30, min: 1, max: 400 }
        ],
        message1: 'do %1',
        args1: [
            { type: 'input_statement', name: 'BODY' }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 30,
        tooltip: 'Keep repeating while the path ahead is clear (no obstacle within threshold).'
    },
    {
        type: 'maze_while_line',
        message0: 'while line sensor %1 %2 line',
        args0: [
            {
                type: 'field_dropdown',
                name: 'CHANNEL',
                options: [['1', '1'], ['2', '2'], ['3', '3'], ['4', '4']]
            },
            {
                type: 'field_dropdown',
                name: 'STATE',
                options: [['sees', 'on'], ["doesn't see", 'off']]
            }
        ],
        message1: 'do %1',
        args1: [
            { type: 'input_statement', name: 'BODY' }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 30,
        tooltip: 'Keep repeating while the chosen infrared sensor sees (or does not see) a line.'
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
    },

    {
        type: 'maze_follow_line',
        message0: 'follow line %1 sec  speed %2',
        args0: [
            { type: 'field_number', name: 'DURATION', value: 5,  min: 0,  max: 60,  precision: 0.1 },
            { type: 'field_number', name: 'SPEED',    value: 60, min: 50, max: 100 }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 180,
        tooltip: 'Automatically follow a black line on the floor using all 4 infrared sensors.'
    },
    {
        type: 'maze_wait_until_line',
        message0: 'wait until line sensor %1 %2 line',
        args0: [
            {
                type: 'field_dropdown',
                name: 'CHANNEL',
                options: [['1', '1'], ['2', '2'], ['3', '3'], ['4', '4']]
            },
            {
                type: 'field_dropdown',
                name: 'STATE',
                options: [['sees', 'on'], ["doesn't see", 'off']]
            }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 180,
        tooltip: 'Pause until the chosen infrared sensor detects or stops detecting a line.'
    },
    {
        type: 'maze_if_line',
        message0: 'if line sensor %1 sees line',
        args0: [
            {
                type: 'field_dropdown',
                name: 'CHANNEL',
                options: [['1', '1'], ['2', '2'], ['3', '3'], ['4', '4']]
            }
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
        colour: 180,
        tooltip: 'Run one set of blocks if a line sensor detects a line, otherwise run the other.'
    },

    {
        type: 'maze_set_led',
        message0: 'set LED to %1',
        args0: [
            {
                type: 'field_dropdown',
                name: 'COLOR',
                options: [
                    ['red', 'red'], ['orange', 'orange'], ['yellow', 'yellow'],
                    ['green', 'green'], ['blue', 'blue'], ['purple', 'purple'],
                    ['white', 'white'], ['off', 'off']
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
    }

]);
