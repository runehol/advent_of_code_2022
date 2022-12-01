import run from "aocrunner";
import _ from 'lodash'


const parseInput = (rawInput: string) : number[][] => 
{
    return _(rawInput.split("\n\n")).map((s:string) => s.split("\n").map( (n:string) => parseInt(n))).value();
}

const part1 = (rawInput: string) : number => {
    return _(parseInput(rawInput)).map((arr:number[]) => _.sum(arr)).max()||0;
};

const part2 = (rawInput: string) : number => {
    return _(parseInput(rawInput)).map((arr) => _.sum(arr)).sort((a, b) => b-a).slice(0, 3).sum();
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
