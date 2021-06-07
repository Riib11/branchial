/* eslint-disable @typescript-eslint/ban-ts-comment */
// eslint-disable-next-line node/no-unpublished-import
import * as vis from 'vis';
import * as branchial from './branchial';

// @ts-ignore
const input_move: HTMLInputElement = document.getElementById('input_move');
// @ts-ignore
const output_turn: HTMLElement = document.getElementById('output_turn');
// @ts-ignore
const output_message: HTMLElement = document.getElementById('output_message');
// @ts-ignore
const container_network: HTMLDivElement = document.getElementById('network');

type Node = {id: number; label: string; image: string; shape: string};
type Edge = {from: number; to: number};

const nodes: vis.DataSet<Node> = new vis.DataSet();
const edges: vis.DataSet<Edge> = new vis.DataSet();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const network: vis.Network = new vis.Network(
  container_network,
  {
    nodes: nodes,
    edges: edges,
  },
  {
    edges: {
      arrows: {
        to: {
          enabled: true,
          type: 'arrow',
        },
      },
    },
    layout: {
      hierarchical: {
        direction: 'UD',
        sortMethod: 'directed',
      },
    },
  }
);
const context: branchial.Context = branchial.initContext();

input_move.addEventListener('keypress', e => {
  if (e.key === 'Enter') {
    const trans = branchial.compileTransition(context, input_move.value);
    if (trans !== null) {
      const result = branchial.update(context, trans);
      switch (result.kind) {
        case 'finished':
          output_message.innerText = '[finish] winner: ' + result.winner;
          break;
        case 'continuing':
          updateData();
          console.log('trans', trans);
          input_move.value = '';
          break;
        case 'error':
          output_message.innerText = '[error] ' + result.message;
          break;
      }
    } else {
      output_message.innerText = '[error] invalid move';
    }
  }
});

export function updateData() {
  console.log(context);
  nodes.clear();
  edges.clear();

  function generateImageUrl(world: branchial.World): string {
    const color_world = '#eeeeee';
    const color_tile = ['#eeeeee', '#dddddd'];
    // const color_player = ['orange', 'purple'];
    const color_player = ['red', 'blue'];
    const color_label = 'black';
    const color_active = world.active ? 'black' : 'white';

    let svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
      <style>
        circle.player1 { fill: ${color_player[0]}; }
        circle.player2 { fill: ${color_player[1]}; }
        rect.tile0 { fill: ${color_tile[0]}; }
        rect.tile1 { fill: ${color_tile[1]}; }
        rect.world { fill: ${color_world}; }
        rect.border: { fill: ${color_active}; }
        text.label { font: normal 8px sans-serif; fill: ${color_label}; }
      </style>
      <rect x="10" y="10" width="80" height="80" class="world"/>
      `;
    // TODO
    // <rect x="0" y="0" width="100" height="100" class="border"/>

    for (let i = 0; i < world.tiles.length; i++) {
      const tile = world.tiles[i];
      const x = i % branchial.WORLD_SIZE;
      const y = Math.floor(i / branchial.WORLD_SIZE);

      // tile

      svg += `
          <rect 
            x="${x * 20 + 10}"  y="${y * 20 + 10}" 
            width="20" height="20" 
            class="tile${(i + Math.floor(i / branchial.WORLD_SIZE)) % 2}" />
          `;

      // pawn

      if (tile !== 'empty') {
        svg += `
          <circle 
            cx="${x * 20 + 10 + 10}"  cy="${y * 20 + 10 + 10}" 
            r="5"
            class="${tile}" />
          `;
      }

      // // label

      // svg += `
      // <text x="${x * 20 + 10}" y="${y * 20 + 18 + 10}" class="tile">
      //   ${i}
      // </text>`;
    }

    // labels

    // horizontal
    const labels_horizontal = ['1', '2', '3', '4'];
    for (let i = 0; i < branchial.WORLD_SIZE; i++) {
      svg += `
        <text x="${i * 20 + 18}" y="${6}" class="label">
          ${labels_horizontal[i]}
        </text>`;
    }

    // vertical
    const labels_vertical = ['A', 'B', 'C', 'D'];
    for (let i = 0; i < branchial.WORLD_SIZE; i++) {
      svg += `
        <text x="${0}" y="${i * 20 + 22}" class="label">
          ${labels_vertical[i]}
        </text>`;
    }

    svg += '</svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  for (let i = 0; i < context.worlds.length; i++) {
    const world = context.worlds[i];
    nodes.add({
      id: world.index,
      label: world.index + '#',
      image: generateImageUrl(world),
      shape: 'image',
    });
  }
  for (let i = 0; i < context.worlds.length; i++) {
    const world = context.worlds[i];
    world.children.forEach(child =>
      edges.add({from: world.index, to: child.index})
    );
  }

  output_turn.innerText = context.player;
  output_turn.className = context.player;
}
