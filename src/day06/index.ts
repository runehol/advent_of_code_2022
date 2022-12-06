import run from "aocrunner";
import _ from 'lodash';

const parseInput = (rawInput: string) => 
{
    return rawInput;
}

const find_sequence = (input: string, len: number) => {
    for(let pos = len; pos <= input.length; ++pos)
    {
        const preamble = input.slice(pos-len, pos);
        const unique_letters = new Set(preamble);
        if(unique_letters.size == len)
        {
            return pos;
        }
        
    }
    return -1;

}

const part1 = (rawInput: string) => {
    const input = parseInput(rawInput);
    return find_sequence(input, 4);
};

const part2 = (rawInput: string) => {
    const input = parseInput(rawInput);
    return find_sequence(input, 14);
};

run({
    part1: {
        tests: [
            //{
            //    input: ``,
            //    expected: "",
            //},
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
