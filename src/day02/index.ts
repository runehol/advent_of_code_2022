import run from "aocrunner";
import { assert } from "console";
import _ from 'lodash';

const parseInput = (rawInput: string) =>
{
    return _(rawInput).split("\n").map((v:string) => v.split(" ")).value()
}

//0 Rock
//1 Paper
//2 Scissor
const remap_second = (guide: string[][], map: Map<string, number>) : number[][] =>
{
    return _(guide).map( (v) => [v[0].charCodeAt(0) - 65, map.get(v[1])||0]).value()
}


const score_round = (round: number[]) : number => 
{
    let [a, b] = round;
    let score = b+1;
    if(a == b)
    {
        score += 3;
    } else if(b === (a+1)%3)
    {
        score += 6;
    }
    return score;
}

const part1 = (rawInput: string) => {
    const input = parseInput(rawInput);
    const mapping: Map<string, number> = new Map([
        ['X', 0],
        ['Y', 1],
        ['Z', 2],
      ]);
    const rounds = remap_second(input, mapping);
    const final_score = _(rounds).map(score_round).sum();
    return final_score;
};



const pick_desired_moves = (guide: string[][]) : number[][] =>
{
    return _(guide).map( 
        (v) => 
        {
            const a = v[0].charCodeAt(0)-65;
            const strat = v[1].charCodeAt(0)-"Y".charCodeAt(0);
            let b = (a+strat+3)%3;
            assert(b >= 0 && b <= 2, `got ${v}, decided on ${a} ${b}`);
            return [a, b];
        }).value()
}



const part2 = (rawInput: string) => {
    const input = parseInput(rawInput);
    const rounds = pick_desired_moves(input);
    const final_score = _(rounds).map(score_round).sum();
    return final_score;
};

run({
    part1: {
        tests: [
            {
                input: `A Y\nB X\nC Z\n`,
                expected: 15,
            },
            {
                input: `A Y\n`,
                expected: 8,
            },
            {
                input: `B X\n`,
                expected: 1,
            },
            {
                input: `C Z\n`,
                expected: 6,
            },
          ],
        solution: part1,
    },
    part2: {
        tests: [
            {
                input: `A Y\nB X\nC Z\n`,
                expected: 12,
            },
        ],
        solution: part2,
    },
    trimTestInputs: true,
    onlyTests: false,
});
