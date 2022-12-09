import run from "aocrunner";
import { dir } from "console";
import _, { tail } from 'lodash';

type Direction = "L"|"R"|"U"|"D";

interface Motion
{
    dir: Direction;
    n_steps: number;
}

const parseInput = (rawInput: string) : Motion[] => 
{
    return rawInput.split("\n").map(line => {
        const [ds, ns] = line.split(" ");
        return {
            dir: ds as Direction,
            n_steps: parseInt(ns)
        }
    });
}

interface Position
{
    x: number;
    y: number;
}
const direction_vector = (d: Direction) : Position =>
{
    switch(d)
    {
    case 'L':
        return {x:-1, y: 0};
    case 'R':
        return {x: 1, y: 0};
    case 'U':
        return {x: 0, y: 1};
    case 'D':
        return {x: 0, y:-1};
    }
}

const add = (a: Position, b: Position) : Position => { return {x:a.x+b.x, y:a.y+b.y} };

interface State
{
    rope: Position[];
    visited_tail_positions: Set<string>;
}


const is_apart = (a: Position, b:Position) : boolean =>
{
    if(Math.abs(a.x - b.x) > 1) return true;
    if(Math.abs(a.y - b.y) > 1) return true;
    return false;
}

const move_tail = (head_position:Position, tail_position:Position) : Position =>
{
    if(is_apart(head_position, tail_position))
    {
        tail_position = 
        {
            x: tail_position.x += Math.sign(head_position.x - tail_position.x),
            y: tail_position.y += Math.sign(head_position.y - tail_position.y)
        }
    }
    return tail_position;

}


const step = (state:State, d:Direction) : void =>
{
    state.rope[0] = add(state.rope[0], direction_vector(d));
    for(let i = 1; i < state.rope.length; ++i)
    {
        state.rope[i] = move_tail(state.rope[i-1], state.rope[i]);
    }
    const tail = state.rope[state.rope.length-1];
    state.visited_tail_positions.add(tail.x + ":" + tail.y);
}

const make_initial_state = (rope_length: number) : State =>
{
    const state: State = {rope: [], visited_tail_positions: new Set<string>};
    for(let i = 0; i < rope_length; ++i)
    {
        state.rope.push({x:0, y:0});
    }
    return state;
}

const simulate = (state:State, instructions:Motion[]) : State =>
{
    instructions.forEach(instr => {
        for(let i = 0; i < instr.n_steps; ++i)
        {
            step(state, instr.dir);
        }
    });

    return state;
}


const part1 = (rawInput: string) => {
    const input = parseInput(rawInput);
    const state = simulate(make_initial_state(2), input);
    return state.visited_tail_positions.size;
};

const part2 = (rawInput: string) => {
    const input = parseInput(rawInput);
    const state = simulate(make_initial_state(10), input);
    return state.visited_tail_positions.size;
};

run({
    part1: {
        tests: [
            {
                input: `R 4
U 4
L 3
D 1
R 4
D 1
L 5
R 2`,
                expected: 13,
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
    trimTestInputs: true,
    onlyTests: false,
});
