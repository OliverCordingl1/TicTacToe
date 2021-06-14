const	TILE_WIDTH = 200,
		TILE_HEIGHT = 200,
		OFFSET = 10;
let INITIALISED;
let game;

/**
 * Game class to hold game functions
 */
class Game {
	/**
	 * Create a new game instance
	 */
	constructor() {
		this.initialised = true;

		this.board = new Board();
		this.players = ['X', 'O'];
		this.activePlayer = Math.round(Math.random());

		this.running = false;
		this.playCount = false;

		this.highlightedTile = new Tile({x: 0, y: 0});
		this.winline = new WinLine(null, null, false);
	}

	/**
	 * reset the game instance
	 */
	reset() {
		this.board.clearBoard();
		this.running = false;
		this.playCount = 0;
		this.activePlayer = Math.round(Math.random());

		this.highlightedTile.reset();
		this.winline.reset();
	}

	/**
	 * start the game
	 * @param {boolean} [withReset=true] should the game instance reset when started?
	 */
	start(withReset = true) {
		if (withReset)
			this.reset();
		this.running = true;
	}

	/**
	 * Stop game
	 */

	stop(coords) {
		this.running = false;

		if (coords) {// show a win line

		}
	}

	/**
	 * changes the player turn
	 * @returns player id
	 */
	swapPlayer() {
		this.activePlayer = (this.activePlayer + 1) % this.players.length;
		return this.activePlayer;
	}

	/**
	 * Play a move
	 * @param {Vector} pos position vector of where to play 
	 * @returns {void}
	 */
	play(pos) {
		if (this.board.getTile(pos) >= 0) return; // Prevent spots being overwritten
		let player = this.player

		this.board.setTile(pos, player);

		this.playCount++;

		let move = this.checkWin(pos, player);
		if (move.pass) {
			// finish game as winner
			console.log(`Winner! Congratulations, '${game.players[player]}'!`)
			game.stop();
			this.winline.setPoints(move.coords[0], move.coords.reverse()[0]);
			this.winline.setVisible(true);
		} else {
			// check draw
			if (this.playCount === this.board.height * this.board.width) {
				// finish game as draw
				console.log('Draw');
				game.stop();
			}
		}

	}

	/**
	 * Check the most recent move to see if it was a win
	 * @param {Vector} position the position that the last move was played
	 * @param {number} player the id of the player who played
	 * @returns {Object|boolean} pass bool & coords of a win 
	 */
	checkWin({x, y}, player) {
		let checks = { // 4 win scenarios
			vertical: () => {
				var count = 0;
				var coords = [];
				for (var by = 0; by < this.board.height; by++) {
					if (this.board.getTile({x, y: by}) != player) break;
					
					count++;
					coords.push({x, y: by});
				}
				return {
					pass: count === this.board.height,
					coords,
				};
			}, horizontal: () => {
				var count = 0;
				var coords = [];
				for (var bx = 0; bx < this.board.width; bx++) {
					if (this.board.getTile({x: bx, y}) != player) break;
					
					count++;
					coords.push({x: bx, y});
				}
				return {
					pass: count === this.board.width,
					coords,
				};
			}, diagonalLeft: () => {
				var count = 0;
				var coords = [];
				for (var d = 0; d < this.board.height; d++) {
					if (this.board.getTile({x: d, y: d}) != player) break;
					
					count++;
					coords.push({x: d, y: d});
				}
				return {
					pass: count === this.board.width,
					coords,
				};
			}, diagonalRight: () => {
				var count = 0;
				var coords = [];
				for (var dx = this.board.height - 1; dx >= 0; dx--) {
					let dy = this.board.height - dx - 1;
					if (this.board.getTile({
						x: dx,
						y: dy,
					}) != player) break;

					count++;
					coords.push({x: dx, y: dy});
				}
				return {
					pass: count === this.board.height,
					coords,
				};
			}
		};

		return (() => {
			let check;
			let ck = Object.keys(checks);
			for (var i = 0; i < ck.length; i++) {
				check = checks[ck[i]]()
				console.debug('check', check, ck[i]);
				if (check.pass) break;
			}
			return (check.pass) ? check : false;
		})();
	}

	/**
	 * If nessecary, change the position of the currently highlighted tile
	 * @param {Vector} position([x], [y])
	 */
	changeHighlightedTile({x, y}) {
		let tile = createVector(Math.floor(x / TILE_WIDTH), Math.floor(y / TILE_HEIGHT));

		let inCanvas = this.pointColliding(x, y, 0, 0, width, height);

		this.highlightedTile.setVisible(this.mouseInTile(tile) && inCanvas);
		if (!this.highlightedTile.visible)
			tile = {x: -1, y: -1};
		
		if (!this.highlightedTile.pos.equals(tile)) {
			this.highlightedTile.setPos(tile);
			this.highlightedTile.setChanged(true);
		}

		if (this.highlightedTile.visible && this.highlightedTile.changed) {
			if (!clickSound.isPlaying())
				clickSound.play(0, 0.95, (this.running) ? 0.3 : 0.1);
			this.highlightedTile.setChanged(false);
		}
		
	}

	/**
	 * simple collision checking for a set of bounds
	 * @param {number} px point to check x coord
	 * @param {number} py point to check xy coord
	 * @param {number} x x coord of tile to check collision
	 * @param {number} y y coord of tile to check collision
	 * @param {number} w width of tile to check collision
	 * @param {number} h height of tile to check collision
	 * @returns {boolean}
	 */
	 pointColliding(px, py, x, y, w, h) {
		return 	px > x && px < x + w
			&&	py > y && py < y + h;
	}

	/**
	 * determines if the mouse is within the bounds of a tile
	 * @param {number[]} tile 
	 * @returns {boolean}
	 */
	mouseInTile(tile) {
		return this.pointColliding(
			mouseX,
			mouseY,
			tile.x * TILE_WIDTH + OFFSET,
			tile.y * TILE_HEIGHT + OFFSET,
			TILE_WIDTH - (2 * OFFSET),
			TILE_HEIGHT - (2 * OFFSET));
	}

	/**
	 * return the current player and swap it
	 * @returns {number} player
	 */
	get player() {
		let p = this.activePlayer;
		this.activePlayer = (this.activePlayer + 1) % this.players.length;
		return p;
	}

	///////////
	// DRAWS //
	///////////

	/**
	 * draw game
	 * @param {Object} p5Info useful information from p5 to be used by draw calls
	 * @param {number} p5Info.width width of the canvas
	 * @param {number} p5Info.height height of the canvas
	 * @param {boolean} p5Info.isMousePressed is the mouse being pressed
	 */
	draw(p5Info) {
		this.highlightedTile.draw(this, p5Info);
		this.board.draw(this, p5Info);
		this.winline.draw();
	}
	
}

/**
 * Tile class to hold data for a highlighted tile
 */
class Tile {
	/**
	 * instantiate a new tile
	 * @param {Vector} position([x], [y]) position of where to initialise the tile
	 */
	constructor({x, y}) {
		this.pos = createVector(x || 0, y || 0);
		this.visible = false;
		this.changed = false;
	}

	/**
	 * reset a tile
	 */
	reset() {
		this.pos = createVector(0, 0);
		this.visible = false;
		this.changed = false;
	}

	/**
	 * sets the visibility of a tile
	 * @param {boolean} b the value to set visibility to
	 */
	setVisible(b) {
		this.visible = b;
	}

	/**
	 * sets the 'changed' value of the tile
	 * @param {boolean} b the value to set 'changed' to
	 */
	setChanged(b) {
		this.changed = b;
	}

	/**
	 * changes the tile's position
	 * @param {Vector} position([x], [y]) the new position
	 */
	setPos({x, y}) {
		this.pos = createVector(x || 0, y || 0);
	}

	/**
	 * draw tile
	 * @param {Object} game
	 * @param {boolean} game.running is game running? 
	 * @param {Object} p5info
	 * @param {boolean} mouseIsPressed is mouse being pressed?
	 */
	draw({ running }, { mouseIsPressed }) {
		// draw the highlighted tile
		if (this.visible) {
			strokeWeight(0);
			(!mouseIsPressed && running) ? fill(0xDE, 0xDE, 0xDE, 128) : fill(0xde, 0xDE, 0xDE, 0xff);
			rect(
				this.pos.x * TILE_WIDTH + OFFSET,
				this.pos.y * TILE_HEIGHT + OFFSET,
				TILE_WIDTH - (OFFSET * 2), TILE_HEIGHT - (OFFSET * 2),
				OFFSET, OFFSET, OFFSET, OFFSET)
		}
	}
}

/**
 * Board class to hold data and functions for the game board
 */
class Board {
	/**
	 * Instantiate a new board
	 */
	constructor () {
		this.BOARD_HEIGHT = 3;
		this.BOARD_WIDTH = 3;

		this.board = this.clearBoard();
	}

	/**
	 * clear the board
	 * @returns {string[][]} board
	 */
	clearBoard() {
		console.log('Clearing the board');
		let board = []
		for (var y = 0; y < this.BOARD_HEIGHT; y++) {
			board.push([]);
			for (var x = 0; x < this.BOARD_WIDTH; x++)
				board[y].push('-1');
		}
		this.board = board
		return board;
	}

	/**
	 * get the value of a tile on the board
	 * @param {Vector} position 
	 * @returns {number} the current occupancy at a place on the board
	 */
	getTile(position) {
		return this.board[position.y][position.x];
	}

	/**
	 * 
	 * @param {Vector} position(x, y)
	 * @param {number} value the value to set the tile to
	 * @returns {string[][]} board
	 */
	setTile(position, value) {
		this.board[position.y][position.x] = value;
		return this.board;
	}

	/**
	 * @returns {number} width of board
	 */
	get width() {
		return this.BOARD_WIDTH;
	}

	/**
	 * @returns {number} height of board
	 */
	get height() {
		return this.BOARD_HEIGHT;
	}

	/**
	 * draw the board
	 * @param {Object} game
	 * @param {string[]} game.players list of player labels
	 * @param {Object} p5Info
	 * @param {number} p5info.width width of the p5 canvas
	 * @param {number} p5info.height height of the p5 canvas
	 */
	draw({ players }, { width, height }) {
		// Draw the grid
		strokeWeight(10);
		stroke(0);
		strokeCap(ROUND);

		//verticals
		line(width / 3, 10, width/3, height - 10);
		line(2 * width / 3, 10, 2 * width/3, height - 10);
		//horizontals
		line(10, height / 3, width-10, height/3);
		line(10, 2 * height / 3, width-10, 2 * height/3);


		// mark the tile if it is taken
		fill(0);
		stroke(0);
		strokeWeight(0)
		textSize(TILE_HEIGHT / 3);
		textAlign(CENTER, CENTER);
		textFont('Leckerli One');
		for (var y = 0; y < this.height; y++) {
			for (var x = 0; x < this.width; x++) {
				var t = this.getTile({x, y})

				if (t < 0)
					continue;
				
				t = t % 2
				
				text(players[t],
					(x * TILE_WIDTH) + TILE_WIDTH / 2,
					(y * TILE_HEIGHT) + TILE_HEIGHT / 2
				);
			}
		}
	}
	
}

/**
 * A line to draw when a win is detected
 */
class WinLine {
	/**
	 * instantiate a winline
	 * @param {Vector} [pos1] first point of a vector
	 * @param {Vector} [pos2] second point of a vector
	 * @param {boolean} [visible=false] whether or not to show the win line
	 */
	constructor(pos1, pos2, visible) {
		this.pos1 = (pos1) ? this.vectorToVector(pos1) : createVector();
		this.pos2 = (pos2) ? this.vectorToVector(pos2) : createVector();
		this.visible = visible || false;
	}

	/**
	 * reset the line
	 */
	reset() {
		this.pos1 = createVector();
		this.pos2 = createVector();
		this.visible = false;
	}

	/**
	 * properly formats a vector into a p5 vector
	 * @param {Vector} v([x], [y], [z]) 
	 * @returns {p5.Vector}
	 */
	vectorToVector(v) {
		return createVector(v.x || 0, v.y || 0, v.z || 0);
	}

	/**
	 * Set the starting point of the win line
	 * @param {Vector} start coordinates to set starting point to
	 */
	setStart(start) {
		this.pos1 = this.vectorToVector(start);
	}

	/**
	 * Set the ending point of the win line
	 * @param {Vector} end coordinates to set ending point to
	 */
	setEnd(end) {
		this.pos2 = this.vectorToVector(end);
	}

	/**
	 * Set the starting and ending points of the win line
	 * @param {Vector} start the starting point
	 * @param {Vector} end the ending point
	 */
	setPoints(start, end) {
		this.setStart(start);
		this.setEnd(end);
	}

	/**
	 * change the visibility of the win line
	 * @param {boolean} b visibility of the win line
	 */
	setVisible(b) {
		this.visible = b;
	}

	/**
	 * Get the starting point of the win line
	 * @returns {p5.Vector}
	 */
	get start() {
		return this.pos1;
	}

	/**
	 * Get the ending point of the win line
	 * @returns {p5.Vector}
	 */
	get end() {
		return this.pos2;
	}

	draw() {
		if (this.visible) {
			strokeWeight(20);
			stroke(0xff, 0x49, 0x40, 200);
			line((this.start.x * TILE_WIDTH) + (TILE_WIDTH / 2), (this.start.y * TILE_HEIGHT) + (TILE_HEIGHT / 2), (this.end.x * TILE_WIDTH) + (TILE_WIDTH / 2), (this.end.y * TILE_HEIGHT) + (TILE_HEIGHT / 2));
		}
	}
}

function preload() {
	soundFormats('mp3');
	clickSound = loadSound('./assets/sounds/click');
}

function setup() {
	game = new Game();

	let canvas = createCanvas(game.board.width * TILE_WIDTH, game.board.height * TILE_HEIGHT);
	canvas.parent('p5canvaswrapper');

	userStartAudio();

	INITIALISED = true;
	game.running = true;
}

function draw() {
	background(255);

	game.draw({width, height, mouseIsPressed});

	////////
}

function mousePressed() {
	if (!INITIALISED) return false;

	if (!game.running) {
		game.start();
	}

	if (game.mouseInTile(game.highlightedTile.pos, true) && game.running) {
		if (!clickSound.isPlaying())
			clickSound.play(0,1.25,0.35);
		
		game.play(game.highlightedTile.pos);
	}

	return false; // prevent default
}

// set the highlighted tile to the tile that is currently being hovered over
function mouseMoved() {
	if (!INITIALISED) return ;

	game.changeHighlightedTile({
		x: mouseX,
		y: mouseY,
	});
}