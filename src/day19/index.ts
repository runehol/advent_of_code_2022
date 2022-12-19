import run from "aocrunner";
import { time } from "console";
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
                [ints[5], 0, ints[5], 0]
            ]
        }
    })
}

const search = (time_left: number, robots: number[], resources: number[], blueprint: Blueprint) : number =>
{
    if(time_left == 0)
    {
        //console.log(time_left, robots, resources, blueprint);
        return resources[3];
    } 
    const next_resources = [resources[0] + robots[0], resources[1] + robots[1], resources[2] + robots[2], resources[3] + robots[3]];

    // now consider building one of the robots
    let best = 0;
    for(let i = blueprint.robot_costs.length-1; i >= 0; --i)
    {
        const r = blueprint.robot_costs[i];
        if(r[0] <= resources[0] && r[1] <= resources[1] && r[2] <= resources[2] && r[3] <= resources[3])
        {
            //console.log(24-time_left, "can build robot collecting", resource_names[i], robots, resources);
            const next_resources_without_robot = [next_resources[0] - r[0], next_resources[1] - r[1], next_resources[2] - r[2], next_resources[3] - r[3]];
            const next_robots = robots.slice();
            next_robots[i] += 1;
            best = Math.max(best, search(time_left-1, next_robots, next_resources_without_robot, blueprint))
            //break;
        }
    }
    //if(best == 0)
    {
        best = Math.max(best, search(time_left-1, robots, next_resources, blueprint)); // do nothing, just tick down the time
    }
    return best;
}

const part1 = (rawInput: string) => {
    const blueprints = parseInput(rawInput);
    let gd = blueprints.map(bp => {
        console.log(bp);
        let geodes = search(23, [1, 0, 0, 0], [0, 0, 0, 0], bp);
        console.log(geodes);
        return geodes*bp.id;
    })
    return _.sum(gd);
};

const part2 = (rawInput: string) => {
    const input = parseInput(rawInput);

    return;
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
            //{
            //    input: ``,
            //    expected: "",
            //},
        ],
        solution: part2,
    },
    trimTestInputs: true,
    onlyTests: true,
});
