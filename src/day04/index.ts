import run from "aocrunner";
import _ from 'lodash';

const parseInput = (rawInput: string) : Range[][] => 
{
   return ( _(rawInput)
   .split("\n")
   .map((line:string) =>
    line.split(",").map(p => {
        const [smin, smax] = p.split("-");
        const min = parseInt(smin);
        const max = parseInt(smax);
        return { min, max };
    }))
   ).value();
}

interface Range
{
    min: number;
    max: number;
};

const contains = (larger:Range, smaller:Range) : boolean =>
{
    return larger.min <= smaller.min && larger.max >= smaller.max;
}

const overlaps = (a:Range, b:Range) : boolean =>
{
    return Math.max(a.min, b.min) <= Math.min(a.max, b.max);
}

const part1 = (rawInput: string) => {
    const input = parseInput(rawInput);
    return (_(input)
    .map(elf_pair => {
        const [a, b] = elf_pair;
        if(contains(a, b) || contains(b, a)) return 1;
        return 0;
    }).sum()
    )
};

const part2 = (rawInput: string) => {
    const input = parseInput(rawInput);
    return (_(input)
    .map(elf_pair => {
        const [a, b] = elf_pair;
        if(overlaps(a, b)) return 1;
        return 0;
    }).sum()
    )
};

run({
    part1: {
        tests: [
            {
                input: `2-4,6-8
                2-3,4-5
                5-7,7-9
                2-8,3-7
                6-6,4-6
                2-6,4-8`,
                expected: 2,
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
