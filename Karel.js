!(function(namespace, merge) {

var Direction = {
	
	NORTH: 0,
	EAST: 1,
	SOUTH: 2,
	WEST: 3,
	
	leftOf: function (direction) {
		if (direction == NORTH) {
			return WEST;
		} else {
			return --direction;
		}
	},
	
	rightOf: function (direction) {
		if (direction == WEST) {
			return NORTH;
		} else {
			return ++direction;
		}
	},
	
	oppositeOf: function (direction) {
		switch (direction) {	
		case NORTH:
			return SOUTH;
		case EAST:
			return WEST;
		case SOUTH:
			return NORTH;
		case WEST:
			return EAST;
		}
	}
};

function Coordinate(x, y) {
	var self = this;
		
	self.x = x;
	self.y = y;
}

Coordinate.prototype = {
	getAdjacent: function (direction) {
		var self = this,
			coordinate = new Coordinate(self.x, self.y);
		
		switch(direction) {
		case Direction.EAST:
			coordinate.x++;
			break;
		case Direction.NORTH:
			coordinate.y++;
			break;
		case Direction.WEST:
			coordinate.x--;
			break;
		case Direction.SOUTH:
			coordinate.y--;	
			break;
		}
		
		return coordinate;
	},

	isValid: function(grid) {
		var self = this,
			x = self.x,
			y = self.y;
		return  x >= 0 && x < grid[0].length && y >= 0 && y < grid[0][0].length;
	}
};

namespace.Karel = function Karel() {
	var self = this;
	
	self.world = null,
	self.direction = Direction.EAST,
	self.coordinate = new Coordinate(0, 0),
	self.beepers = 0;
};

namespace.Karel.prototype = {
	
	init: function(config) {
		merge(this, config);
	},
		
	update: function() {
        var self = this;
        
		self.world.update(self.direction, self.coordinate);
	},
	
	command: {
		move: function() {
			var self = this,
                world = self.world,
				direction = self.direction,
				coordinate = self.coordinate,
				adjacentCoordinate = coordinate.getAdjacent(direction);				
			
			if (world.isClear(direction, coordinate, adjacentCoordinate)) {
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
            var self = this;
            
			if(beepers == null || beepers-- > 0) {
				self.world.putBeeper(self.coordinate);
				return true;
			} else {
				self.error = "Not enough beepers.";
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
			return this.world.isClear(this.direction, this.coordinate);
		},
		
		frontIsBlocked: function() {
			return !frontIsClear();
		},
		
		leftIsClear: function() {
			return this.world.isClear(Direction.leftOf(this.direction), this.coordinate);
		},
		
		leftIsBlocked: function() {
			return !leftIsClear();
		},
		
		rightIsClear: function() {
			return this.world.isClear(Direction.rightOf(this.direction), this.coordinate);
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

namespace.World = function World() {
	var self = this;
	self.grid = [[]];
	self.map = [[]];
};

namespace.World.prototype = {
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

}(window.KarelBlocks = {}, function () {}));

with(KarelBlocks) {
    var karel = new Karel();
}

