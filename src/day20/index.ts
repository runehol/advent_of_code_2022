import run from "aocrunner";
import { assert } from "console";
import _ from 'lodash';
import { integers_from_string } from '../utils/index.js'


const parseInput = (rawInput: string) => 
{
    return integers_from_string(rawInput);
}

const mix_step = (arr:number[], elem: number) : number[] =>
{
    const pos = arr.indexOf(elem);
    assert(pos != -1);
    let adj_pos = (pos+elem+arr.length-1)%(arr.length-1);
    if(adj_pos > pos)
    {
        //console.log("a", pos, adj_pos);
        return arr.slice(0, pos).concat(arr.slice(pos+1, adj_pos+1), arr.slice(pos, pos+1), arr.slice(adj_pos+1))
    } else {
        //console.log("b", pos, adj_pos);
        return arr.slice(0, adj_pos).concat(arr.slice(pos, pos+1), arr.slice(adj_pos, pos), arr.slice(pos+1))
    }
}

/*
[0, adj_pos]
[pos, pos+1]
[adj_pos, pos]
[pos+1, end]

[0, pos]
[pos+1, adj_pos]
[pos, pos+1]
[adj_pos, end]
*/

const part1_score = (arr: number[]) =>
{
    const pos0 = arr.indexOf(0);
    const wrap = arr.length;
    return (
        arr[(pos0 + 1000*1)%wrap] + 
        arr[(pos0 + 1000*2)%wrap] + 
        arr[(pos0 + 1000*3)%wrap]
    );
}

const mix_round = (arr: number[], order: number[]) : number[] =>
{
    //console.log(JSON.stringify(arr));
    for(let elem of order)
    {
        //console.log("mixing", elem, arr)
        arr = mix_step(arr, elem);
        //console.log("mixed", elem, JSON.stringify(arr))
    }
    return arr;
}

const part1 = (rawInput: string) => {
    const input = parseInput(rawInput);

    let arr = mix_round(input, input);

    return part1_score(arr); //11388 was too low
};

const part2 = (rawInput: string) => {
    const input = parseInput(rawInput);

    return;
};

run({
    part1: {
        tests: [
            {
                input: `1
                2
                -3
                3
                -2
                0
                4`,
                expected: 3,
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
