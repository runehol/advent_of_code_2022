import { ICompare, PriorityQueue } from "@datastructures-js/priority-queue";
import run from "aocrunner";
import { assert } from "console";
import _ from 'lodash';


interface Position
{
    x: number;
    y: number;
    t: number;
};


interface Blizzard
{
    start_pos: Position;
    delta_x: number;
    delta_y: number;
}

interface Board
{
    height: number;
    width: number;
    start: Position;
    end: Position;
    blizzards: Blizzard[];
    blizzards_at_x: Blizzard[][];
    blizzards_at_y: Blizzard[][];
}

const pos_at_time = (blizzard: Blizzard, t:number, b: Board) : Position =>
{
    const { width, height } = b;
    let y = (blizzard.start_pos.y + t*blizzard.delta_y)% height;
    if(y < 0) y += height;
    assert(y >= 0 && y < height);

    let x = (blizzard.start_pos.x + t*blizzard.delta_x)% width;
    if(x < 0) x += width;
    assert(x >= 0 && x < width);
    return {x, y, t};
}

function make_2d_array<T>(n: number)
{
    const arr: T[][] = [];
    for(let i = 0; i < n; ++i)
    {
        arr.push([]);
    }
    return arr;
}

const parseInput = (rawInput: string) : Board => 
{
    const lines = rawInput.split("\n");
    const height = lines.length-2;
    const width = lines[0].length-2;
    const blizzards : Blizzard[] = [];
    const blizzards_at_x = make_2d_array<Blizzard>(width);
    const blizzards_at_y = make_2d_array<Blizzard>(width);
    
    lines.slice(1,-1).forEach((ln, y) => ln.slice(1, -1).split("").forEach((ch, x) => 
    {
        let delta: number[]|undefined = undefined;
        switch(ch)
        {
        case '<':
            delta = [ 0, -1];
            break;
        case '>':
            delta = [ 0,  1];
            break;
        case '^':
            delta = [-1,  0];
            break;
        case 'v':
            delta = [ 1,  0];
            break;
        case '.':
            break;
        default:
            throw "undefined map v" + ch;
        }

        if(delta !== undefined)
        {
            const start_pos : Position = {x, y, t:0};
            const blizzard : Blizzard = { start_pos, delta_x:delta[1], delta_y:delta[0]};
            blizzards.push(blizzard);
            if(delta[0] === 0)
            {
                blizzards_at_y[y].push(blizzard);
            }
            if(delta[1] === 0)
            {
                blizzards_at_x[x].push(blizzard);
            }

        }
    }));
    const start : Position = {x: 0, y:-1, t:0};
    const end : Position = {x: width-1, y:height, t:0};

    return { height, width, start, end, blizzards, blizzards_at_x, blizzards_at_y }
}

const neighbour_moves : Position[] = [
    {x: -1, y:  0, t: 1},
    {x:  1, y:  0, t: 1},
    {x:  0, y: -1, t: 1},
    {x:  0, y:  1, t: 1},
    {x:  0, y:  0, t: 1}
]

interface Candidate {
    position: Position;
    f_score: number;
}

const compare_candidates: ICompare<Candidate> = (a: Candidate, b: Candidate) => 
{
    // lowest g scores first
    return a.f_score < b.f_score ? -1 : 1;
};

type H = (p: Position) => number;
type D = (from: Position, to: Position) => number;

const infinity = 1<<30;

const stringify_key = (pos:Position) =>
{
    return "x="+pos.x + ",y=" + pos.y + ",t=" + pos.t;
}

const lookup = (map:Map<string, number>, key:Position) =>
{
    return map.get(stringify_key(key)) ?? infinity;
}

const insert = (map:Map<string, number>, key:Position, value:number) =>
{
    map.set(stringify_key(key), value);
}

const manhattan_distance_xy_only = (a:Position, b:Position) => 
{
    return Math.abs(b.y - a.y) + Math.abs(b.x - a.x);
}




const add = (a:Position, b:Position) : Position =>
{
    return {x:a.x+b.x, y:a.y+b.y, t:a.t+b.t}
}

const a_star = (starts: Position[], goal: Position, h:H, d:D) : number =>
{
    const open_set = new PriorityQueue<Candidate>(compare_candidates);
    const g_score = new Map<string, number>;
    starts.forEach(start => {
        open_set.enqueue({position:start, f_score:h(start)});        
        insert(g_score, start, 0);
    });



    const came_from = new Map<string, Position>;


    while(!open_set.isEmpty())
    {
        const {position: current} = open_set.pop();
        if(manhattan_distance_xy_only(current, goal) == 0)
        {
            return current.t;
        }


        neighbour_moves.forEach(move => {
            const neighbour : Position = add(current, move);
            const tentative_g_score = lookup(g_score, current) + d(current, neighbour);
            if(tentative_g_score < lookup(g_score, neighbour))
            {
                came_from.set(stringify_key(neighbour), current);
                insert(g_score, neighbour, tentative_g_score);
                const neighbour_f = tentative_g_score + h(neighbour);
                open_set.push({position: neighbour, f_score: neighbour_f});
            }
            
        });
    }

}


const find_route = (b: Board, start: Position, end: Position) : number =>
{
    const h:H = (pos:Position) =>
    {
        return manhattan_distance_xy_only(pos, end)
    }


    const d:D = (from: Position, to: Position) =>
    {
        if(manhattan_distance_xy_only(to, b.start) == 0)
        {
            return 1;
        }
        if(manhattan_distance_xy_only(to, b.end) == 0)
        {
            return 1;
        }

        //not the start and end positions, the only ones allowed outside the main board
        if(to.y < 0 || to.y >= b.height) return infinity;
        if(to.x < 0 || to.x >= b.width) return infinity;
        //assumes we'll only be called for neighbouring positions
        let cost = 1;
        const t = to.t;

        const consider = (bl:Blizzard) =>
        {
            const p = pos_at_time(bl, t, b);
            if(p.x === to.x && p.y === to.y)
            {
                cost = infinity;
            }
        }

        b.blizzards_at_x[to.x].forEach(consider);
        b.blizzards_at_y[to.y].forEach(consider);
        return cost;
    }

    return a_star([start], end, h, d);

}



const part1 = (rawInput: string) => {
    const b = parseInput(rawInput);
    return find_route(b, b.start, b.end);
};

const part2 = (rawInput: string) => {
    const b = parseInput(rawInput);
    const t1 = find_route(b, {x:b.start.x, y:b.start.y, t:0}, b.end);
    const t2 = find_route(b, {x:b.end.x, y:b.end.y, t:t1}, b.start);
    const t3 = find_route(b, {x:b.start.x, y:b.start.y, t:t2}, b.end);

    return t3;
};

run({
    part1: {
        tests: [
            {
                input: `#.######
#>>.<^<#
#.<..<<#
#>v.><>#
#<^v^^>#
######.#`,
                expected: 18,
            },
        ],
        solution: part1,
    },
    part2: {
        tests: [
            {
                input: `#.######
#>>.<^<#
#.<..<<#
#>v.><>#
#<^v^^>#
######.#`,
                expected: 54,
            },
        ],
        solution: part2,
    },
    trimTestInputs: true,
    onlyTests: false,
});
