YUI.add('sudoku', function(Y) {
	var SudokuPuzzle = function (p) {
		var puzzle = '',
			solution = new Array(81),
			possible = new Array(81),
			score = 0,
			bruteForce = false;
			
		var isValidPuzzle = function(p) {
			var pattern = /^\d{81}$/;
			return pattern.test(p);
		};
		
		var checkDuplicateGrid = function(s, g, d) {
			var i = 0, value = 0,
				grid = [0, 0, 0, 0, 0, 0, 0, 0, 0];
			
			for (i = 0; i < 9; ++i) {
				value =parseInt(s[g[i]], 10);
				if (value != 0) {
					if (grid[value - 1] == 0) {
						grid[value - 1] = g[i];
					} else {
						d.push(grid[value - 1]);
						d.push(g[i]);
					}
				}
			}
		}
		
		var checkDuplicate = function(s) {
			var i = 0, j = 0, begin = 0, d = [],
				g = [0, 0, 0, 0, 0, 0, 0, 0, 0];
				
			// check rows
			for (i = 0; i < 9; ++i) {
				for (j = 0; j < 9; ++j) {
					g[j] = i * 9 + j;
				}
				checkDuplicateGrid(s, g, d);
			}
			
			// check columns
			for (i = 0; i < 9; ++i) {
				for (j = 0; j < 9; ++j) {
					g[j] = j * 9 + i;
				}
				checkDuplicateGrid(s, g, d);
			}
			
			// check minigrid
			for (i = 0; i < 9; ++i) {
				begin = Math.floor(i / 3) * 27 + (i % 3) * 3;
				for (j = 0; j < 9; ++j) {
					g[j] = Math.floor(j / 3) * 9 + (j % 3) + begin;
				}
				checkDuplicateGrid(s, g, d);
			}
			
			return d;
		};
		
		var checkEmpty = function(s) {
			var i = 0, empty = 0;
			
			for (i = 0; i < 81; ++i) {
				if (s[i] == '0') {
					empty++;
				}
			}
			
			return empty;
		};
		
		var checkPuzzle = function(s) {
			var empty = 0, duplicate = [];
			
			if (isValidPuzzle(s)) {
				empty = checkEmpty(s);
				duplicate = checkDuplicate(s);
			}
			
			return {
				empty: empty,
				duplicate: duplicate
			};
		};
		
		var isPuzzleSolved = function() {
			var result = checkPuzzle(solution.join(''));
			return (result.duplicate.length == 0) && (result.empty == 0);
		}
		
		var initPuzzle = function (p) {
			var i = 0;
			
			puzzle = p;
			for (i = 0;  i < 81; ++i) {
				solution[i] = parseInt(puzzle[i], 10);
				if (solution[i] == 0) {
					possible[i] = '123456789';
				} else {
					possible[i] = '';
				}
			}
		};
		
		var calculatePossible = function (index) { 
			var c = 0, r = 0, g = 0, i = 0, pos = 0;
				
			c = index % 9;
			r = Math.floor(index / 9);
			g = Math.floor(r / 3) * 3 + Math.floor(c / 3);
			
			// check rows
			for (i = 0; i < 9; ++i) {
				pos = r * 9 + i;
				if (solution[pos] != 0) {
					possible[index] = possible[index].replace(solution[pos].toString(), '');
				}
			}
			
			// check columns
			for (i = 0; i < 9; ++i) {
				pos = i * 9 + c;
				if (solution[pos] != 0) {
					possible[index] = possible[index].replace(solution[pos].toString(), '');
				}
			}
			
			// check minigrids
			var begin = Math.floor(g / 3) * 27 + (g % 3) * 3;
			for (i = 0; i < 9; ++i) {
				pos = Math.floor(i / 3) * 9 + (i % 3) + begin;
				if (solution[pos] != 0) {
					possible[index] = possible[index].replace(solution[pos].toString(), '');
				}
			}
		}
		
		var checkColumnsAndRows = function() {
			var i = 0, change = false;
			
			for (i = 0; i < 81; ++i) {
				if (solution[i] == 0) {
					calculatePossible(i);
					if (possible[i].length == 0) {
						throw new Error("Wrong Puzzle");
					} else if (possible[i].length == 1) {
						solution[i] = parseInt(possible[i], 10);
						possible[i] = '';
						change = true;
						score += 1;
					}
				}
			}
			return change;
		};
		
		var lookForLoneRangesGrid = function(grid) {
			var i = 0,  c = 0, index = 0, 
				count = 0, pos = 0, change = false;
				
			for (c = 1; c <= 9; ++c) {
				count = 0;
				for (j = 0; j < 9; ++j) {
					index = grid[j];
					if (solution[index] == 0) {
						if (possible[index].indexOf(c.toString()) != -1) {
							count++;
							pos = index;
							if (count > 1) {
								break;
							}
						}
					}
				}
				if (count == 1) {
					solution[pos] = c;
					possible[pos] = '';
					change = true;
					score += 2;
				}						
			}	
			return change;
		};
		
		var lookForLoneRanges = function() {
			var i = 0, j = 0, begin = 0, change = false,
				grid = [0, 0, 0, 0, 0, 0, 0, 0, 0];
		
			// check rows
			for (i = 0; i < 9; ++i) {					
				for (j = 0; j < 9; ++j) {
					grid[j] = i * 9 + j;						
				}	
				change |= lookForLoneRangesGrid(grid);					
			}
			
			if (change) {
				return change;
			}
			
			//check columns
			for (i = 0; i < 9; ++i) {
				for (j = 0; j < 9; ++j) {
					grid[j] = j * 9 + i;
				}
				change |= lookForLoneRangesGrid(grid);			
			}
			
			if (change) {
				return change;
			}
			
			//check minigrids
			for (i = 0; i < 9; ++i) {	
				begin = Math.floor(i / 3) * 27 + (i % 3) * 3;
				for (j = 0; j < 9; ++j) {
					grid[j] = Math.floor(j / 3) * 9 + (j % 3) + begin;
				}
				change |= lookForLoneRangesGrid(grid);	
			}
			
			return change;
		};
		
		var removePossible = function (index, p) {
			var i = 0, count = 0, change = false;
			if (solution[index] == 0 && possible[index] != p) {
				count = possible[index].length;
				for (i = 0;  i < p.length; ++i) {
					possible[index] = possible[index].replace(p.substr(i, 1), '');
				}					
				change = (count != possible[index].length);
				if (possible[index].length == 1) {
					solution[index] = parseInt(possible[index], 10);
					possible[index] = '';	
					score += p.length + 1;
				} else if (possible[index].length == 0) {
					throw new Error("Wrong Puzzle");
				}
			}
			return change;
		};
		
		var lookForTwinsGrid = function(grid) {
			var j = 0, k = 0, index = 0, pos = 0,
				change = false, twins = [];
			
			for (j = 0; j < 9; ++j) {
				index = grid[j];
				if (solution[index] == 0 && possible[index].length == 2) {
					twins.push(index);
				}
			}
			
			while (twins.length > 1) {
				pos = twins.pop();
				for (k = 0; k < twins.length; ++k) {
					if (possible[pos] == possible[twins[k]]) {
						// found twins							
						for (j = 0; j < 9; ++j) {
							index = grid[j];
							if (index != pos && index != twins[k]) {
								change |= removePossible(index, possible[pos]);
							}
						}
						twins.splice(k, 1);
					}
				}
			}
			
			return change;
		};
		
		var lookForTwins = function() {
			var i = 0, j = 0, k = 0, begin = 0, change = false, 
				grid = [0, 0, 0, 0, 0, 0, 0, 0, 0];
				 
			// rows
			for (i = 0; i < 9; ++i) {					
				for (j = 0; j < 9; ++j) {
					grid[j] = i * 9 + j;						
				}
				change |= lookForTwinsGrid(grid);
			}
			
			if (change) {
				return change;
			}
			
			// columns
			for (i = 0; i < 9; ++i) {					
				for (j = 0; j < 9; ++j) { 
					grid[j] = j * 9 + i;						
				}
				change |= lookForTwinsGrid(grid);
			}
			
			if (change) {
				return change;
			}
			
			// minigrids
			for (i = 0; i < 9; ++i) {
				var twins = [];
				begin = Math.floor(i / 3) * 27 + (i % 3) * 3;
				for (j = 0; j < 9; ++j) {
					grid[j] = Math.floor(j / 3) * 9 + (j % 3) + begin;						
				}
				change |= lookForTwinsGrid(grid);
			}
			
			return change;
		};
		
		var isContainedPossible = function(p, q) {		
			var i = 0;
			
			for (i = 0; i < q.length; ++i) {
				if (p.indexOf(q.substr(i, 1)) == -1) {
					return false;
				}
			}				
			return true;
		}
		
		var lookForTripletsGrid = function(grid) {
			var i = 0, j = 0, p = 0, k = 0, 
				count = 0, pos = 0, change = false,
				triplets = [];
			
			for (i = 0; i < 9; ++i) {
				if (solution[grid[i]] == 0) {
					if (possible[grid[i]].length == 3) {
						triplets.push(grid[i]);
					} else if (possible[grid[i]].length == 2) {
						triplets.unshift(grid[i]);
					}						
				}
			}
			
			while (triplets.length > 2) {
				pos = triplets.pop();						
				if (possible[pos].length != 3) {
					break;
				}
				count = 0;
				for (k = 0; k < triplets.length; ++k) {							
					if (isContainedPossible(possible[pos], possible[triplets[k]])) {
						if (count == 0) {
							p = k;
							count++;
						} else {
							// found triplets	
							for (j = 0; j < 9; ++j) {
								index = grid[j];
								if (index != pos && (index != triplets[p]) && (index != triplets[k])) {
									change |= removePossible(index, possible[pos]);
								}
							}
							triplets.splice(p, 1);
							triplets.splice(k, 1);
						}
					}							
				}
			}
		};
		
		var lookForTriplets = function() {
			var i = 0, j = 0, change = false,
				grid = [0, 0, 0, 0, 0, 0, 0, 0, 0];
			
			// rows
			for (i = 0; i < 9; ++i) {					
				for (j = 0; j < 9; ++j) {
					grid[j] = i * 9 + j;						
				}
				change |= lookForTripletsGrid(grid);
			}
			
			if (change) {
				return change;
			}
			
			// columns			
			for (i = 0; i < 9; ++i) {					
				for (j = 0; j < 9; ++j) {
					grid[j] = j * 9 + i;						
				}
				change |= lookForTripletsGrid(grid);					
			}				
			
			if (change) {
				return change;
			}
			
			// minigrids
			for (i = 0; i < 9; ++i) {					
				begin = Math.floor(i / 3) * 27 + (i % 3) * 3;
				for (j = 0; j < 9; ++j) {
					grid[j] = Math.floor(j / 3) * 9 + (j % 3) + begin;						
				}
				change |= lookForTripletsGrid(grid);					
			}
			
			return change;
		};
		
		var findCellWithFewestPossible = function() {
			var i = 0, min = 10, result = 0;
			
			for (i = 0; i < 81; ++i) {
				if (solution[i] == 0 && possible[i].length < min) {
					min = possible[i].length;
					result = i;
				}
			}
			
			return result;
		};
		
		var solvePuzzle = function() {
			var change = true;
			
			try {
				while (change) {
					while (change) {
						while (change) {
							while (change) {									
								change = checkColumnsAndRows();
								if (isPuzzleSolved()) {
									return true;
								}
							}
							change = lookForLoneRanges();
							if (isPuzzleSolved()) {
								return true;
							}
						}
						change = lookForTwins();
						if (isPuzzleSolved()) {
							return true;
						}
					}
					change = lookForTriplets();	
					if (isPuzzleSolved()) {
						return true;
					}
				}	
				if (isPuzzleSolved()) {
					return true;
				}
			} catch (e) {
				throw new Error('Invalid move');
			}
			return false;
		};
		
		var cloneStackData = function() {
			var i = 0,
				s = new Array(81),
				p = new Array(81);
			
			for (i = 0; i < 81; ++i) {
				s[i] = solution[i];
				p[i] = possible[i];
			}
			
			return {
				s: s,
				p: p
			}
		};
		
		var bfStack = [];
		var bfStop = false;
		var solveByBruteForce = function() {
			var i = 0, index = 0, 
				possibleValue = '';
			
			bruteForce++;
			index = findCellWithFewestPossible();
			possibleValue = possible[index];
			
			if (possibleValue.length < 1) {
				throw new Error('Wrong Puzzle!');
			}
			bfStack.push(cloneStackData());
			score += 5;
			
			for (i = 0; i < possibleValue.length; ++i) {
				solution[index] = parseInt(possibleValue[i], 10);
				possible[index] = '';
				
				try {
					if (solvePuzzle()) {
						bfStop = true;
						return;
					} else {
						solveByBruteForce();
						if (bfStop) {
							return;
						}
					}
				} catch (e) {
					if (bfStack.length > 0) {
						var stackObject = bfStack.pop();
						solution = stackObject.s;
						possible = stackObject.p;
					} else {
						throw new Error('Wrong puzzle!');
					}
				}
			}
		};
		
		var solve = function() {
			var result = {
				solution: '',
				bruteForce: 0,
				solved: false,
				score: 0,
				empty: 0
			};
			
			result.empty = checkEmpty(puzzle);
			score = 0;
			bruteForce = 0;
			bfStack = [];
			bfStop = false;
			try {
				if (!solvePuzzle()) {
					solveByBruteForce();
				}
				result.solution = solution.join('');
				result.bruteForce = bruteForce;
				result.solved = true;
				result.score = score;
			} catch (e) {				
				result.solution = solution;				
			}
			
			return result;
		}
		
		var randomizePossibleValue = function(possibleValue) {
			var i = 0, j = 0, t = 0, length = 0, g = null;
			
			length = possibleValue.length;
			g = new Array(length);
			for (i = 0; i < length; ++i) {
				g[i] = possibleValue[i];
			}
			
			for (i = 0; i < length - 1; ++i) {
				j = Math.floor((length - i + 1) * Math.random() + i) % length;
				t = g[i];
				g[i] = g[j];
				g[j] = t;
			}
			
			return g.join('');
		};
		
		var solveByBruteForceRandom = function() {
			var i = 0, index = 0, 
				possibleValue = '';
			
			bruteForce++;
			index = findCellWithFewestPossible();
			possibleValue = possible[index];
			
			if (possibleValue.length < 1) {
				throw new Error('Wrong Puzzle!');
			}
			bfStack.push(cloneStackData());
			score += 5;
			
			possibleValue = randomizePossibleValue(possibleValue);
			for (i = 0; i < possibleValue.length; ++i) {
				solution[index] = parseInt(possibleValue[i], 10);
				possible[index] = '';
				
				try {
					if (solvePuzzle()) {
						bfStop = true;
						return;
					} else {
						solveByBruteForce();
						if (bfStop) {
							return;
						}
					}
				} catch (e) {
					if (bfStack.length > 0) {
						var stackObject = bfStack.pop();
						solution = stackObject.s;
						possible = stackObject.p;
					} else {
						throw new Error('Wrong puzzle!');
					}
				}
			}
		};
		
		var getPossible = function() {
			var i = 0;
			
			for (i = 0; i < 81; ++i) {
				if (solution[i] == 0) {
					calculatePossible(i);
				}
			}
			
			return possible;
		};
		
		var solveRandom = function() {
			var result = {
				solution: '',
				bruteForce: false,
				solved: false,
				score: 0,
				empty: 0
			};
			
			result.empty = checkEmpty(puzzle);
			score = 0;
			bfStack = [];
			bfStop = false;
			try {
				if (!solvePuzzle()) {
					solveByBruteForceRandom();
				}
				result.solution = solution.join('');
				result.bruteForce = bruteForce;
				result.solved = true;
				result.score = score;
			} catch (e) {				
				result.solution = solution;				
			}
			
			return result;
		};
		
		var setPuzzle = function(p) {
			if (!isValidPuzzle(p)) {
				throw new Error('Wrong Puzzle!');
			}
			
			initPuzzle(p);
			this.puzzle = p;
		};
		
		setPuzzle(p);
		
		this.setPuzzle = setPuzzle;
		this.solve = solve;
		this.check = checkPuzzle;
		this.getPossible = getPossible;
		this.solveRandom = solveRandom;
	};
	
	var generatePuzzle = function(level) {
		var i = 0, empty = 0, cells = [],
			count = 30, times = 30, 
			puzzle, result, ret, s,
			solution = new Array(81);
		
		var randomNumber = function(min, max) {
			return Math.floor((max - min + 1) * Math.random()) + min;
		};
		
		var createEmptyCells = function(n, s) {
			var i = 0, p = 0, q = 0;
				
			while (i < n) {
				p = randomNumber(0, 80);
				if (cells.indexOf(p) == -1) {
					cells.push(p);
					++i;
					q = 80 - p;
					if ((i < n) && (p != q)) {
						cells.push(q);
						++i;
					}
				}
			}
			
			for (i = 0; i < n; ++i) {
				s[cells[i]] = 0;
			}
		};
		
		var anotherEmptyCellPair = function() {
			var i =0, p= 0, q = 0, p1 = 0, q1 = 0, found = false;
			
			while (!found) {
				i = randomNumber(0, empty - 1);
				p = cells[i];
				q = 80 - p;
				if (cells.indexOf(q) != -1) {
					found = true;
				}
			}
			
			found = false;
			while (!found) {
				p1 = randomNumber(0, 80);
				q1 = 80 - p1;
				if  ((p1 != q1) && (cells.indexOf(p1) == -1) && (cells.indexOf(q1) == -1)) {
					found = true;
				}
			}
			
			solution[p] = result.solution[p];
			solution[q] = result.solution[q];
			cells.splice(i, 1);
			cells.splice(cells.indexOf(q), 1);
			
			solution[p1] = 0;
			solution[q1] = 0;
			cells.push(p1);
			cells.push(q1);
		};
		
		var getEmptyNumber = function(l) {
			var n = 0;
				
			switch (l) {
			case 0: 
				n = randomNumber(40, 45);
				break;
			case 1: 
				n = randomNumber(46, 49);
				break;
			case 2: 
				n = randomNumber(50, 54);
				break;
			case 3: 
				n = randomNumber(55, 59);
				break;
			default:
				n = randomNumber(40, 59);
				break;
			}
			
			return n;
		};
		
		while (count > 0) {
			for (i = 0; i < 81; ++i) {
				solution[i] = 0;
			}
			empty = getEmptyNumber(level);
			
			puzzle = new SudokuPuzzle(solution.join(''));
			
			result = puzzle.solveRandom();
			
			if (!result.solved) {
				return '';
			}
			
			for (i = 0;  i < 81; ++i) {
				solution[i] = result.solution[i];
			}
			
			cells = [];
			createEmptyCells(empty, solution);
			
			times = 30;
			s = '';
			if (level < 3) {
				while (times > 0) {
					puzzle.setPuzzle(solution.join(''));
					ret = puzzle.solve();
					if (ret.bruteForce == 0 && ret.solved) {
						break;
					} else {
						times--;
						anotherEmptyCellPair();
					}
				}
			} else {
				while (times > 0) {
					puzzle.setPuzzle(solution.join(''));
					ret = puzzle.solveRandom();
					if (ret.solved) {
						if (s.length === 0) {
							s = ret.solution;
						} else if (s != ret.solution) {
							break;
						}
					}  else {
						break;
					}
					times--;
				}
			}
			
			if ((times > 0 && level < 3) || (times  == 0 && level == 3)) {
				return solution.join('');
			}
			
			count--;
		}
		return 'No puzzle generated!';
	};
	
	Y.Sudoku = {
		Puzzle : SudokuPuzzle,
		generate: generatePuzzle 
	}

}, '1.0.0', {requires: [ 'node' ]});
