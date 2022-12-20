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
    values: Element[];
    zero_element: Element;
    len: number;
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
    seq.values.forEach(elem => {
        assert(elem.next !== elem);
        assert(elem.prev !== elem);
        assert(elem.next.prev === elem);
        assert(elem.prev.next === elem);
    })
}


const to_sequence = (ints: number[]) : Sequence =>
{
    let zero_element : Element|null = null;
    let values: Element[] = []
    for(let v of ints)
    {
        let tmp : NullableElement = { prev: null, next: null, value: v }
        tmp.prev = tmp;
        tmp.next = tmp;
        let elem = tmp as Element;
        if(values.length > 0)
        {
            link(values[values.length-1], elem);
        }
        values.push(elem);
        if(v === 0) zero_element = elem;
    }
    let v2 = values.slice();
    if(zero_element === null) throw "amiga";
    return { values, zero_element, len: values.length }
}

const parseInput = (rawInput: string) : number[] => 
{
    return integers_from_string(rawInput);
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
    return to_arr_elem(seq.zero_element);
}

const step_by = (elem: Element, step: number, wrap: number) : Element =>
{
    
    step = step % wrap;
    while(step < -wrap/2) step += wrap;
    while(step > wrap/2) step -= wrap;

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

const mix_step = (seq: Sequence, elem: Element) : void =>
{
    let position = delink(elem);
    
    position = step_by(position, elem.value, seq.len-1);

    link(position, elem);
}



const score = (seq: Sequence) =>
{
    let elem0 = seq.zero_element;
    if(elem0 === undefined) throw "zomg10";

    return (
        step_by(elem0, 1000, seq.len).value + 
        step_by(elem0, 2000, seq.len).value + 
        step_by(elem0, 3000, seq.len).value);
}

const mix_round = (seq: Sequence) =>
{
    for(let elem of seq.values)
    {

        mix_step(seq, elem);
    }
    validate_sequence(seq);
}

const part1 = (rawInput: string) => {
    const ints = parseInput(rawInput);
    const seq = to_sequence(ints);

    mix_round(seq);

    return score(seq);
};

const part2 = (rawInput: string) => {
    const ints = parseInput(rawInput).map(v => v * 811589153);
    const seq = to_sequence(ints);

    for(let i = 0; i < 10; ++i)
    {
        mix_round(seq);
    }

    return score(seq);
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
            {
                input: `1
                2
                -3
                3
                -2
                0
                4`,
                expected: 1623178306,
            },
        ],
        solution: part2,
    },
    trimTestInputs: true,
    onlyTests: false,
});
