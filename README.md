# README

Branchial is a prototype abstract board game based on the idea of branching timelines to represent time travel as demonstrated by _5D Chess with Multiverse Time Travel_.

## Rules

This project is till very experimental, so the following rules do not make much of a game. However, they still dictate the possibilities of interacting with the system.

The game proceeds by the two players (player1 is red, and player2 is blue) taking alternating turns, starting with player1. On their turn, a player must move a _friendly_ from it's location in an active world (the move's source location), to a legal position in a world (the move's _target_ location). Note that the target and source worlds can be the same world. So, a move is encoded by two locations: the source location and the target location.

A _legal_ target location is a location that is not occupied by a friendly pawn.

An _active_ world is either the genesis world on the first turn or a world that was created by the previous turn.

A _location_ is encoded by the world index, a `#`, the pawn row, and then the pawn column. For example, `0#A1` is the location of the top-left tile in world 0#.

A _move_ is encoded by two locations separated by a space. For example `0#A1 0#B1` is the move of a pawn in location `0#A1` to location `0#B1`.

## Example

The following discussion considers this sequence of moves:

```
P1: 0#A1 0#B1
P2: 1#D4 0#C4
P1: 2#A1 1#A2
```

As an example move, suppose I am player1 and am making the first move. Then a valid move for I can make is `0#A1 0#B1`, since there is a friendly (blue) pawn on `0#A1` and the tile at `0#B1` is empty. When I make this move, a new world, `1#`, is created where my pawn is no longer at A1 but is instead now at B1. However, the pawn at `0#A1` has not moved. Rather, there is now a "new" pawn at `1#A2`. And now `1#` is the active world for player2's turn.

Beyond the first turn, it is possible to move to worlds other than the active one. Running with the example above, consider what happens when player2's first move is `1#D4 0#C4`. Importantly, player2 is moving from world 1 to world 2. The result of this move is that there are now three worlds, where the third world, `2#`, just created looks just as is player2 had gone first! Note also that the arrows between worlds indicate that `2#` is a pointed to by both `0#` and `1#`. It is a "descendant" of `0#` because it inherits the world state of `0#`, and it is a "sibling" of `1#` because from there it was given player2's pawn.

So far, it seems that not much interesting has happened other than player1 and player2 diverging the worlds to reflect two timelines where one went first rather than the other. But subtly, there is a particular interesting result so far. In the preivous move when player2 moved `1#D4 0#C4`, player2's pawn in `0#` was in the same position as it was in `1#`. So, these are effectively the same pawn even though they are in different worlds (which makes sense since that pawn hadn't moved yet). When player2 makes this move they moved the single pawn that was in both worlds, to a new position in world `2#`.

The alternative to this would to move to a _divergent_ world i.e. a target world with a divergent history from the source world. Consider player1's next move: `2#A1 1#A2`. The result is a world, `3#`, with two red pawns! Since the pawns came from divergent worlds, they are now different pawns and so manifest as two pawns.

<!-- How to start up a new typescript project:

```
npm i typescript --save-dev
npx tsc --init
npm install eslint --save-dev
npx eslint --init
npx gts init
npm run compile
``` -->
