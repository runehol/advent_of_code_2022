import run from "aocrunner";
import { assert } from "console";
import _ from 'lodash';

type Operation = 'literal'|'+'|'-'|'*'|'/'|'='|'find';

interface Node
{
    name: string;
    op: Operation;
    sub_nodes: string[];
    literal?: number;
}

interface Graph
{
    nodes: Node[];
    lookup: Map<string, Node>;
}

const parseInput = (rawInput: string) : Graph => 
{
    const nodes : Node[] = rawInput.split("\n").map(ln => {
        const [name, rest] = ln.split(": ");
        const elems = rest.split(" ");
        let sub_nodes: string[] = [];
        let op: Operation = 'literal';
        let literal : number|undefined = undefined;
        if(elems.length == 1)
        {
            literal = parseInt(elems[0])
        } else {
            assert(elems.length == 3)
            op = elems[1] as Operation;
            sub_nodes = [elems[0], elems[2]];
        }
        return {
            name,
            op,
            sub_nodes,
            literal
        }

    })

    const lookup = new Map<string, Node>();
    nodes.forEach(node => {
        lookup.set(node.name, node);
    });

    return { nodes, lookup };
}

const eval_node_1 = (name: string, graph: Graph) : number =>
{
    let node = graph.lookup.get(name);
    if(node === undefined) throw "could not find " + name;
    const sub_values = node.sub_nodes.map(n => eval_node_1(n, graph));
    switch(node.op)
    {
    case 'literal':
        if(node.literal === undefined) throw "undefined"
        return node.literal;
    case '+':
        return sub_values[0] + sub_values[1];
    case '-':
        return sub_values[0] - sub_values[1];
    case '*':
        return sub_values[0] * sub_values[1];
    case '/':
        return sub_values[0] / sub_values[1];
    case '=':
        return 0;
    case 'find':
        return 0;
    }
}

const part1 = (rawInput: string) => {
    const graph = parseInput(rawInput);

    return eval_node_1('root', graph);
};

const propagate_node = (node: Node, values: Map<string, number>, graph: Graph) =>
{
    const all_names = [node.name].concat(node.sub_nodes);
    let all_values = all_names.map(nm => values.get(nm));


    switch(node.op)
    {
    case 'literal':
        all_values[0] = node.literal;
        break;
    case '+':
        if(all_values[1] !== undefined && all_values[2] !== undefined)
        {
            all_values[0] = all_values[1] + all_values[2];
        } else if(all_values[0] !== undefined && all_values[2] !== undefined)
        {
            all_values[1] = all_values[0] - all_values[2];
        } else if(all_values[0] !== undefined && all_values[1] !== undefined)
        {
            all_values[2] = all_values[0] - all_values[1];
        }
        break;
    case '-':
        if(all_values[1] !== undefined && all_values[2] !== undefined)
        {
            all_values[0] = all_values[1] - all_values[2];
        } else if(all_values[0] !== undefined && all_values[2] !== undefined)
        {
            all_values[1] = all_values[0] + all_values[2];
        } else if(all_values[0] !== undefined && all_values[1] !== undefined)
        {
            all_values[2] = all_values[1] - all_values[0];
        }
        break;
    case '*':
        if(all_values[1] !== undefined && all_values[2] !== undefined)
        {
            all_values[0] = all_values[1] * all_values[2];
        } else if(all_values[0] !== undefined && all_values[2] !== undefined)
        {
            all_values[1] = all_values[0] / all_values[2];
        } else if(all_values[0] !== undefined && all_values[1] !== undefined)
        {
            all_values[2] = all_values[0] / all_values[1];
        }
        break;
    case '/':
        if(all_values[1] !== undefined && all_values[2] !== undefined)
        {
            all_values[0] = all_values[1] / all_values[2];
        } else if(all_values[0] !== undefined && all_values[2] !== undefined)
        {
            all_values[1] = all_values[0] * all_values[2];
        } else if(all_values[0] !== undefined && all_values[1] !== undefined)
        {
            all_values[2] = all_values[1] / all_values[0];
        }
        break;
    case '=':
        if(all_values[2] !== undefined)
        {
            all_values[1] = all_values[2];
        } else if(all_values[1] !== undefined)
        {
            all_values[2] = all_values[1];
        }
    case 'find':
        break;
    }
    all_values.forEach((v, idx) => {
        if(v !== undefined)
        {
            values.set(all_names[idx], v);
        }
    });
}


const eval_graph = (graph: Graph) : number =>
{
    const values = new Map<string, number>();
    while(values.get("humn") == undefined)
    {
        graph.nodes.forEach(node => propagate_node(node, values, graph));
    }

    return values.get("humn")||0
}

const part2 = (rawInput: string) => {
    const graph = parseInput(rawInput);

    // quickly modify the graph according to 2:
    const root = graph.lookup.get("root");
    if(root) {
        root.op = '=';
    }
    const humn = graph.lookup.get("humn");
    if(humn)
    {
        humn.op = 'find';
    }


    return eval_graph(graph);
};

run({
    part1: {
        tests: [
            //{
            //    input: ``,
            //    expected: "",
            //},
        ],
        solution: part1,
    },
    part2: {
        tests: [
            {
                input: `root: pppw + sjmn
dbpl: 5
cczh: sllz + lgvd
zczc: 2
ptdq: humn - dvpt
dvpt: 3
lfqf: 4
humn: 5
ljgn: 2
sjmn: drzm * dbpl
sllz: 4
pppw: cczh / lfqf
lgvd: ljgn * ptdq
drzm: hmdt - zczc
hmdt: 32`,
                expected: 301,
            },
        ],
        solution: part2,
    },
    trimTestInputs: true,
    onlyTests: false,
});
