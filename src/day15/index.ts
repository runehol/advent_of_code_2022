import run from "aocrunner";
import _ from 'lodash';

interface Position
{
    x: number;
    y: number;
}

interface SensorBeacon
{
    sensor: Position;
    beacon: Position;
}


const parseInput = (rawInput: string) : SensorBeacon[] => 
{
    const regex = /Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+)/;
    return rawInput.split("\n").map(line => 
        {
            const m = regex.exec(line);          
            if(m === null) throw "zomg";
            return {
                sensor: {x: parseInt(m[1]), y: parseInt(m[2])},
                beacon: {x: parseInt(m[3]), y: parseInt(m[4])}
            };
        });
}


interface Range
{
    min: number;
    max: number;
}

type RangeSet = Range[];

const init_range_set = (r: Range) : RangeSet => [r];

const subtract = (rs: RangeSet, sr: Range) : RangeSet =>
{
    let res: RangeSet = [];
    rs.forEach(er => {

        // first: below:
        {
            const min = er.min;
            const max = Math.min(er.max, sr.min-1);
            if(min <= max)
            {
                res.push({min, max})
            }
        }

        // then: above:
        {
            const min = Math.max(er.min, sr.max+1);
            const max = er.max
            if(min <= max)
            {
                res.push({min, max})
            }
        }
        
    });
    return res;
}




const count_never_beacon_at_line = (sensor_beacons: SensorBeacon[], line_y: number) : number => 
{
    const never_set = new Set<number>;
    const beacons = new Set<number>;

    sensor_beacons.forEach(sb => {
        const {beacon, sensor} = sb;
        const sb_distance = Math.abs(beacon.x-sensor.x) + Math.abs(beacon.y - sensor.y);
        const lb_distance = Math.abs(line_y - sb.sensor.y);
        
        const x_radius_at_line = sb_distance - lb_distance;
        if(x_radius_at_line >= 0)
        {
            let xmin = sensor.x - x_radius_at_line;
            let xmax = sensor.x + x_radius_at_line;

            for(let x = xmin; x <= xmax; ++x)
            {
                never_set.add(x);
            }
        }
        if(beacon.y == line_y)
        {
            beacons.add(beacon.x);
        }
    });

    const difference = new Set([...never_set].filter(x => !beacons.has(x)))
    return difference.size;
}

const part1 = (rawInput: string) => {
    const input = parseInput(rawInput);

    return count_never_beacon_at_line(input, 2000000);
};

const search_at_line = (sensor_beacons: SensorBeacon[], line_y: number, min_x: number, max_x: number) : number|undefined => 
{
    let possible_range = init_range_set({min: min_x, max: max_x})

    sensor_beacons.forEach(sb => {
        const {beacon, sensor} = sb;
        const sb_distance = Math.abs(beacon.x-sensor.x) + Math.abs(beacon.y - sensor.y);
        const lb_distance = Math.abs(line_y - sb.sensor.y);
        
        const x_radius_at_line = sb_distance - lb_distance;
        if(x_radius_at_line >= 0)
        {
            let xmin = sensor.x - x_radius_at_line;
            let xmax = sensor.x + x_radius_at_line;

            possible_range = subtract(possible_range, {min:xmin, max:xmax});
        }
    });

    if(possible_range.length)
    {
        const x = possible_range[0].min;
        return 4000000*x + line_y;
    }
    return undefined;
}

const search = (input: SensorBeacon[], min: number, max: number) =>
{
    for(let y = min; y <= max; ++y)
    {
        let res = search_at_line(input, y, min, max);
        if(res !== undefined)
        {
            return res;
        }
    }
}

const part2 = (rawInput: string) => {
    const input = parseInput(rawInput);
    return search(input, 0, 4000000);
};

run({
    part1: {
        tests: [
        ],
        solution: part1,
    },
    part2: {
        tests: [
        ],
        solution: part2,
    },
    trimTestInputs: true,
    onlyTests: false,
});
