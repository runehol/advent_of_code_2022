import run from "aocrunner";
import _, { min } from 'lodash';

type Direction = "<" | ">";

const parseInput = (rawInput: string) : Direction[] => 
{
    return rawInput.split("") as Direction[];
}

type Position = [number, number];

interface Brick
{
    width: number;
    positions: Position[]
}
// y points upwards
const all_bricks : Brick[] = [
    { // -
        width: 4,
        positions: [[0,0], [1,0], [2,0], [3,0]]
    },
    { // +
        width: 3,
        positions: [[1,0], [0, 1], [1,1], [2, 1], [1, 2]]
    },
    { // _|
        width: 3,
        positions: [[0,0], [1,0], [2,0], [2,1], [2,2]]
    },
    { // |
        width: 1,
        positions: [[0,0], [0,1], [0, 2], [0, 3]]
    },
    { // #
        width: 2,
        positions: [[0,0], [1,0], [0,1], [1,1]]
    }


]

interface Board
{
    width: number;
    max_piece_height: number;
    cleaned_until_height: number;
    pieces: Set<number>;
}

const init_board = () : Board =>
{
    const width = 7;
    const max_piece_height = 0;
    const cleaned_until_height = 0;
    const pieces = new Set<number>();
    for(let x = 0; x < width; ++x)
    {
        pieces.add(map_pos([x, 0]));
    }
    return {width, max_piece_height, pieces, cleaned_until_height}
}

const map_pos = (p:Position) : number => p[0] + p[1]*10

const piece_collides = (p:Position, b:Board) => b.pieces.has(map_pos(p));

const brick_collides = (brick_position:Position, brick:Brick, b:Board) : boolean =>
{
    for(let i = 0; i < brick.positions.length; ++i)
    {
        const p = brick.positions[i];
        if(piece_collides([brick_position[0]+p[0], brick_position[1]+p[1]], b)) return true;
    }
    return false;
}

const place_piece = (p:Position, b:Board) : void =>
{
    b.pieces.add(map_pos(p));
    b.max_piece_height = Math.max(b.max_piece_height, p[1]);
}

const clean_board = (b: Board) : void =>
{
    const min_usable_height =  b.max_piece_height-50;
    for(let y = b.cleaned_until_height; y < min_usable_height; ++y)
    {
        for(let x = 0; x < b.width; ++x)
        {
            b.pieces.delete(map_pos([x, y]));
        }
    }
    b.cleaned_until_height= min_usable_height;
}

const place_brick = (brick_position:Position, brick:Brick, b:Board) : void =>
{
    brick.positions.forEach(p => {
        place_piece([brick_position[0]+p[0], brick_position[1]+p[1]], b);
    });
    clean_board(b);
}

const show_board = (b:Board) =>
{
    let width = b.width;
    for(let y = b.max_piece_height; y >= 1; --y)
    {
        let s = "|";
        for(let x = 0; x < width; ++x)
        {
            s += (piece_collides([x, y], b)) ? "#" : "."
        }
        s += "|";
        console.log(s);
    }
    console.log("+-------+")
}

const simulate = (jet_pattern: Direction[], n_bricks_to_drop: number) : Board =>
{
    let b = init_board();
    let tick = 0;
    for(let brick_idx = 0; brick_idx < n_bricks_to_drop; ++brick_idx)
    {
        if(brick_idx % 100000 == 0)
            console.log("brick", brick_idx)
        const brick = all_bricks[brick_idx % all_bricks.length];
        let pos: Position = [2, b.max_piece_height+4]
        while(true)
        {
            //console.log("after mov", pos);
            const jet_direction = jet_pattern[tick%jet_pattern.length];
            ++tick;

            let jetted_pos : Position = [pos[0], pos[1]];
            switch(jet_direction)
            {
            case '<':
                if(pos[0] > 0) --jetted_pos[0];
                break;
            case '>':
                if(pos[0] + brick.width < b.width) ++jetted_pos[0];
                break;
            }
            if(!brick_collides(jetted_pos, brick, b)) pos = jetted_pos;

            //console.log("after wind", pos);
            const new_pos : Position = [pos[0], pos[1]-1];
            if(brick_collides(new_pos, brick, b))
            {
                place_brick(pos, brick, b);
                //show_board(b);
                break;
            } else {
                pos = new_pos;
            }
        }
    }
    return b;
}



const part1 = (rawInput: string) => {
    const jet_pattern = parseInput(rawInput);
    const board = simulate(jet_pattern, 2022);
    //show_board(board);
    return board.max_piece_height;
};

const part2 = (rawInput: string) => {
    const jet_pattern = parseInput(rawInput);
    const board = simulate(jet_pattern, 1000000000000);
    //show_board(board);
    return board.max_piece_height;
};

run({
    part1: {
        tests: [
            {
                input: `>>><<><>><<<>><>>><<<>>><<<><<<>><>><<>>`,
                expected: 3068, 
            },
        ],
        solution: part1,
    },
    part2: {
        tests: [
            /*{
                input: `>>><<><>><<<>><>>><<<>>><<<><<<>><>><<>>`,
                expected: 1514285714288, 
            },*/
        ],
        solution: part2,
    },
    trimTestInputs: true,
    onlyTests: false,
});
