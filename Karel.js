var Direction = {
	
	NORTH: 0,
	EAST: 1,
	SOUTH: 2,
	WEST: 3,
	
	leftOf: function(direction) {
		if (direction == Direction.NORTH) {
			return Direction.WEST;
		} else {
			return --direction;
		}
	},
	
	rightOf: function(direction) {
		if (direction == Direction.WEST) {
			return Direction.NORTH;
		} else {
			return ++direction;
		}
	},
	
	oppositeOf: function(direction) {
		switch(direction) {	
		case Direction.NORTH:
			return Direction.SOUTH;
			break;
		case Direction.EAST:
			return Direction.WEST;
			break;
		case Direction.SOUTH:
			return Direction.NORTH;
			break;
		case Direction.WEST:
			return Direction.EAST;
			break;
		}
	}
};

function Coordinate(x, y) {
	var self = this;
	self.x = x;
	self.y = y;
}

Coordinate.prototype = {
	getAdjacent: function(direction) {
		var coordinate = new Coordinate(this.x, this.y);
		
		switch(direction) {
		case Direction.EAST:
			return ++coordinate.x;
		case Direction.NORTH:
			return ++coordinate.y;
		case Direction.WEST:
			return --coordinate.x;
		case Direction.SOUTH:
			return --coordinate.y;			
		}
	},

	isValid: function(grid) {
		var self = this,
			x = self.x,
			y = self.y;
		return  x >= 0 && x < grid[0].length && y >= 0 && y < grid[0][0].length;
	}
};

function Karel() {
	var self = this;
	self.world = null,
	self.direction = Direction.EAST,
	self.coordinate = new Coordinate(0, 0),
	self.beepers = 0;
}

Karel.prototype = {
	
	init: function(config) {
		merge(this, config);
	},
		
	update: function() {
		this.world.update(this.direction, this.coordinate);
	},
	
	isClear: this.world.isClear,
	
	command: {
		move: function() {
			var self = this,
				direction = self.direction,
				coordinate = self.coordinate,
				adjacentCoordinate = coordinate.getAdjacent(direction);				
			
			if (isClear(direction, coordinate, adjacentCoordinate)) {
				coordinate = adjacentCoordinate;
				return true;
			} else {
				this.error = "Cannot move.";
				return false;	
			}	
		},
	
		turnLeft: function() {
			var direction = this.direction;
			
			direction = Direction.leftOf(direction);
			
			update();
		},
	
		turnRight: function() {
			var direction = this.direction;
			
			direction = Direction.rightOf(direction);
			
			update();
		},
	
		turnAround: function() {
			var direction = this.direction;
			
			direction = Direction.oppositeOf(direction);
			
			update();
		},
	
		putBeeper: function() {
			if(beepers == null || beepers-- > 0) {
				this.world.putBeeper(this.coordinate);
				return true;
			} else {
				this.error = "Not enough beepers.";
				return false;
			}
		},
		
		pickBeeper: function() {
			var success = this.world.pickBeeper(this.coordinate);
			if (success) {
				beepers++;
			} else {
				this.error = "No beepers found.";
			}
			
			return success;
		}
	},
	
	condition: {
	
		frontIsClear: function() {
			return isClear(this.direction, this.coordinate);
		},
		
		frontIsBlocked: function() {
			return !frontIsClear();
		},
		
		leftIsClear: function() {
			return isClear(Direction.leftOf(this.direction), this.coordinate);
		},
		
		leftIsBlocked: function() {
			return !leftIsClear();
		},
		
		rightIsClear: function() {
			return isClear(Direction.rightOf(this.direction), this.coordinate);
		},
		
		rightIsBlocked: function() {
			return !rightIsClear();
		},
		
		beepersPresent: function() {
			return this.world.getTile(this.coordinate).beepers;
		},
		
		noBeepersPresent: function() {
			return !beepersPresent();
		},
		
		beepersInBag: function() {
			return beepers == null || beepers;
		},
		
		noBeepersInBag: function() {
			return !beepersInBag();
		},
		
		facingNorth: function() {
			return this.direction == Direction.NORTH;
		},
		
		notFacingNorth: function() {
			return !facingNorth();
		},
		
		facingEast: function() {
			return this.direction == Direction.EAST;
		},
		
		notFacingEast: function() {
			return !facingEast();
		},
		
		facingSouth: function() {
			return this.direction == Direction.SOUTH;
		},
		
		notFacingSouth: function() {
			return !facingSouth();
		},
		
		facingWest: function() {
			return this.direction == Direction.WEST;
		},
		
		notFacingWest: function() {
			return !facingWest();
		}
	}
};

function World() {
	var self = this;
	self.grid = [[]];
	self.map = [[]];
}

World.prototype = {
	init: function (config) {
		merge(this, config);
	},
	
	getTile: function (coordinate) {
		return map[coordinate.x][coordinate.y];
	},
	
	setTile: function (coordinate, state) {
		var tile = new Tile();
		
		map[coordinate.x][coordinate.y] = state ? tile : null;
		
		for (var direction = 0, limit = tile.walls.length, adjacentCoordinate = null, adjacentTile = null; direction < limit; direction++) {
			adjacentCoordinate = coordinate.getAdjacent(direction);
			
			if (adjacentCoordinate.isValid(map)) {
				adjacentTile = getTile(adjacentCoordinate);
				if (adjacentTile) {
					adjacentTile.setWall(Direction.oppositeOf(direction), !state);
					continue;
				} else {
					grid[adjacentCoordinate.x][adjacentCoordinate.y] = !state;
				}
			}	
			tile.setWall(direction, state);	
		}
	},
	
	setWall: function(coordinate, direction, state) {
		var adjacentCoordinate = coordinate.getAdjacent(direction);
			adjacentCoordinateIsValid = adjacentCoordinate.isValid(map);
			adjacentTile;
		
		if (state || (!state && adjacentCoordinateIsValid)) {
			getTile(coordinate).setWall(direction, state);
		}
		
		if (adjacentCoordinateIsValid) {
			adjacentTile = getTile(adjacentCoordinate);
			if (adjacentTile) {
				adjacentTile.setWall(direction. state);
			}
		}	
	},
	
	update: function(direction, coordinate) {
		//todo
	},
	
	pickBeeper: function(coordinate) {
		var beepers = getTile(coordinate).beepers;
		if (beepers) {
			beepers--;
			return true;
		} else {
			return false;
		}
	},
	
	putBeeper: function(coordinate) {
		getTile(coordinate).beepers++;
	},
	
	isClear: function(direction, coordinate, adjacentCoordinate) {
		if (adjacentCoordinate == null) {
			adjacentCoordinate = coordinate.getAdjacent(direction);
		}
		return !(getTile(coordinate).walls[direction] && adjacentCoordinate.isValid(map) && getTile(adjacentCoordinate));
	},
	
	beepersPresent: function(coordinate) {
		return getTile(coordinate).beepers;
	},
};


function Tile() {
	var self = this;
	self.walls = [];
	self.beepers = 0;
}

Tile.prototype = {
	init: function (config) {
		merge(this, config);
	},	
		
	isClear: function(direction) {
		var wall = this.walls[direction];
		return  wall == null || !wall;
	},
	
	setWall: function(direction, state) {
		walls[direction] = state;
	}
};