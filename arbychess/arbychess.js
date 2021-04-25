// the general premise here is that every cell has coordinates and pieces may be at those coordinates
// pieces move by changing their coordinates in some manner

class Move {
  constructor(vector, options) {
    this.vector = vector;
    this.options = options || {};

    // -1 for "as far as possible" (e.g. queen) and 1 for "one step" (e.g. king)
    this.momentum = options.momentum || -1;

    // whether a piece can move to different coords without capturing (e.g. pawn's forward move)
    this.canReposition = options.canReposition || true;

    // whether a piece can capture with this move (e.g. pawn's diagonal capture)
    this.canCapture = options.canCapture || true;
  }

  copy() {
    return new Move(this.vector, this.options);
  }
}

class Board {
  isValidCoords(coords){}
  transform(coords, movement){}
}

class SquareGrid extends Board {
  constructor(size) {
    super()
    this.size = size;
  }

  isValidCoords(coords) {
    if (coords.x < 0 || coords.y < 0)
      return false;
    if (coords.x > this.size || coords.y > this.size)
      return false;

    return true;
  }

  transform(coords, movement) {
    coords.x += movement.vector.dx;
    coords.y += movement.vector.dy;
  }

  rotate4(movements) {
    let newMovements = [];
    movements.forEach(move => {
      newMovements.push(move);

      flip = move.copy()
      flip.vector.dx = -move.vector.dx;
      flip.vector.dy = -move.vector.dy;
      newMovements.push(flip);

      rot = move.copy()
      rot.vector.dx = move.vector.dy;
      rot.vector.dy = -move.vector.dx;
      newMovements.push(rot);

      rotinv = move.copy()
      rotinv.vector.dx = -move.vector.dy;
      rotinv.vector.dy = move.vector.dx;
      newMovements.push(rotinv);
    })

    return newMovements;
  }
}

class Piece {
  constructor(name, movements) {
    this.name = name;
    this.movements = movements;
  }

  copy() {
    let movesCopy = [];
    this.movements.forEach(move => movesCopy.push(move.copy()));
    return new Piece(this.name, movesCopy);
  }
}

class Player {}

class StandardChess {
  constructor() {
    this.board = new SquareGrid(8);
    this.basePieces = {
      king: new Piece('king', this.board.rotate4([
        new Move({dx: 1, dy: 0}, {momentum: 1}),
        new Move({dx: 1, dy: 1}, {momentum: 1}),
      ])),
      queen: new Piece('queen', this.board.rotate4([
        new Move({dx: 1, dy: 0}),
        new Move({dx: 1, dy: 1}),
      ])),
      rook: new Piece('rook', this.board.rotate4([
        new Move({dx: 1, dy: 0}),
      ])),
      bishop: new Piece('bishop', this.board.rotate4([
        new Move({dx: 1, dy: 1}),
      ])),
      knight: new Piece('knight', this.board.rotate4([
        new Move({dx: 1, dy: 2}, {momentum: 1}),
        new Move({dx: 2, dy: 1}, {momentum: 1}),
      ])),
      wpawn: new Piece('pawn', [
        new Move({dx: 0, dy: 1}, {momentum: 1, canCapture: false}),
        new Move({dx: 1, dy: 1}, {momentum: 1, canReposition: false}),
        new Move({dx: -1, dy: 1}, {momentum: 1, canReposition: false}),
      ]),
      bpawn: new Piece('pawn', [
        new Move({dx: 0, dy: -1}, {momentum: 1, canCapture: false}),
        new Move({dx: 1, dy: -1}, {momentum: 1, canReposition: false}),
        new Move({dx: -1, dy: -1}, {momentum: 1, canReposition: false}),
      ]),
    };

    this.players = {
      white: new Player('white'),
      black: new Player('black'),
    }
    this.playerCycle = ['white', 'black'];


    this.pieces = {
      white: [],
      black: [],
    }

    let startFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
        px = 0, py = 7,
        piece = null,
        player = null;

    startFEN.forEach(char => {
      if (char == '/') {
        px = 0;
        py -= 1;
      }
      else if (char == 'K' || char == 'k')
        piece = this.basePieces.king.copy()
      else if (char == 'Q' || char == 'q')
        piece = this.basePieces.queen.copy()
      else if (char == 'R' || char == 'r')
        piece = this.basePieces.rook.copy()
      else if (char == 'B' || char == 'b')
        piece = this.basePieces.bishop.copy()
      else if (char == 'N' || char == 'n')
        piece = this.basePieces.knight.copy()
      else if (char == 'P')
        piece = this.basePieces.wpawn.copy()
      else if (char == 'p')
        piece = this.basePieces.bpawn.copy()
      else {
        px += parseInt(char);
      }


      player = ('KQRBNP'.indexOf(char) > -1) ? 'white' : 'black'

      this.pieces[player].push({
        piece: piece,
        coords: {x: px, y: py},
      })
    })
  }

  perform(player, piece, move) {

  }
}

game = new StandardChess()
