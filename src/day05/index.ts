import run from "aocrunner";
import { assert } from "console";
import _ from 'lodash';

interface Instruction
{
    count: number;
    from: number;
    to: number;
}

interface Input
{
    stacks: string[][];
    instructions: Instruction[];
}

const parseInput = (rawInput: string) : Input => 
{
    const [first_lines, last_lines] = rawInput.split("\n\n");
    const lines = first_lines.split("\n").slice(0, -1);
    const stacks : string[][] = [[]];
    _.range(1, lines[lines.length-1].length, 4).map(idx =>
    {
        stacks.push([]);
    });
    lines.forEach(line => {
        return _.range(1, line.length, 4).map((pos, idx) =>
        {
            const c = line.charAt(pos);
            if(c !== undefined && c != ' ')
            {
                stacks[idx+1] = [c].concat(stacks[idx+1 ]);
            }
        })
    });

    let instructions : Instruction[] = [];
    last_lines.split("\n").forEach(line => {
        const tokens = line.split(" ");
        const count = parseInt(tokens[1]);
        const from = parseInt(tokens[3]);
        const to = parseInt(tokens[5]);
        instructions.push({count, from, to})
    });

    return { stacks, instructions};
}

const execute_instruction1 = ({from, to, count} : Instruction, stacks : string[][]) : void =>
{
    for(let i = 0; i < count; ++i)
    {
        const c = stacks[from].pop() || "";
        assert(c != "");
        stacks[to].push(c);
    }
}

const part1 = (rawInput: string) => {
    const {stacks, instructions} = parseInput(rawInput);
    instructions.forEach(instr => {
        execute_instruction1(instr, stacks);
    });

    return stacks.map(s => s[s.length-1]).join("");
};

const execute_instruction2 = ({from, to, count} : Instruction, stacks : string[][]) : void =>
{
        const c = stacks[from].splice(stacks[from].length - count, count);
        stacks[to].push(...c);
}


const part2 = (rawInput: string) => {
    const {stacks, instructions} = parseInput(rawInput);
    instructions.forEach(instr => {
        execute_instruction2(instr, stacks);
    });

    return stacks.map(s => s[s.length-1]).join("");
};

run({
    part1: {
        tests: [
            {
                input: `
    [D]    
[N] [C]    
[Z] [M] [P]
 1   2   3 

move 1 from 2 to 1
move 3 from 1 to 3
move 2 from 2 to 1
move 1 from 1 to 2`,
                expected: "CMZ",
            },
        ],
        solution: part1,
    },
    part2: {
        tests: [
            //{
            //    input: ``,
            //    expected: "",
            //},
        ],
        solution: part2,
    },
    trimTestInputs: false,
    onlyTests: false,
});
