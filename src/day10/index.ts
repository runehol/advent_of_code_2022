import run from "aocrunner";
import _ from 'lodash';

type Opcode = "noop"|"addx";

interface Instruction
{
    opcode:Opcode;
    args: number[];
}

const parseInput = (rawInput: string) : Instruction[] => 
{
    return rawInput.split("\n").map(line =>
        {
            const tokens = line.split(" ");
            const args = tokens.slice(1).map(parseInt);
            const opcode = tokens[0] as Opcode;
            return {opcode, args}
        });
}

interface CpuState
{
    pc: number;
    x: number;
    cycle: number;
    instructions: Instruction[];
}

const init_cpu_state = (instructions: Instruction[]) : CpuState =>
{
    return {
        pc: 0,
        x: 1,
        cycle: 1,
        instructions
    }
}
type Callback = (state: CpuState) => void;

const simulate = (state: CpuState, cycle_callback:Callback) : void =>
{
    cycle_callback(state);
    while(state.pc < state.instructions.length)
    {
        const instr = state.instructions[state.pc];
        switch(instr.opcode)
        {
        case 'noop':
            break;
        case 'addx':
            ++state.cycle;
            cycle_callback(state);

            state.x += instr.args[0];
            break;       

        }
        ++state.cycle;
        ++state.pc;
        cycle_callback(state);
    }
}



const part1 = (rawInput: string) => {
    const instructions = parseInput(rawInput);

    let signal_strength = 0;
    const callback = (state:CpuState) : void =>
    {
        if((state.cycle-20)%40 == 0)
        {
            signal_strength += state.cycle * state.x;
        }

    }
    simulate(init_cpu_state(instructions), callback);

    return signal_strength;
};


const part2 = (rawInput: string) => {
    const instructions = parseInput(rawInput);

    let display = "";
    const callback = (state:CpuState) : void =>
    {
        let screen_x_pos = (state.cycle-1)%40;

        if(screen_x_pos >= state.x - 1 && screen_x_pos <= state.x+1)
        {
            display += "#";
        } else {
            display += ".";
        }
        if(screen_x_pos == 39) display += "\n"

    }
    simulate(init_cpu_state(instructions), callback);

    console.log(display);

    return "RUAKHBEK";
};

run({
    part1: {
        tests: [
            {
                input:`noop
addx 3
addx -5`,
                expected: 0
            },
            {
                input: `addx 15
addx -11
addx 6
addx -3
addx 5
addx -1
addx -8
addx 13
addx 4
noop
addx -1
addx 5
addx -1
addx 5
addx -1
addx 5
addx -1
addx 5
addx -1
addx -35
addx 1
addx 24
addx -19
addx 1
addx 16
addx -11
noop
noop
addx 21
addx -15
noop
noop
addx -3
addx 9
addx 1
addx -3
addx 8
addx 1
addx 5
noop
noop
noop
noop
noop
addx -36
noop
addx 1
addx 7
noop
noop
noop
addx 2
addx 6
noop
noop
noop
noop
noop
addx 1
noop
noop
addx 7
addx 1
noop
addx -13
addx 13
addx 7
noop
addx 1
addx -33
noop
noop
noop
addx 2
noop
noop
noop
addx 8
noop
addx -1
addx 2
addx 1
noop
addx 17
addx -9
addx 1
addx 1
addx -3
addx 11
noop
noop
addx 1
noop
addx 1
noop
noop
addx -13
addx -19
addx 1
addx 3
addx 26
addx -30
addx 12
addx -1
addx 3
addx 1
noop
noop
noop
addx -9
addx 18
addx 1
addx 2
noop
noop
addx 9
noop
noop
noop
addx -1
addx 2
addx -37
addx 1
addx 3
noop
addx 15
addx -21
addx 22
addx -6
addx 1
noop
addx 2
addx 1
noop
addx -10
noop
noop
addx 20
addx 1
addx 2
addx 2
addx -6
addx -11
noop
noop
noop`,
                expected: 13140,
            },
        ],
        solution: part1,
    },
    part2: {
        tests: [
            {
                input: `addx 15
addx -11
addx 6
addx -3
addx 5
addx -1
addx -8
addx 13
addx 4
noop
addx -1
addx 5
addx -1
addx 5
addx -1
addx 5
addx -1
addx 5
addx -1
addx -35
addx 1
addx 24
addx -19
addx 1
addx 16
addx -11
noop
noop
addx 21
addx -15
noop
noop
addx -3
addx 9
addx 1
addx -3
addx 8
addx 1
addx 5
noop
noop
noop
noop
noop
addx -36
noop
addx 1
addx 7
noop
noop
noop
addx 2
addx 6
noop
noop
noop
noop
noop
addx 1
noop
noop
addx 7
addx 1
noop
addx -13
addx 13
addx 7
noop
addx 1
addx -33
noop
noop
noop
addx 2
noop
noop
noop
addx 8
noop
addx -1
addx 2
addx 1
noop
addx 17
addx -9
addx 1
addx 1
addx -3
addx 11
noop
noop
addx 1
noop
addx 1
noop
noop
addx -13
addx -19
addx 1
addx 3
addx 26
addx -30
addx 12
addx -1
addx 3
addx 1
noop
noop
noop
addx -9
addx 18
addx 1
addx 2
noop
noop
addx 9
noop
noop
noop
addx -1
addx 2
addx -37
addx 1
addx 3
noop
addx 15
addx -21
addx 22
addx -6
addx 1
noop
addx 2
addx 1
noop
addx -10
noop
noop
addx 20
addx 1
addx 2
addx 2
addx -6
addx -11
noop
noop
noop`,
                expected: "RUAKHBEK",
            },        ],
        solution: part2,
    },
    trimTestInputs: true,
    onlyTests: false,
});
