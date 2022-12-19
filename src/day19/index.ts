import run from "aocrunner";
import { assert, time } from "console";
import _ from 'lodash';


export const integers_from_string = (str: string) : number[] => {
    const regexp = /-?\d+/g;
    return [...str.matchAll(regexp)].map(m => parseInt(m[0]))
}

const resource_names = ["ore", "clay", "obsidian", "geode"]

interface Blueprint
{
    id: number;
    robot_costs: number[][];
}

const add = (a: number[], b: number[]) : number[] =>
{
    assert(a.length === b.length);
    return a.map((av, idx) => av + b[idx]);
}

const sub = (a: number[], b: number[]) : number[] =>
{
    assert(a.length === b.length);
    return a.map((av, idx) => av - b[idx]);
}
const scale = (a: number[], s: number) : number[] => 
{
    return a.map(v => v*s);
}

const scaled_add = (a: number[], b: number[], s: number) : number[] =>
{
    return add(a, scale(b, s));
}


const parseInput = (rawInput: string) : Blueprint[] => 
{
    return rawInput.split("\n").map(ln => {
        const ints = integers_from_string(ln);
        return {
            id: ints[0],
            robot_costs: [
                [ints[1], 0, 0, 0],
                [ints[2], 0, 0, 0],
                [ints[3], ints[4], 0, 0],
                [ints[5], 0, ints[6], 0]
            ]
        }
    })
}

const next_build_time = (robots: number[], resources: number[], required: number[]) : number =>
{
    let time = 0;
    for(let idx = 0; idx < robots.length; ++idx)
    {
        const diff = required[idx] - resources[idx]
        if(required[idx] == 0 || diff <= 0)
        {
            // all good
        }
        else if(robots[idx] > 0)
        {
            time = Math.max(time, Math.ceil(diff/robots[idx]))
        } else {
            // cannot be built
            return 1000000000;
        }
    }
    return time;
}

const is_dominated_by = (a: number[], b: number[]) : boolean =>
{
    for(let i = 0; i< a.length; ++i)
    {
        if(a[i] > b[i]) return false;
    }
    return true;
}

const search = (start_time_left: number, blueprint: Blueprint) : number => 
{
    let absolute_best = 0;
    const frontier = new Map<number, number>();
    const search_inner = (time_left: number, robots: number[], resources: number[]) : number =>
    {
        assert(time_left >= 0);
        let resources_at_end = scaled_add(resources, robots, time_left);

        let best = resources_at_end[3]; // do nothing alternative
        const curr_frontier = frontier.get(time_left);
        if(curr_frontier !== undefined && best < curr_frontier)
        {
            return best;
        }
        frontier.set(time_left, best);

        if(best > absolute_best)
        {
            console.log("resources at end", resources_at_end, "robots", robots);
            absolute_best = best;
        }

        let normalised_time = start_time_left + 1 - time_left;
        //now let's look for when we can build robots
        for(let i = blueprint.robot_costs.length-1; i >= 0; --i)
        {
            const r = blueprint.robot_costs[i];
            let next_time = next_build_time(robots, resources, r);
            //console.log(normalised_time, "can build robot", resource_names[i], "in", next_time)
            if(next_time < time_left)
            {
                // we can build it
                let step = next_time + 1; // make sure we step one past so we don't build twice in the same time slot
                let new_time_left = time_left - step;
                let new_robots = robots.slice();
                new_robots[i]++;
                best = Math.max(best, search_inner(time_left - step, new_robots, sub(scaled_add(resources, robots, step), r)));
            }
        }
        return best;
    }
    return search_inner(start_time_left, [1, 0, 0, 0], [0, 0, 0, 0]);
}



const part1 = (rawInput: string) => {
    const blueprints = parseInput(rawInput);
    let gd = blueprints.map(bp => {
        console.log(bp);
        let geodes = search(24, bp);
        console.log(geodes);
        return geodes*bp.id;
    })
    return _.sum(gd);
};

const part2 = (rawInput: string) => {
    const blueprints = parseInput(rawInput).slice(0, 3);
    let gd = blueprints.map(bp => {
        console.log(bp);
        let geodes = search(32, bp);
        console.log(geodes);
        return geodes;
    })
    let prod = 1;
    gd.forEach(element => {
        prod *= element;
    });
    return prod;
};

run({
    part1: {
        tests: [
            {
                input: `Blueprint 1: Each ore robot costs 4 ore. Each clay robot costs 2 ore. Each obsidian robot costs 3 ore and 14 clay. Each geode robot costs 2 ore and 7 obsidian.
Blueprint 2: Each ore robot costs 2 ore. Each clay robot costs 3 ore. Each obsidian robot costs 3 ore and 8 clay. Each geode robot costs 3 ore and 12 obsidian.`,
                expected: 33
            },
        ],
        solution: part1,
    },
    part2: {
        tests: [
            {
                input: `Blueprint 1: Each ore robot costs 4 ore. Each clay robot costs 2 ore. Each obsidian robot costs 3 ore and 14 clay. Each geode robot costs 2 ore and 7 obsidian.
Blueprint 2: Each ore robot costs 2 ore. Each clay robot costs 3 ore. Each obsidian robot costs 3 ore and 8 clay. Each geode robot costs 3 ore and 12 obsidian.`,
                expected: 56*62,
            },
        ],
        solution: part2,
    },
    trimTestInputs: true,
    onlyTests: false,
});
