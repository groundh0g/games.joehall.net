// ------------------
// -- Load words task
// ------------------
var gameInstance_AI = {};
var TaskAI = {};

function StartAI(args_param) {
	if(!gameInstance.EndGame) {
		TaskAI = new Task(
			// onInit
			function (args) {
				gameInstance_AI = {};
				var ai = gameInstance_AI;
				
				ai.TimeStart = new Date().getTime();
				
				var len = gameInstance.Players[1].Tiles.length;
				
				//var dif = $("#sliderAI").slider("value");
				var dif = gameInstance.AiDifficulty;

				ai.PlayerIndex = 1;

				// AI options ...
				ai.TargetWordLength = -1;
				ai.TargetWordScore  = -1;
							
				if(args && args.length > 0) {
					ai.PlayerIndex = 0;
					dif = 7;
				} else {
					if(dif == 7) {
						ai.TargetScore = Math.max(gameInstance.Players[0].Score + 1, 15);
					} else if(dif == 0) {
						dif = 2;
						ai.TargetWordLength = 4;
						ai.TargetWordScore  = Math.max(gameInstance.Players[0].Score, 15);
					}
				}
				dif++;
				if(dif > len) { dif = len; }
				
				ai.BestScore = 0;
				ai.BestTilesPlayed = [];
				ai.BestTilesPlayedAt = [];
				ai.PlayFound = false;
				ai.Progress = 0;
		
				ai.ValidFirstMoves = FindValidFirstMoves();
				if(ai.ValidFirstMoves.length > 0) {
					var min = 1;
					var numCombos = 0;
					if(!gameInstance.Board.Tiles[7+7*15] && dif > 1) { min = 2; }
					ai.PermutationManager = new TilePermutationsOfCombinations(len,min,dif);
				}
				gameInstance.UiPrepForAI(true);
			},
		
			// onDoTask
			function () {
				var ai = gameInstance_AI;
	
				// prep dummy result struct
				var result = { 
					cellMin: {X:-1, Y:-1, I:-1},
					cellMax: {X:-1, Y:-1, I:-1},
					tilesPlayed: [],
					isValidTilePlacement: true,
					errorMsg: null
					};
					
				// is there anything to do?
				if(ai.PermutationManager.HasMore()) {
					var indexes = ai.PermutationManager.Next();
					var pct = ai.PermutationManager.GetProgress();
					if(pct != ai.Progress) {
						$("#aiProgress").css("width", pct + "%");
						ai.Progress = pct;
						if(pct > 5) {
							var elapsed = (new Date().getTime() - ai.TimeStart) / 1000.0;
							var estimated = Math.floor(100.0 * elapsed / pct - elapsed) + 1;
							//$("#aiMessage").html("Thinking ... [" + estimated + " sec]");
							$("#lblTimeLeft").html(gameInstance.MakeNumberSprites(estimated));
							$("#lblTimeLeftSec").css("display","");
						}
					}
					var len = indexes.length;
					var moves = ai.ValidFirstMoves;
					var lenM = moves.length;
					var valid = false;
					var boardTiles = gameInstance.Board.Tiles;
					var playerTiles = gameInstance.Players[ai.PlayerIndex].Tiles;
	
					// for each valid board cell
					for(var m = 0; m < lenM; m++) {
						var move = moves[m];
						// for each player tile to be placed
						for(var i = 0; i < len; i++) {
							// place tiles vertically and horizontally
							for(var vh = 0; vh < 2; vh++) { // vertical horizontal
								var isHorizontal = (vh == 0 ? true : false);
								var dI = isHorizontal ? 1 : 15;
								var openCellsBefore = isHorizontal ? move.OpenCellsLeft  : move.OpenCellsUp;
								var openCellsAfter  = isHorizontal ? move.OpenCellsRight : move.OpenCellsDown;
								var lenBefore = openCellsBefore.length;
								var lenAfter  = openCellsAfter.length;
								var start = -1;
								valid = (lenAfter >= len - i && lenBefore >= i);
								
								if(valid) {
									result.cellMin.I = i>0 ? openCellsBefore[lenBefore-i] : openCellsAfter[0];
									result.cellMax.I = openCellsAfter[len-1-i];
									for(var ndx = 0; ndx < len; ndx++) {
										var tile = playerTiles[indexes[ndx]];
										tile.PlayedAt = ndx-i >= 0 ? openCellsAfter[ndx-i] : openCellsBefore[lenBefore+(ndx-i)];
									}
									result.tilesPlayed = indexes;
								
									gameInstance.ValidateWordsPlayed(ai.PlayerIndex,result);
									
									var keeper = result.isValidAllWords;
									var firstWord = "";
									if(keeper) { 
										firstWord = result.WordsPlayed[0]; 
									}
									if(keeper && ai.PlayFound) {
										var playerScore = gameInstance.Players[1-ai.PlayerIndex].Score;
										var newScore = result.Score;
										var oldScore = ai.BestScore;
										var optScore = ai.TargetWordScore;
										
										keeper = false;
										
										if(optScore > 0) {
											// target score specified, try to match it
											var newDelta = Math.abs(optScore-(playerScore+newScore));
											var oldDelta = Math.abs(optScore-(playerScore+oldScore));
											if(newDelta == oldDelta) {
												var optLen = ai.TargetWordLength;
												if(optLen > 0) {
													// target length specified, try to match it
													newDelta = Math.abs(optLen-firstWord.length);
													oldDelta = Math.abs(optLen-ai.BestWordLength);
													if(newDelta < oldDelta) {
														// same score, length is closer to target
														keeper = true;
													}
												}
											} else if(newDelta < oldDelta) {
												// score is closer to target
												keeper = true;
											}
										} else if(newScore > oldScore) {
											// best score seen so far
											keeper = true;
										}
									}
									
									if(keeper) {
										// everything checks out. create a copy so we can come back
										var lenIndexes = indexes.length;
										var bestTilesPlayed = [];
										var bestTilesPlayedAt = [];
										for(var iTile = 0; iTile < lenIndexes; iTile++) {
											bestTilesPlayed[iTile] = indexes[iTile];
											bestTilesPlayedAt[iTile] = playerTiles[indexes[iTile]].PlayedAt;
										}
										ai.BestTilesPlayed = bestTilesPlayed;
										ai.BestTilesPlayedAt = bestTilesPlayedAt;
										ai.BestScore = result.Score;
										ai.BestWordLength = firstWord.length;
										ai.PlayFound = true;
									}
								}
							}
						}
					}
				} else {
					this.IsRunning = false;
					this.Result = 0;
					if(this.OnDone) { this.OnDone(); }
				}
			},
/*
			function () {
				var ai = gameInstance_AI;
	
				// prep dummy result struct
				var result = { 
					cellMin: {X:-1, Y:-1, I:-1},
					cellMax: {X:-1, Y:-1, I:-1},
					tilesPlayed: [],
					isValidTilePlacement: true,
					errorMsg: null
					};
					
				// is there anything to do?
				if(ai.PermutationManager.HasMore()) {
					var indexes = ai.PermutationManager.Next();
					var pct = ai.PermutationManager.GetProgress();
					if(pct != ai.Progress) {
						$("#aiProgress").css("width", pct + "%");
						ai.Progress = pct;
					}
					var len = indexes.length;
					var moves = ai.ValidFirstMoves;
					var lenM = moves.length;
					var valid = false;
					var boardTiles = gameInstance.Board.Tiles;
					var playerTiles = gameInstance.Players[ai.PlayerIndex].Tiles;
	
					// for each valid board cell
					for(var m = 0; m < lenM; m++) {
						// for each player tile to be placed
						for(var i = 0; i < len; i++) {
							// place tiles vertically and horizontally
							for(var vh = 0; vh < 2; vh++) { // vertical horizontal
								var isHorizontal = (vh == 0 ? true : false);
								var start = moves[m];
								var dI = isHorizontal ? 1 : 15;
								var minI = isHorizontal ? start - Math.floor(start % 15) : 0;
								var maxI = isHorizontal ? minI + 15 : 15 * 15;
								// if there's more than one tile to place, we need to shift
								if(i > 0) {
									var toMove = i; // number of cells to shift
									valid = false;  // assume failure
									// attempt shift
									while(toMove > 0 && start > minI) {
										start -= dI;
										if(!boardTiles[start]) {
											toMove--;
											if(toMove == 0) {
												// the tiles fit the board
												valid = true;
												break;
											}
										}
									}
								} else { 
									valid = true; 
								}
	
								if(valid) {
									// if the tiles fit, place them
									result.cellMin.I = start;
									for(var ndx = 0; ndx < len; ndx++) {
										var tile = playerTiles[indexes[ndx]];
										if(!boardTiles[start]) {
											tile.PlayedAt = start;
											result.cellMax.I = start;
										} else {
											ndx--;
										}
										start += dI;
										if(start >= maxI) {
											// oops. passed other end of the board
											valid = false;
											break;
										}
									}
								}
	
								if(valid) {
									// looks good. need to make sure it's a valid word
									result.tilesPlayed = indexes;
									gameInstance.ValidateWordsPlayed(ai.PlayerIndex,result);
									
									var keeper = result.isValidAllWords;
									var firstWord = "";
									if(keeper) { firstWord = result.WordsPlayed[0]; }
									if(keeper && ai.PlayFound) {
										var playerScore = gameInstance.Players[1-ai.PlayerIndex].Score;
										var newScore = result.Score;
										var oldScore = ai.BestScore;
										var optScore = ai.TargetWordScore;
										
										if(optScore > 0) {
											// target score specified, try to match it
											var newDelta = Math.abs(optScore-(playerScore+newScore));
											var oldDelta = Math.abs(optScore-(playerScore+oldScore));
											if(newDelta == oldDelta) {
												var optLen = ai.TargetWordLength;
												if(optLen > 0) {
													// target length specified, try to match it
													newDelta = Math.abs(optLen-firstWord.length);
													oldDelta = Math.abs(optLen-ai.BestWordLength);
													if(newDelta < oldDelta) {
														// same score, length is closer to target
														keeper = true;
													}
												}
											} else if(newDelta < oldDelta) {
												// score is closer to target
												keeper = true;
											}
										} else if(newScore > oldScore) {
											// best score seen so far
											keeper = true;
										}
									}
									
									if(keeper) {
										// everything checks out. create a copy so we can come back
										var lenIndexes = indexes.length;
										var bestTilesPlayed = [];
										var bestTilesPlayedAt = [];
										for(var iTile = 0; iTile < lenIndexes; iTile++) {
											bestTilesPlayed[iTile] = indexes[iTile];
											bestTilesPlayedAt[iTile] = playerTiles[indexes[iTile]].PlayedAt;
										}
										ai.BestTilesPlayed = bestTilesPlayed;
										ai.BestTilesPlayedAt = bestTilesPlayedAt;
										ai.BestScore = result.Score;
										ai.BestWordLength = firstWord.length;
										ai.PlayFound = true;
									}
								}
							}
						}
					}
				} else {
					this.IsRunning = false;
					this.Result = 0;
					if(this.OnDone) { this.OnDone(); }
				}
			},
*/

			// onDone
			function () {
				var ai = gameInstance_AI;
				var playerTiles = gameInstance.Players[ai.PlayerIndex].Tiles;
				var lenPlayerTiles = playerTiles.length;
				if(ai.PlayFound) {
					var btp = ai.BestTilesPlayed;
					var btpLen = btp.length;
		
					// reset tiles
					for(var iTile = 0; iTile < lenPlayerTiles; iTile++) {
						playerTiles[iTile].Reset();
					}
		
					// pick best play
					for(var iTile = 0; iTile < btpLen; iTile++) {
						playerTiles[btp[iTile]].PlayedAt = ai.BestTilesPlayedAt[iTile];
					}
					
					if(ai.PlayerIndex == 1) {
						gameInstance.CommitPlayedTiles(1);
						gameInstance.Players[1].Score += ai.BestScore;
			
						// reset tiles
						for(var iTile = 0; iTile < lenPlayerTiles; iTile++) {
							if(playerTiles[iTile]) { playerTiles[iTile].Reset(); }
						}
			
						// update UI
						gameInstance.UiUpdateScores();
						gameInstance.UiPrepForAI(false);
						gameInstance.UiDrawBoardTiles(true);
					} else {
						gameInstance.UiDrawHintTiles();
						gameInstance.UiPrepForAI(false);
					}
				} else {
					// reset tiles
					for(var iTile = 0; iTile < lenPlayerTiles; iTile++) {
						playerTiles[iTile].Reset();
					}

					gameInstance.UiSkipTurn(1);

					// update UI
					gameInstance.UiPrepForAI(false);
					gameInstance.UiDrawBoardTiles(true);
				}
				
				//ai.TimeEnd = new Date().getTime();
				//alert((ai.TimeEnd - ai.TimeStart)/1000.0);
			},
		
			// onError
			function () {
			});
		
		TaskAI.StartTask(args_param);
	}
}

function StartAI_Hint() {
	for(var i = 0; i < 7; i++) {
		gameInstance.UiRevertPlayerTile(i,false);
	}
	gameInstance.UiToggleButtons();
	StartAI(["bogus value"]);
}

// ------------------

function FindValidFirstMoves() {
	var moves = [];
	var boardTiles = gameInstance.Board.Tiles;
	var center = 7 + 7 * 15;
	//if(!boardTiles[7+7*15]) {
	//	// first move, start on center tile
	//	moves[0] = 7+7*15;
	//} else {
		var max = 15*15;
		var movesLen = 0;
		if(!boardTiles[center]) {
			moves[movesLen++] = { Index:center };
		} else {
			for(var i = 0; i < max; i++) {
				if(!boardTiles[i]) {
					if(Math.floor(i%15) > 0 && boardTiles[i-1]) {
						moves[movesLen++] = { Index:i };
					} else if(i > 14 && boardTiles[i-15]) {
						moves[movesLen++] = { Index:i };
					} else if(Math.floor(i%15) < 14 && boardTiles[i+1]) {
						moves[movesLen++] = { Index:i };
					} else if(i < 210 && boardTiles[i+15]) {
						moves[movesLen++] = { Index:i };
					}
				}
			}
		}
		
		var openCellsLen = 0;
		var i2 = 0;

		for(var i = 0; i < movesLen; i++) {
			// calc stuff here.
			var move = moves[i];

			var index = move.Index;
			var min = index - Math.floor(index % 15);
			max = min + 15;

			var openCells = [];
			for(i2 = index - 1, openCellsLen = 0; i2 >= min && openCellsLen < 7; i2--) {
				if(!boardTiles[i2]) { 
					openCells.splice(0,0,i2);
					openCellsLen++;
				}
			}
			move.OpenCellsLeft = openCells;
			
			openCells = [];
			for(i2 = index, openCellsLen = 0; i2 < max && openCellsLen < 8; i2++) {
				if(!boardTiles[i2]) { openCells[openCellsLen++] = i2; }
			}
			move.OpenCellsRight = openCells;
			
			min = Math.floor(index % 15);
			max = 15 * 15;

			openCells = [];
			for(i2 = index, openCellsLen = 0; i2 >= min && openCellsLen < 7; i2 -= 15) {
				if(!boardTiles[i2]) { 
					openCells.splice(0,0,i2); 
					openCellsLen++;
				}
			}
			move.OpenCellsUp = openCells;

			openCells = [];
			for(i2 = index, openCellsLen = 0; i2 < max && openCellsLen < 8; i2 += 15) {
				if(!boardTiles[i2]) { openCells[openCellsLen++] = i2; }
			}
			move.OpenCellsDown = openCells;

/*
			var i2 = 0;
			var start = [];
			start[i2++] = index;
			index--;
			while(i2 < 7 && index >= min) {
				if(!board[index]) {
					start[i2++] = index;
				}
				index--;
			}
			move.StartH = start;

			index = move.Index;
			i2 = 0;
			min = 0;
			start = [];
			start[i2++] = index;
			index -= 15;
			while(i2 < 7 && index >= min) {
				if(!board[index]) {
					start[i2++] = index;
				}
				index -= 15;
			}
			move.StartV = start; 
*/
		//}
	}
	return moves;
};

/*
function FindValidFirstMoves() {
	var moves = [];
	var boardTiles = gameInstance.Board.Tiles;
	if(!boardTiles[7+7*15]) {
		// first move, start on center tile
		moves[0] = 7+7*15;
	} else {
		var max = 15*15;
		var movesLen = 0;
		for(var i = 0; i < max; i++) {
			if(!boardTiles[i]) {
				if(Math.floor(i%15) > 0 && boardTiles[i-1]) {
					moves[movesLen++] = i;
				} else if(i > 14 && boardTiles[i-15]) {
					moves[movesLen++] = i;
				} else if(Math.floor(i%15) < 14 && boardTiles[i+1]) {
					moves[movesLen++] = i;
				} else if(i < 210 && boardTiles[i+15]) {
					moves[movesLen++] = i;
				}
			}
		}
	}
	return moves;
};
*/

function GetFactorial(x) {
	var factorial = 1;
	for(var i = x; i > 1; i--) {
		factorial = factorial * i;
	}
	return factorial;
};

function TilePermutationsOfCombinations(arrayLen, minLen, maxLen) {
	this.NumSteps = 0;
	this.CurrentStep = 0;
	this.Combos = [];
	this.ComboNum = 0;
	var numCombos = 0;

	for(var i = minLen; i <= maxLen; i++) {
		this.Combos[numCombos] = new TileCombinations(arrayLen, i);
		this.NumSteps += this.Combos[numCombos].GetTotal() * GetFactorial(i);
		numCombos++;
	}
	
	this.ComboIndexes = this.Combos[this.ComboNum].Next();
	this.CurrentPermute = new TilePermutations(this.ComboIndexes.length);
	this.CurrentStep++;
	
	this.GetProgress = function() {
		var result = 0; //"1%";
		var num = this.NumSteps;
		if(num > 0) {
			var pct = Math.floor((100 * this.CurrentStep) / num);
			if(pct > 0) {
				result = pct; //pct + "%";
			}
		}
		return result;
	};
	
	this.HasMore = function() {
		var combo = this.Combos[this.ComboNum];
		var permute = this.CurrentPermute;
		return (combo && combo.HasMore()) || (permute && permute.HasMore()) || (combo && this.ComboNum < this.Combos.length);
	};
	
	this.Next = function() {
		var permute = this.CurrentPermute;
		var combo = this.Combos[this.ComboNum];
		var result = [];

		if(!permute.HasMore()) {
			if(combo) {
				if(!combo.HasMore()) {
					this.ComboNum++;
					combo = this.Combos[this.ComboNum];
					if(combo) {
						this.ComboIndexes = combo.Next();
						//this.CurrentStep++;
						this.CurrentPermute = new TilePermutations(this.ComboIndexes.length);
						permute = this.CurrentPermute;
					} else {
						// we're done
					}
				} else {
					this.ComboIndexes = combo.Next();
					//this.CurrentStep++;
					this.CurrentPermute = new TilePermutations(this.ComboIndexes.length);
					permute = this.CurrentPermute;
				}
			} else {
				// we're done
			}
		}
		
		if(permute.HasMore()) {
			var aPermute = permute.Next();
			this.CurrentStep++;
			var aPermuteLen = aPermute.length;
			var aCombo = this.ComboIndexes;
			for(var i = 0; i < aPermuteLen; i++) {
				result[i] = aCombo[aPermute[i]];
			}
		}
		
		return result;
	};
};

function TilePermutations(len) {
	this.A = [];
	this.NumLeft = 0;
	this.Total = 0;
	
	if(len > 0) {
		this.Total = GetFactorial(len);
		this.NumLeft = this.Total;
		for(var i = 0; i < len; i++) {
			this.A[i] = i;
		}
	}
	
	this.Reset = function() {
		var lenA = this.A.length;
		for(var i = 0; i < lenA; i++) {
			this.A[i] = i;
		}
		this.NumLeft = this.Total;
	};
	
	this.HasMore = function() {
		return this.NumLeft > 0;
	};
	
	this.Next = function() {
		if(this.NumLeft == this.Total) {
			this.NumLeft--;
			return this.A;
		} else {
			var a = this.A;
			var temp;
			// Find largest index j with a[j] < a[j+1]
			var j = a.length - 2;
			while(a[j] > a[j+1]) { j--; }
			// Find index k such that a[k] is smallest integer
			// greater than a[j] to the right of a[j]
			var k = a.length - 1;
			while(a[j] > a[k]) { k--; }
			// Interchange a[j] and a[k]
			temp = a[k];
			a[k] = a[j];
			a[j] = temp;
			// Put tail end of permutation after jth position in increasing order
			var r = a.length - 1;
			var s = j + 1;
			while (r > s) {
				temp = a[s];
				a[s] = a[r];
				a[r] = temp;
				r--;
				s++;
			}
			this.NumLeft--;
			return a;
		}
	};
};


/* -------------------------------------------------
// Modified from http://www.merriampark.com/comb.htm
// --- Usage ---
	String[] elements = {"a", "b", "c", "d", "e", "f", "g"};
	int[] indices;
	CombinationGenerator x = new CombinationGenerator (elements.length, 3);
	StringBuffer combination;
	while (x.hasMore ()) {
	  combination = new StringBuffer ();
	  indices = x.getNext ();
	  for (int i = 0; i < indices.length; i++) {
		combination.append (elements[indices[i]]);
	  }
	  System.out.println (combination.toString ());
	}
   ------------------------------------------------- */
function TileCombinations(arrayLen, len) {
	this.N = arrayLen;
	this.R = len;
	this.A = [];

	var nFact = GetFactorial(arrayLen);
	var rFact = GetFactorial(len);
	var nminusrFact = GetFactorial(arrayLen - len);

	this.Total = nFact / (rFact * nminusrFact);
	this.NumLeft = this.Total;
	
	for (var i = 0; i < len; i++) {
		this.A[i] = i;
	}

	this.Reset = function () {
		for (var i = 0; i < this.R; i++) {
			this.A[i] = i;
		}
	};
	
	this.GetTotal = function() { return this.Total; }
	this.GetNumLeft = function() { return this.NumLeft; }
	this.HasMore = function() { return this.NumLeft > 0 ? true : false; }
	
	//--------------------------------------------------------
	// Generate next combination (algorithm from Rosen p. 286)
	//--------------------------------------------------------
	this.Next = function () {
		if(this.NumLeft == this.Total) {
			this.NumLeft = this.NumLeft - 1;
			return this.A;
		} else {
			var i = this.R - 1;
			while(this.A[i] == this.N - this.R + i) { 
				i = i - 1; 
			}
			this.A[i] = this.A[i] + 1;
			for(var j = i + 1; j < this.R; j++) { 
				this.A[j] = this.A[i] + j - i; 
			}

			this.NumLeft = this.NumLeft - 1;
			return this.A;
		}
	}
};
