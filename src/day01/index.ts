import run from "aocrunner";
import _ from 'lodash'


const parseInput = (rawInput: string) => 
{
    return rawInput.split("\n\n").map((s) => s.split("\n").map( (n) => parseInt(n)))
}

const part1 = (rawInput: string) => {
    const input = parseInput(rawInput);
    const sums = input.map((arr) => _.sum(arr))
    const max = _.max(sums);
    return max;
};

const part2 = (rawInput: string) => {
    const input = parseInput(rawInput);
    const sums = input.map((arr) => _.sum(arr));
    sums.sort((a, b) => b-a);
    return _.sum(sums.slice(0, 3));
};

run({
    part1: {
        tests: [
          // {
          //   input: ``,
          //   expected: "",
          // },
        ],
        solution: part1,
    },
    part2: {
        tests: [
          // {
          //   input: ``,
          //   expected: "",
          // },
        ],
        solution: part2,
    },
    trimTestInputs: true,
    onlyTests: false,
});
