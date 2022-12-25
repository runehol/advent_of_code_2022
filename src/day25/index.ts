import run from "aocrunner";
import { assert } from "console";
import _ from 'lodash';

const parseInput = (rawInput: string) => 
{
    return rawInput.split("\n");
}

const digit_lut = [["0", 0], ["1", 1], ["2", 2], ["=", -2], ["-", -1]] as const;

const digit_map = new Map<string, number>(digit_lut)


const snafu_to_dec = (s: string) : number =>
{
    let num = 0;
    let slen = s.length;
    for(let i = 0; i < slen; ++i)
    {
        let p = slen - 1 - i;
        const v = digit_map.get(s[i]);
        if(v === undefined) throw "zomg";
        num += v * Math.pow(5, p);
    }
    assert(dec_to_snafu(num) == s);
    return num;
}

const dec_to_snafu = (n: number) : string =>
{

    let mod = n % 5;
    if(mod < 0) mod += 5;
    const lut = digit_lut[mod];
    //console.log(n, mod, lut)
    assert((n - lut[1]) % 5 == 0)
    const remainder = (n - lut[1])/5;
    if(remainder != 0) return dec_to_snafu(remainder) + lut[0];
    return lut[0];
}

const part1 = (rawInput: string) => {
    const input = parseInput(rawInput);
    let nums = input.map(snafu_to_dec);
    const sum = _.sum(nums);

    let res =  dec_to_snafu(sum);
    assert(snafu_to_dec(res) == sum);
    return res;
};

const part2 = (rawInput: string) => {
    const input = parseInput(rawInput);

    return;
};

run({
    part1: {
        tests: [
            {
                input: `1=-0-2
12111
2=0=
21
2=01
111
20012
112
1=-1=
1-12
12
1=
122`,
                expected: "2=-1=0",
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
