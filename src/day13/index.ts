import run from "aocrunner";
import _ from 'lodash';

interface Pair
{
    left: any;
    right: any;
    index: number;
}

const parseInput = (rawInput: string) : Pair[] => 
{
    return rawInput.split("\n\n").map((chunk, i) => 
        {
            let [left, right] = chunk.split("\n").map(line => eval(line));
            const index = i+1;
            return {left, right, index};
        });
}


const ordered = (left: any, right: any) : number =>
{
    const left_is_num = typeof left === 'number';
    const right_is_num = typeof right === 'number';
    if(left_is_num && right_is_num)
    {
        if(left < right) return -1;
        if(left > right) return 1;
        return 0;
    }
    if(left_is_num) return ordered([left], right);
    if(right_is_num) return ordered(left, [right]);

    //finally, both are arrays
    for(let i = 0; i < Math.max(left.length, right.length); ++i)
    {
        const le = left[i];
        const re = right[i];
        if(typeof le === 'undefined') return -1;
        if(typeof re === 'undefined') return 1;
        const internal_order = ordered(le, re);
        if(internal_order != 0) return internal_order;
    }
    return 0;

}

const part1 = (rawInput: string) => {
    const input = parseInput(rawInput);

    return _(input).filter(pair => {
        return ordered(pair.left, pair.right) < 0
    }).map(pair => pair.index).sum()
};

const part2 = (rawInput: string) => {
    const input = parseInput(rawInput);
    let packets = _(input).flatMap(pair => [pair.left, pair.right]).value();
    let divider_a = [[2]];
    let divider_b = [[6]];
    packets.push(divider_a, divider_b);
    packets.sort(ordered);
    return (packets.indexOf(divider_a)+1)*(packets.indexOf(divider_b)+1);
};

run({
    part1: {
        tests: [
            {
                input: `[1,1,3,1,1]
[1,1,5,1,1]

[[1],[2,3,4]]
[[1],4]

[9]
[[8,7,6]]

[[4,4],4,4]
[[4,4],4,4,4]

[7,7,7,7]
[7,7,7]

[]
[3]

[[[]]]
[[]]

[1,[2,[3,[4,[5,6,7]]]],8,9]
[1,[2,[3,[4,[5,6,0]]]],8,9]`,
                expected: 13,
            },
        ],
        solution: part1,
    },
    part2: {
        tests: [
            {
                input: `[1,1,3,1,1]
[1,1,5,1,1]

[[1],[2,3,4]]
[[1],4]

[9]
[[8,7,6]]

[[4,4],4,4]
[[4,4],4,4,4]

[7,7,7,7]
[7,7,7]

[]
[3]

[[[]]]
[[]]

[1,[2,[3,[4,[5,6,7]]]],8,9]
[1,[2,[3,[4,[5,6,0]]]],8,9]`,
                expected: 140,
            },
        ],
        solution: part2,
    },
    trimTestInputs: true,
    onlyTests: false,
});
