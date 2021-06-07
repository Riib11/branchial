// state

export type Context = {
  universe: Universe;
  worlds: World[];
  player: Player;
};

export type Universe = {
  genesis: World;
};

export type World = {
  index: number;
  tiles: Tile[];
  active: boolean;
  parent: World | null;
  children: World[];
};

export const WORLD_SIZE = 4;

export type Tile = Player | 'empty';

export type Player = 'player1' | 'player2';

// initialize

export function initContext(): Context {
  const genesis = initGenesis();
  return {
    universe: {
      genesis: genesis,
    },
    worlds: [genesis],
    player: 'player1',
  };
}

function initGenesis(): World {
  const tiles = compileTiles('1---' + '----' + '----' + '---2');
  return {
    index: 0,
    tiles: tiles,
    active: true,
    parent: null,
    children: [],
  };
}

// transition

type Transition = {
  source: Location; // move tile from
  target: Location; // move tile to
  player: Player; // player moving tile
};

// deprecated
// type MoveTile = Point2D;
// type MoveWorld = number;

type Location = {
  worldIndex: number;
  tileIndex: number;
};

// deprecated
// type WorldPath = number[]; // LinkedList<number>;

type TileIndex = number;

// update

export type UpdateResult = Continuing | Finished | Error;

export type Continuing = {kind: 'continuing'};
export type Finished = {kind: 'finished'; winner: Player};
export type Error = {kind: 'error'; message: string};

export function update(ctx: Context, trans: Transition): UpdateResult {
  if (trans.source === null) return {kind: 'error', message: 'invalid source'};
  if (trans.target === null) return {kind: 'error', message: 'invalid target'};

  const sourceWorld = getWorld(ctx, trans.source);
  const targetWorld = getWorld(ctx, trans.target);
  if (sourceWorld === null)
    return {kind: 'error', message: 'invalid source world'};
  if (targetWorld === null)
    return {kind: 'error', message: 'invalid target world'};
  if (!sourceWorld.active)
    return {kind: 'error', message: 'inactive source world'};

  const sourceTile = getTile(ctx, trans.source);
  const targetTile = getTile(ctx, trans.target);
  if (sourceTile === null)
    return {kind: 'error', message: 'invalid source tile'};
  if (targetTile === null)
    return {kind: 'error', message: 'invalid target tile'};
  // you cannot move an opponent's pawn
  if (sourceTile !== trans.player)
    return {
      kind: 'error',
      message: 'mismatch of source tile player and transition player',
    };
  // you cannot move onto your own pawn
  if (targetTile === trans.player)
    return {
      kind: 'error',
      message: 'match of target tile player and transition player',
    };

  // deactivate source world
  sourceWorld.active = false;

  // put pawn in updated version of target world at target location
  const childWorld: World = createChild(ctx, targetWorld);
  setTile(childWorld, trans.source.tileIndex, 'empty');
  setTile(childWorld, trans.target.tileIndex, trans.player);
  sourceWorld.children.push(childWorld); // TODO: does this work, since it introduces cycles?

  // update player
  ctx.player = nextPlayer(ctx.player);

  return {kind: 'continuing'};
}

function createChild(ctx: Context, parent: World): World {
  const child: World = {
    index: ctx.worlds.length,
    tiles: parent.tiles.slice(),
    active: true,
    parent: parent,
    children: [],
  };
  ctx.worlds.push(child);
  addChild(parent, child);
  return child;
}

function getTile(ctx: Context, loc: Location): Tile | null {
  const world = getWorld(ctx, loc);
  if (world !== null && loc.tileIndex < world.tiles.length)
    return world.tiles[loc.tileIndex];
  else return null;
}

function getWorld(ctx: Context, loc: Location): World | null {
  if (loc.worldIndex < ctx.worlds.length) return ctx.worlds[loc.worldIndex];
  else return null;
}

function setTile(world: World, i: TileIndex, tile: Tile): void {
  world.tiles[i] = tile;
}

function addChild(parent: World, child: World): void {
  parent.children.push(child);
}

function nextPlayer(player: Player): Player {
  if (player === 'player1') return 'player2';
  else return 'player1';
}

function compileTiles(str: string): Tile[] {
  const tiles: Tile[] = [];
  for (let i = 0; i < str.length; i++) {
    const x = str[i];
    if (x === '1') {
      tiles.push('player1');
    } else if (x === '2') {
      tiles.push('player2');
    } else {
      tiles.push('empty');
    }
  }
  return tiles;
}

export function compileTransition(
  ctx: Context,
  str: string
): Transition | null {
  const args = str.split(' ');
  if (args.length !== 2) return null;
  const sourceStr = args[0];
  const targetStr = args[1];
  function compileLocation(str: string): Location | null {
    const args = str.split('#');

    if (args.length !== 2) return null;
    const worldIndex = parseInt(args[0]);
    if (worldIndex === null) return null;

    const tileEncoding = args[1].toUpperCase();
    if (tileEncoding.length !== 2) return null;
    const tileEncodings0 = ['A', 'B', 'C', 'D'];
    const tileEncodingIndex0 = tileEncodings0.indexOf(tileEncoding[0]);
    const tileEncodings1 = ['1', '2', '3', '4'];
    const tileEncodingIndex1 = tileEncodings1.indexOf(tileEncoding[1]);
    const tileIndex = WORLD_SIZE * tileEncodingIndex0 + tileEncodingIndex1;

    return {
      worldIndex: worldIndex,
      tileIndex: tileIndex,
    };
  }
  const source = compileLocation(sourceStr);
  const target = compileLocation(targetStr);
  if (source === null || target === null) return null;
  return {
    source: source,
    target: target,
    player: ctx.player,
  };
}

// OLD: before using W#RC notation
// export function compileTransition(
//   ctx: Context,
//   str: string
// ): Transition | null {
//   const args = str.split(' ');
//   if (args.length !== 2) return null;
//   const sourceStr = args[0];
//   const targetStr = args[1];
//   function compileLocation(str: string): Location | null {
//     const args = str.split('#');
//     if (args.length !== 2) return null;
//     const worldIndex = parseInt(args[0]);
//     const tileIndex = parseInt(args[1]);
//     if (worldIndex === null || tileIndex === null) return null;
//     return {
//       worldIndex: worldIndex,
//       tileIndex: tileIndex,
//     };
//   }
//   const source = compileLocation(sourceStr);
//   const target = compileLocation(targetStr);
//   if (source === null || target === null) return null;
//   return {
//     source: source,
//     target: target,
//     player: ctx.player,
//   };
// }

// utilities

// deprecated

// type Point2D = {
//   x: number;
//   y: number;
// };

// function translateTileIndex(i: TileIndex, v: Point2D): TileIndex {
//   return TileIndex_of_Point2D(addPoint2D(Point2D_of_TileIndex(i), v));
// }

// function Point2D_of_TileIndex(i: TileIndex): Point2D {
//   return {
//     x: i % WORLD_SIZE,
//     y: Math.floor(i / WORLD_SIZE),
//   };
// }

// function TileIndex_of_Point2D(p: Point2D): TileIndex {
//   return WORLD_SIZE * p.y + p.x;
// }

// function addPoint2D(p1: Point2D, p2: Point2D): Point2D {
//   return {
//     x: p1.x + p2.x,
//     y: p1.y + p2.y,
//   };
// }
