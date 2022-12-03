import run from "aocrunner";
import { assert } from "console";
import _ from 'lodash';

const char_to_pri = (c:string) : number =>
{
    assert(c.length == 1);
    const code = c.charCodeAt(0);
    if(code >= 96)
    {
        return code - 96;
    } else {
        return code - 64 + 26;
    }
}

const parseInput = (rawInput: string) : number[][] => 
{
    return (_(rawInput)
    .split("\n")
    .map((line:string) => _(line).map(char_to_pri).value())
    .value())
}
function intersect<T>(a_:T[], b_:T[]) : T[]
{
    const a = new Set(a_);
    const b = new Set(b_);
    return [...a].filter(e => b.has(e));
}

function halves<T>(v: T[]) : T[][]
{
    assert(v.length % 2 == 0);
    const half_len = v.length / 2;
    return [v.slice(0, half_len), v.slice(half_len)]

}

const part1 = (rawInput: string) => {
    const input = parseInput(rawInput);
    return (_(input)
    .map(halves)
    .map((compartments : number[][]) : number[] => {
        return intersect(compartments[0], compartments[1]);
    })
    .map(s => _(s).sum()).sum());
};

function groups_of_three<T>(input: T[]): T[][]
{
    assert(input.length % 3 == 0);
    return _.range(0, input.length, 3).map(pos => input.slice(pos, pos+3))
}

const part2 = (rawInput: string) => {
    const input = parseInput(rawInput);
    return (_(groups_of_three(input)).map((g : number[][]) => {
        const common = _(g).reduce(intersect, g[0]);
        assert(common.length == 1);
        return common[0];
    }).sum())
};

run({
    part1: {
        tests: [
            {
                input: `vJrwpWtwJgWrhcsFMMfFFhFp
jqHRNqRjqzjGDLGLrsFMfFZSrLrFZsSL
PmmdzqPrVvPwwTWBwg
wMqvLMZHhHMvwLHjbvcjnnSBnvTQFn
ttgJtRGJQctTZtZT
CrZsJsPPZsGzwwsLwLmpwMDw`,
                expected: 157,
            },
        ],
        solution: part1,
    },
    part2: {
        tests: [
            {
                input: `vJrwpWtwJgWrhcsFMMfFFhFp
jqHRNqRjqzjGDLGLrsFMfFZSrLrFZsSL
PmmdzqPrVvPwwTWBwg
wMqvLMZHhHMvwLHjbvcjnnSBnvTQFn
ttgJtRGJQctTZtZT
CrZsJsPPZsGzwwsLwLmpwMDw`,
                expected: 70,
            },
        ],
        solution: part2,
    },
    trimTestInputs: true,
    onlyTests: false,
});
