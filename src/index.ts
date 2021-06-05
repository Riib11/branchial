// context

type Context = {
  universe: Universe;
  player: Player;
};

type Universe = {
  genesis: World;
};

type World = {
  tiles: Tile[];
  active: boolean;
  parent: Optional<World>;
  children: World[];
};

const WORLD_SIZE = 4;

type Tile = Player | 'empty';

type Player = 'player1' | 'player2';

// contextual

class Contextual<A> {
  k: ContextualContinuation<A>;

  public constructor(k: ContextualContinuation<A>) {
    this.k = k;
  }

  public run(c: Context): ContextualResult<A> {
    return this.k(c);
  }

  public eval(c: Context): A {
    return this.k(c).result;
  }

  public exec(c: Context): Context {
    return this.k(c).context;
  }

  public bind<B>(q: (a: A) => Contextual<B>): Contextual<B> {
    return new Contextual((c: Context) => {
      const r1: ContextualResult<A> = this.k(c);
      return q(r1.result).run(r1.context);
    });
  }
}

function ret<A>(a: A): Contextual<A> {
  return new Contextual<A>((c: Context) => ({
    context: c,
    result: a,
  }));
}

function get(): Contextual<Context> {
  return new Contextual<Context>((c: Context) => ({
    context: c,
    result: c,
  }));
}

function put(c: Context): Contextual<Unit> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return new Contextual<Unit>(_ => ({
    context: c,
    result: 'unit',
  }));
}

type ContextualContinuation<A> = (c: Context) => ContextualResult<A>;

type ContextualResult<A> = {
  context: Context;
  result: A;
};

// options

class Optional<A> {
  o: OptionalResult<A>;

  constructor(o: OptionalResult<A>) {
    this.o = o;
  }

  bind<B>(k: (a: A) => Optional<B>): Optional<B> {
    if (this.o === 'none') {
      return none();
    } else {
      return k(this.o);
    }
  }

  match<B>(k1: (a: A) => B, k2: () => B): B {
    if (this.o === 'none') {
      return k2();
    } else {
      return k1(this.o);
    }
  }
}

function none<A>(): Optional<A> {
  return new Optional<A>('none');
}

function some<A>(a: A): Optional<A> {
  return new Optional<A>(a);
}

type OptionalResult<A> = A | 'none';

// transition

type Transition = {
  source: Location;
  move: Move;
};

type Move = {
  moveWorld: MoveWorld;
  moveTile: MoveTile;
};

type MoveTile = Point2D;

type MoveWorld = number;

type Location = {
  path: WorldPath; // path from genesis to world
  index: TileIndex; // index of tile in world
};

type WorldPath = LinkedList<number>;

type TileIndex = number;

// update

// TODO
function update(t: Transition): Contextual<Optional<Unit>> { }

// destination before the target world is stepped forward
function calculateTargetCurrent(t: Transition): Optional<Location> {
  if (t.move.moveWorld === 0) {
    // at target world
    return some({
      path: t.source.path,
      index: translateTileIndex(t.source.index, t.move.moveTile),
    });
  } else {
    // on way to target world
    if (t.source.path === 'nil') {
      return none();
    } else {
      return calculateTargetCurrent({
        source: {
          path: t.source.path.tail,
          index: t.source.index,
        },
        move: {
          moveWorld: t.move.moveWorld - 1,
          moveTile: t.move.moveTile,
        },
      });
    }
  }
}

function calculateTargetFuture(t: Transition): Optional<Location> { }

function getWorld(p: WorldPath): Contextual<Optional<World>> {
  return get().bind(c => {
    const w: World = c.universe.genesis;
    return ret(
      reduceOptional<number, World>(
        p,
        (i, w) => {
          if (i < w.children.length) {
            // child index in bounds
            return some(w.children[i]);
          } else {
            // child index out of bounds
            return none();
          }
        },
        some(w)
      )
    );
  });
}

function translateTileIndex(i: TileIndex, m: MoveTile): TileIndex {
  return TileIndex_of_Point2D(addPoint2D(Point2D_of_TileIndex(i), m));
}

function Point2D_of_TileIndex(i: TileIndex): Point2D {
  return {
    x: i % WORLD_SIZE,
    y: Math.floor(i / WORLD_SIZE),
  };
}

function TileIndex_of_Point2D(p: Point2D): TileIndex {
  return WORLD_SIZE * p.y + p.x;
}

function addPoint2D(p1: Point2D, p2: Point2D): Point2D {
  return {
    x: p1.x + p2.x,
    y: p1.y + p2.y,
  };
}

// utilities

type Point2D = {
  x: number;
  y: number;
};

type Unit = 'unit';

// eslint-disable-next-line prettier/prettier
type LinkedList<A> = | { head: A; tail: LinkedList<A>; } | 'nil';

function reduce<A, B>(l: LinkedList<A>, f: (a: A, b: B) => B, b: B): B {
  if (l === 'nil') {
    return b;
  } else {
    return reduce(l.tail, f, f(l.head, b));
  }
}

function reduceOptional<A, B>(
  l: LinkedList<A>,
  f: (a: A, b: B) => Optional<B>,
  mb: Optional<B>
): Optional<B> {
  if (l === 'nil') {
    return none();
  } else {
    return mb.bind(b => reduceOptional(l.tail, f, f(l.head, b)));
  }
}
