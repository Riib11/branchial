export declare type Context = {
    universe: Universe;
    worlds: World[];
    player: Player;
};
export declare type Universe = {
    genesis: World;
};
export declare type World = {
    index: number;
    tiles: Tile[];
    active: boolean;
    parent: World | null;
    children: World[];
};
export declare const WORLD_SIZE = 4;
export declare type Tile = Player | 'empty';
export declare type Player = 'player1' | 'player2';
export declare function initContext(): Context;
declare type Transition = {
    source: Location;
    target: Location;
    player: Player;
};
declare type Location = {
    worldIndex: number;
    tileIndex: number;
};
export declare type UpdateResult = Continuing | Finished | Error;
export declare type Continuing = {
    kind: 'continuing';
};
export declare type Finished = {
    kind: 'finished';
    winner: Player;
};
export declare type Error = {
    kind: 'error';
    message: string;
};
export declare function update(ctx: Context, trans: Transition): UpdateResult;
export declare function compileTransition(ctx: Context, str: string): Transition | null;
export {};
