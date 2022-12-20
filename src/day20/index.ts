import run from "aocrunner";
import { assert } from "console";
import _ from 'lodash';
import { integers_from_string } from '../utils/index.js'


interface NullableElement
{
    prev: NullableElement|null;
    next: NullableElement|null;
    value: number;
}


interface Element
{
    prev: Element;
    next: Element;
    value: number;
}

interface Sequence
{
    lookup: Map<number, Element>;
    values: number[];
}

const link = (before: Element, new_elem: Element) : void =>
{
    assert(new_elem.prev === new_elem);
    assert(new_elem.next === new_elem);
    new_elem.prev = before;
    new_elem.next = before.next;
    before.next = new_elem;
    if(new_elem.next !== null)
    {
        new_elem.next.prev = new_elem;
    }
    assert(new_elem.prev !== new_elem, "new_elem.prev !== new_elem");
    assert(new_elem.next !== new_elem, "new_elem.next !== new_elem");
}

const delink = (elem: Element) : Element =>
{
    assert(elem.next.prev === elem);
    assert(elem.prev.next === elem);
    const before = elem.prev;
    const after = elem.next;
    if(before === null || after === null) throw "zomg";
    before.next = after;
    after.prev = before;
    elem.prev = elem;
    elem.next = elem;
    return before;
}

const validate_sequence = (seq: Sequence) =>
{
    Array.from(seq.lookup.values()).forEach(elem => {
        assert(elem.next !== elem);
        assert(elem.prev !== elem);
        assert(elem.next.prev === elem);
        assert(elem.prev.next === elem);
    })
}

const parseInput = (rawInput: string) : Sequence => 
{
    const values = integers_from_string(rawInput);
    const lookup = new Map<number, Element>();
    let prev : Element|null = null;
    for(let v of values)
    {
        let tmp : NullableElement = { prev: null, next: null, value: v }
        tmp.prev = tmp;
        tmp.next = tmp;
        let elem = tmp as Element;
        lookup.set(v, elem);
        if(prev !== null)
        {
            link(prev, elem);
        }
        prev = elem;
    }
    let v2 = values.slice();
    v2.sort();
    console.log(v2);
    return { lookup, values }
}

const to_arr_elem = (start: Element) : number[] =>
{
    let arr : number[] = [start.value];

    let elem = start.next;
    while(elem != start)
    {
        if(elem === null) throw "zomg3";
        arr.push(elem.value);
        assert(elem.next != null && elem.next.prev == elem);
        elem = elem.next;
    }

    return arr;
}

const to_arr = (seq: Sequence) : number[] => 
{
    const start = seq.lookup.get(0);
    if(start === undefined) throw "zomg2";
    return to_arr_elem(start);
}

const step_by = (elem: Element, step: number) : Element =>
{
    while(step > 0)
    {
        elem = elem.next;
        --step;
    }
    while(step < 0)
    {
        elem = elem.prev;
        ++step;
    }
    return elem;
}

const mix_step = (seq: Sequence, v: number) : void =>
{
    const elem = seq.lookup.get(v);
    if(elem === undefined) throw "zomg4";
    let position = delink(elem);
    
    position = step_by(position, v);

    link(position, elem);
}



const part1_score = (seq: Sequence) =>
{
    let elem0 = seq.lookup.get(0);
    if(elem0 === undefined) throw "zomg10";

    return (
        step_by(elem0, 1000).value + 
        step_by(elem0, 2000).value + 
        step_by(elem0, 3000).value);
}

const mix_round = (seq: Sequence) =>
{
    //console.log(JSON.stringify(to_arr(seq)));
    for(let elem of seq.values)
    {

        mix_step(seq, elem);
        //console.log("mixed", elem, JSON.stringify(to_arr(seq)))
    }
    validate_sequence(seq);
}

const part1 = (rawInput: string) => {
    const seq = parseInput(rawInput);

    mix_round(seq);

    return part1_score(seq); //11388 was too low, -8373 also wrong
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
