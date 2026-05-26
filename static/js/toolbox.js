const MAZE_TOOLBOX = {
    kind: 'categoryToolbox',
    contents: [
        {
            kind: 'category',
            name: 'Movement',
            colour: 120,
            contents: [
                { kind: 'block', type: 'maze_forward' },
                { kind: 'block', type: 'maze_backward' },
                { kind: 'block', type: 'maze_turn_left' },
                { kind: 'block', type: 'maze_turn_right' },
                { kind: 'block', type: 'maze_strafe_left' },
                { kind: 'block', type: 'maze_strafe_right' },
                { kind: 'block', type: 'maze_stop' }
            ]
        },
        {
            kind: 'category',
            name: 'Sensors',
            colour: 230,
            contents: [
                { kind: 'block', type: 'maze_wait_until_obstacle' },
                { kind: 'block', type: 'maze_wait_until_clear' },
                { kind: 'block', type: 'maze_if_obstacle' }
            ]
        },
        {
            kind: 'category',
            name: 'Control',
            colour: 30,
            contents: [
                { kind: 'block', type: 'maze_wait' },
                { kind: 'block', type: 'maze_repeat' }
            ]
        },
        {
            kind: 'category',
            name: 'Effects',
            colour: 290,
            contents: [
                { kind: 'block', type: 'maze_set_led' },
                { kind: 'block', type: 'maze_beep' }
            ]
        }
    ]
};
