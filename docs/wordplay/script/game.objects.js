var gameInstance = null;

function InitGame() {
	var dif = 3;
	if(gameInstance && gameInstance.AiDifficulty) { dif = gameInstance.AiDifficulty; }
	gameInstance = new WordPlay();
	gameInstance.UiReset();
//	gameInstance = new GameInstance();
//	gameInstance.InitGame();
	$("#aiMessage").text("Waiting on player.");
	gameInstance.UiUpdateScores();
	gameInstance.UiToggleButtons();
	gameInstance.SetAiDifficulty(dif);
};


function WpPlayer(name,ai,index) {
	this.Name = name ? ""+name : "Guest";
	this.AiTask = ai ? ai : null;
	this.Index = index ? parseInt(index) : -1;

	this.Score = 0;
	this.Tiles = [];
};

function WpTile(letter, score) {
	this.Letter = letter.toLowerCase();
	this.Score = score;
	this.WoodTile = 1;

	this.PlayedAt = -1; // cell ID
	this.PlayedBy = -1; // player ID
	this.PlayedOn = -1; // turn ID
	
	this.Reset = function() {
		this.PlayedAt = this.PlayedBy = this.PlayedOn = -1;
	};
};

function WpBoard() {
	this.Tiles = [];
};

WpBoard.prototype.UiInitDroppable = function() {
	for(var y = 0; y < 15; y++) {
		for(var x = 0; x < 15; x++) {
			var id = "#x" + x + "y" + y;
			$(id).droppable();
		}
	}
};

WpBoard.prototype.SpecialCells = {
	"#x0y3"   : {txt:"TW",cls:"cellTW"},
	"#x3y0"   : {txt:"TW",cls:"cellTW"},
	"#x3y14"  : {txt:"TW",cls:"cellTW"},
	"#x14y3"  : {txt:"TW",cls:"cellTW"},
	"#x0y11"  : {txt:"TW",cls:"cellTW"},
	"#x11y0"  : {txt:"TW",cls:"cellTW"},
	"#x14y11" : {txt:"TW",cls:"cellTW"},
	"#x11y14" : {txt:"TW",cls:"cellTW"},

	"#x5y1"   : {txt:"DW",cls:"cellDW"},
	"#x9y1"   : {txt:"DW",cls:"cellDW"},
	"#x7y3"   : {txt:"DW",cls:"cellDW"},
	"#x1y5"   : {txt:"DW",cls:"cellDW"},
	"#x1y9"   : {txt:"DW",cls:"cellDW"},
	"#x3y7"   : {txt:"DW",cls:"cellDW"},
	"#x5y13"  : {txt:"DW",cls:"cellDW"},
	"#x9y13"  : {txt:"DW",cls:"cellDW"},
	"#x7y11"  : {txt:"DW",cls:"cellDW"},
	"#x13y5"  : {txt:"DW",cls:"cellDW"},
	"#x13y9"  : {txt:"DW",cls:"cellDW"},
	"#x11y7"  : {txt:"DW",cls:"cellDW"},
	
	"#x6y0"   : {txt:"TL",cls:"cellTL"},
	"#x8y0"   : {txt:"TL",cls:"cellTL"},
	"#x6y14"  : {txt:"TL",cls:"cellTL"},
	"#x8y14"  : {txt:"TL",cls:"cellTL"},
	"#x0y6"   : {txt:"TL",cls:"cellTL"},
	"#x0y8"   : {txt:"TL",cls:"cellTL"},
	"#x14y6"  : {txt:"TL",cls:"cellTL"},
	"#x14y8"  : {txt:"TL",cls:"cellTL"},
	"#x3y3"   : {txt:"TL",cls:"cellTL"},
	"#x11y3"  : {txt:"TL",cls:"cellTL"},
	"#x3y11"  : {txt:"TL",cls:"cellTL"},
	"#x11y11" : {txt:"TL",cls:"cellTL"},
	"#x5y5"   : {txt:"TL",cls:"cellTL"},
	"#x9y5"   : {txt:"TL",cls:"cellTL"},
	"#x5y9"   : {txt:"TL",cls:"cellTL"},
	"#x9y9"   : {txt:"TL",cls:"cellTL"},

	"#x1y2"   : {txt:"DL",cls:"cellDL"},
	"#x2y1"   : {txt:"DL",cls:"cellDL"},
	"#x13y2"  : {txt:"DL",cls:"cellDL"},
	"#x12y1"  : {txt:"DL",cls:"cellDL"},
	"#x1y12"  : {txt:"DL",cls:"cellDL"},
	"#x2y13"  : {txt:"DL",cls:"cellDL"},
	"#x13y12" : {txt:"DL",cls:"cellDL"},
	"#x12y13" : {txt:"DL",cls:"cellDL"},
	"#x2y4"   : {txt:"DL",cls:"cellDL"},
	"#x4y2"   : {txt:"DL",cls:"cellDL"},
	"#x2y10"  : {txt:"DL",cls:"cellDL"},
	"#x4y12"  : {txt:"DL",cls:"cellDL"},
	"#x12y4"  : {txt:"DL",cls:"cellDL"},
	"#x10y2"  : {txt:"DL",cls:"cellDL"},
	"#x12y10" : {txt:"DL",cls:"cellDL"},
	"#x10y12" : {txt:"DL",cls:"cellDL"},
	"#x4y6"   : {txt:"DL",cls:"cellDL"},
	"#x4y8"   : {txt:"DL",cls:"cellDL"},
	"#x6y4"   : {txt:"DL",cls:"cellDL"},
	"#x6y10"  : {txt:"DL",cls:"cellDL"},
	"#x10y6"  : {txt:"DL",cls:"cellDL"},
	"#x10y8"  : {txt:"DL",cls:"cellDL"},
	"#x8y4"   : {txt:"DL",cls:"cellDL"},
	"#x8y10"  : {txt:"DL",cls:"cellDL"},
	
	"#x7y7"   : {txt:"*",cls:"cellCenter"}
};

function WordPlay () {
	this.WasHandleDropCalled = false;
	this.TurnNumber = 0;
	this.Board = null;
	this.Players = null;
	this.UnplayedTiles = null;
	this.AiDifficulty = 3;
	
	this.SetAiDifficulty = function(dif) {
		this.AiDifficulty = dif;
		this.UiUpdateHud();
		/*
		var lbl = "[UNKNOWN]";
		switch(dif) {
			case 0: lbl = "Easiest"; break;
			case 1: lbl = "Easier"; break;
			case 2: lbl = "Easy"; break;
			case 3: lbl = "Normal"; break;
			case 4: lbl = "Hard"; break;
			case 5: lbl = "Harder"; break;
			case 6: lbl = "Hardest"; break;
			case 7: lbl = "Match Me"; break;
		};
		$("#lblAI").text(lbl);
		for(var i = 0; i < 8; i++) {
			var id = "#dif" + i;
			$(id).attr("class","aiDifficultyCell" + (i == dif ? " sprite difficultySlider" : ""));
			//$(id).attr("class","aiDifficulty" + (i == dif ? "Active" : "") + i)
		}
		*/
	};
	
	this.MakeNumberSprites = function(num) {
		var result = "";
		num = Math.floor(num);
		while(num > 0) {
			result = "<div class='textSprite txtNum" + Math.floor(num % 10) + "'></div>" + result;
			num = Math.floor(num / 10);
		}
		if(result.length == 0) { result = "<div class='textSprite txtNum0'></div>"; }
		return result;
	};
	
	this.UiUpdateHud = function() {
		// Player Scores
		$("#scorePlayer").html(this.MakeNumberSprites(this.Players[0].Score));
		$("#scoreCPU").html(this.MakeNumberSprites(this.Players[1].Score));

		// Tiles Left
		$("#tilesLeft").html(this.MakeNumberSprites(this.UnplayedTiles.length));

		// Difficulty
		var dif = this.AiDifficulty;
		var cls = "";
		switch(dif) {
			case 0: cls = "txtDiffEasiest"; break;
			case 1: cls = "txtDiffEasier"; break;
			case 2: cls = "txtDiffEasy"; break;
			case 3: cls = "txtDiffNormal"; break;
			case 4: cls = "txtDiffHard"; break;
			case 5: cls = "txtDiffHarder"; break;
			case 6: cls = "txtDiffHardest"; break;
			case 7: cls = "txtDiffMatchMe"; break;
		};
		$("#lblDiff").attr("class","textSprite " + cls);
		
		// Difficulty Slider
		for(var i = 0; i < 8; i++) {
			$("#dif" + i).attr("class","aiDifficultyCell" + (i == dif ? " sprite difficultySlider" : ""));
		}

		// Message
		cls = "txtWaitingOnPlayer";
		if(TaskAI && TaskAI.IsRunning) {
			cls = "txtThinking";
		}else if(this.EndGame) {
			if(this.Players[0].Score > this.Players[1].Score) {
				cls = "txtEndGameWon";
			} else if(this.Players[1].Score > this.Players[0].Score) {
				cls = "txtEndGameLost";
			} else {
				cls = "txtEndGameTie";
			}
		}
		$("#lblMsg").attr("class","textSprite " + cls);
		$("#lblTimeLeftSec").css("display","none");
		$("#lblTimeLeft").html("");
	};

	this.RefillPlayerTiles = function() {
		var len1 = this.Players[0].Tiles.length;
		var len2 = this.Players[1].Tiles.length;
		var lenUnplayed = this.UnplayedTiles.length;
		while(lenUnplayed > 0 && (len1 < 7 || len2 < 7)) {
			if(len1 < 7) {
				this.Players[0].Tiles[len1] = this.UnplayedTiles[0];
				this.UnplayedTiles.splice(0,1);
				len1++; lenUnplayed--;
			}
			if(len2 < 7 && lenUnplayed > 0) {
				this.Players[1].Tiles[len2] = this.UnplayedTiles[0];
				this.UnplayedTiles.splice(0,1);
				len2++; lenUnplayed--;
			}
		}
	};

	this.Reset = function() {
		this.WasHandleDropCalled = false;
		this.TurnNumber = 0;
		this.Board = new WpBoard();
		this.Players = [
			new WpPlayer("Player 1",null,0), 
			new WpPlayer("Player 2",null,1)
		];
		this.UnplayedTiles = [
			new WpTile("A", 1),
			new WpTile("A", 1),
			new WpTile("A", 1),
			new WpTile("A", 1),
			new WpTile("A", 1),
			new WpTile("A", 1),
			new WpTile("A", 1),
			new WpTile("A", 1),
			new WpTile("A", 1),
			new WpTile("B", 3),
			new WpTile("B", 3),
			new WpTile("C", 3),
			new WpTile("C", 3),
			new WpTile("D", 2),
			new WpTile("D", 2),
			new WpTile("D", 2),
			new WpTile("D", 2),
			new WpTile("E", 1),
			new WpTile("E", 1),
			new WpTile("E", 1),
			new WpTile("E", 1),
			new WpTile("E", 1),
			new WpTile("E", 1),
			new WpTile("E", 1),
			new WpTile("E", 1),
			new WpTile("E", 1),
			new WpTile("E", 1),
			new WpTile("E", 1),
			new WpTile("E", 1),
			new WpTile("F", 4),
			new WpTile("F", 4),
			new WpTile("G", 2),
			new WpTile("G", 2),
			new WpTile("G", 2),
			new WpTile("H", 4),
			new WpTile("H", 4),
			new WpTile("I", 1),
			new WpTile("I", 1),
			new WpTile("I", 1),
			new WpTile("I", 1),
			new WpTile("I", 1),
			new WpTile("I", 1),
			new WpTile("I", 1),
			new WpTile("I", 1),
			new WpTile("I", 1),
			new WpTile("J", 7),
			new WpTile("K", 5),
			new WpTile("L", 1),
			new WpTile("L", 1),
			new WpTile("L", 1),
			new WpTile("L", 1),
			new WpTile("M", 3),
			new WpTile("M", 3),
			new WpTile("N", 1),
			new WpTile("N", 1),
			new WpTile("N", 1),
			new WpTile("N", 1),
			new WpTile("N", 1),
			new WpTile("N", 1),
			new WpTile("O", 1),
			new WpTile("O", 1),
			new WpTile("O", 1),
			new WpTile("O", 1),
			new WpTile("O", 1),
			new WpTile("O", 1),
			new WpTile("O", 1),
			new WpTile("O", 1),
			new WpTile("P", 3),
			new WpTile("P", 3),
			new WpTile("Q", 9),
			new WpTile("R", 1),
			new WpTile("R", 1),
			new WpTile("R", 1),
			new WpTile("R", 1),
			new WpTile("R", 1),
			new WpTile("R", 1),
			new WpTile("S", 1),
			new WpTile("S", 1),
			new WpTile("S", 1),
			new WpTile("S", 1),
			new WpTile("T", 1),
			new WpTile("T", 1),
			new WpTile("T", 1),
			new WpTile("T", 1),
			new WpTile("T", 1),
			new WpTile("T", 1),
			new WpTile("U", 1),
			new WpTile("U", 1),
			new WpTile("U", 1),
			new WpTile("U", 1),
			new WpTile("V", 4),
			new WpTile("V", 4),
			new WpTile("W", 4),
			new WpTile("W", 4),
			new WpTile("X", 7),
			new WpTile("Y", 4),
			new WpTile("Y", 4),
			new WpTile("Z", 9)
		];
		
		var tiles = this.UnplayedTiles;
		var len = tiles.length
		
		// assign wood tile image
		for(var iW = 0; iW < len; iW++) {
			tiles[iW].WoodTile = iW % 4 + 1;
		}

		// shuffle tiles
		for(var pass = 0; pass < 7; pass++) {
			for(var i1 = 0; i1 < len; i1++) {
				var i2 = Math.floor(Math.random() * len);
				var swp = tiles[i2];
				tiles[i2] = tiles[i1];
				tiles[i1] = swp;
			}
		}
		
		this.RefillPlayerTiles();
	};

	this.Reset();

	this.UiRevertPlayerTile = function (index,ani) {
		var id = "#p" + index;
		var tile = this.Players[0].Tiles[index];
		var woodClass = tile ? "cell sprite wood" + tile.WoodTile : "";
		$(id).attr("class", woodClass);
		var duration = ani ? 333 : 0;
		$(id).animate({ top: 0, left: 0}, duration);
		var tile = this.Players[0].Tiles[index];
		if(tile) { 
			tile.Reset(); 
			//if(ani) {
			//	this.UiEstimateScore();
			//}
		}
		//this.Players[0].SetTile(index,tile);
	};

	this.UiRevertPlayerTiles = function () {
		for(var i=0; i<7; i++) {
			this.UiRevertPlayerTile(i,true);
		}
		this.UiToggleButtons();
	};

	this.UiCreatePlayerTiles = function() {
		$("#playerTiles").html(" ");
		for(var i = 0; i < 7; i++) {
			var id = "p" + i;
			var tile = this.Players[0].Tiles[i];
			var woodClass = tile ? "sprite wood" + tile.WoodTile : "";
			$("<div class='cell " + woodClass + "'>&nbsp;</div>")
				.data("tileIndex", i )
				.attr("id", id)
				.appendTo("#playerTiles").draggable({
					containment: '#content',
					stack: '#playerTiles div',
					cursor: 'move',
					revert: true,
					stop: function(event,ui) {
						if(!gameInstance.WasHandleDropCalled) {
							var id = ui.helper.attr("id");
							var index = parseInt(id.substring(1));
							gameInstance.UiRevertPlayerTile(index,true);
						}
						gameInstance.UiToggleButtons();
					},
					start: function(event,ui) {
						gameInstance.WasHandleDropCalled = false;
					}
				});
		}
	};
	
	/*
	this.UiEstimateScore = function() {
		var num = this.NumTilesPlayed();
		var msg = "Waiting on player.";
		if(gameInstance.EndGame) {
			msg = "Game over.";
			if(this.Players[0].Score > this.Players[1].Score) {
				msg += " You won!";
			} else if(this.Players[0].Score > this.Players[1].Score) {
				msg += " CPU won.";
			} else {
				msg += " Tie game.";
			}
		} else if(num == 0) {
			msg = "Waiting on player.";
		} else {
			msg = "" + num + " tiles played";
			var result = gameInstance.ValidateTilePlacement(0);
			if(!result.isValidTilePlacement) {
				msg += ".";
			} else {
				gameInstance.ValidateWordsPlayed(0,result);
				if(result.isValidAllWords) {
					msg += ", " + result.Score + " pts.";
				} else {
					msg += ".";
				}
			}
		}
		$("#aiMessage").text(msg);
	}
	*/

	this.UiHandleDrop = function (event,ui) {
		var tileIndex = ui.draggable.data("tileIndex");
		var playerTile = gameInstance.Players[0].Tiles[tileIndex];
		var cellId = $(this).attr("id");
		if(cellId && cellId.substring(0,1) == "x") {
			var cellX = parseInt(cellId.substring(1,cellId.indexOf("y")));
			var cellY = parseInt(cellId.substring(cellId.indexOf("y")+1));
			var cellIndex = cellX + cellY * 15;
			var isOccupied = (gameInstance.Board.Tiles[cellIndex] == null) ? false : true;
			if(!isOccupied) {
				for(var i=0; i<7; i++) {
					var tile = gameInstance.Players[0].Tiles[i];
					if(i != tileIndex && tile && tile.PlayedAt == cellIndex) {
						isOccupied = true;
						break;
					}
				}
				if(!isOccupied) {
					playerTile.PlayedAt = cellIndex;
					//playerTile.SetBoardPosition(cellX,cellY);
					//gameInstance.Players[0].SetTile(tileIndex,playerTile);
					//ui.draggable.attr("class", "boardCellPlayedThisTurn");
					var tile = playerTile;
					var woodClass = tile ? " cell sprite wood" + tile.WoodTile : "";
					ui.draggable.attr("class", "boardCellPlaying" + woodClass);
					ui.draggable.position( { of: $(this), my: 'left top', at: 'left top' } );
					ui.draggable.draggable( 'option', 'revert', false );
					gameInstance.WasHandleDropCalled = true;
					//gameInstance.UiEstimateScore();
					////gameInstance.UiToggleButtons();
				}
			}
		}
	};

	this.UiCreateBoardTiles = function() {
		$("#boardTiles").html("");
		for(var y = 0; y < 15; y++) {
			for(var x = 0; x < 15; x++) {
				var id = "x"+x+"y"+y;
				$("<div class='cell sprite cellEmpty'>&nbsp;</div>")
					.attr("id",id)
					.css("float","left")
					.appendTo("#boardTiles")
					.droppable({
						accept: '#playerTiles div',
						hoverClass: 'hovered',
						drop: gameInstance.UiHandleDrop
					});
			}
		}
	};

	this.UiDrawPlayerTiles = function () {
		//var tiles = this.UnplayedTiles;
		var tiles = this.Players[0].Tiles;
		for(var i = 0; i < 7; i++) {
			var id = "#p" + i;
			var txt = "";
			if(tiles) {
				var tile = tiles[i];
				if(tile) {
					txt = "<span class='letterTile'>" + tile.Letter.toUpperCase() + "</span><span class='letterScore'>" + tile.Score + "</span>";
					$(id).css("display","");
				} else {
					$(id).css("display","none");
				}
			}
			var tile = this.Players[0].Tiles[i];
			var woodClass = tile ? "cell sprite wood" + tile.WoodTile : "";
			$(id).html(txt);
			$(id).attr("class",txt.length > 0 ? woodClass : "cell sprite cellEmpty");
		}
	};

	this.UiDrawBoardTiles = function(show) {
		var board = this.Board;
		var tiles = board.Tiles;
		var turnNumber = this.TurnNumber - 1;
		for(var y = 0; y < 15; y++) {
			for(var x = 0; x < 15; x++) {
				var id = "#x" + x + "y" + y;
				var txt = "";
				var className = "cell sprite cellEmpty";
				if(show && tiles) {
					var tile = tiles[x+y*15];
					if(tile) {
						className = "cell sprite wood" + tile.WoodTile + (tile.PlayedOn == turnNumber ? "Played" : "");
						txt = "<span class='letterTile'>" + tile.Letter.toUpperCase() + "</span><span class='letterScore'>" + tile.Score + "</span>";
//						if(tile.PlayedOn == turnNumber) {
//							className = "boardCellPlayedThisTurn" + woodClass + "a";
//						} else {
//							className = "boardCellPlayed" + woodClass;
//						}
					}
				}
				
				if(show && txt.length == 0) {
					var specialOpts = board.SpecialCells[id];
					if(specialOpts) {
						//txt = specialOpts.txt;
						className = "cell sprite " + specialOpts.cls;
					}
				}
				
				$(id).html(txt);
				$(id).attr("class", className);
			}
		}
	};
	
	this.UiEnableDragAndDrop = function (enable) {
		for(var i=0; i<7; i++) {
			var id = "#p" + i;
			var tile = this.Players[0].Tiles[i];
			var woodClass = tile ? "cell sprite wood" + tile.WoodTile : "";
			$(id).draggable(enable ? "enable" : "disable");
			$(id).attr("class", enable ? woodClass : "cell sprite cellEmpty");
		}
	};

	this.UiReset = function () {
		this.UiCreatePlayerTiles();
		this.UiCreateBoardTiles();
		this.Reset();
		this.UiDrawPlayerTiles();
		this.UiDrawBoardTiles(true);
	};
	
	this.NumTilesPlayed = function() {
		var count = 0;
		var tiles = this.Players[0].Tiles;
		var len = tiles.length;
		for(var i = 0; i < len; i++) {
			if(tiles[i].PlayedAt != -1) {
				count++;
			}
		}
		return count;
	};
	
	this.UiToggleButtons = function() {
		if(this.NumTilesPlayed() > 0) {
			$("#cmdSkip").css("display","none");
			$("#cmdSwap").css("display","none");
			$("#cmdPlay").css("display","");
			$("#cmdUndo").css("display","");
		} else {
			$("#cmdPlay").css("display","none");
			$("#cmdUndo").css("display","none");
			$("#cmdSkip").css("display","");
			$("#cmdSwap").css("display","");
		}
	};
	
	this.UiUpdateScores = function() {
		var players = gameInstance.Players;
		var unplayed = gameInstance.UnplayedTiles.length;

//		$("#scoreP0").html(players[0].Score);
//		$("#scoreP1").html(players[1].Score);
//		$("#tilesRemaining").html(unplayed);
		
		var showMessage = true;
		showMessage &= !gameInstance.EndGame;
		showMessage &= !unplayed;
		showMessage &= !players[0].Tiles.length || !players[1].Tiles.length;
		
		if(showMessage) {
			var playerIndex = players[0].Tiles.length == 0 ? 0 : 1;
			if(players[playerIndex].Tiles.length == 0) {
				var score = 0;
				var tiles = players[1-playerIndex].Tiles;
				for(var i = 0; i < tiles.length; i++) {
					score += tiles[i].Score;
				}
				players[playerIndex].Score += score;
//				players[1-playerIndex].Score -= score;
//				players[1-playerIndex].Score = Math.max(players[1-playerIndex].Score,0);
			}
//			if(players[0].Score > players[1].Score) {
//				alert("YES! You won!");
//			} else {
//				alert("Oops. CPU won.");
//			}
			gameInstance.EndGame = true;
		}
		gameInstance.UiUpdateHud();

	};
	
	this.UiPrepForAI = function(start) {
		var opt = start ? "disable" : "enable";
		gameInstance.UiEnableDragAndDrop(start ? false : true);
		$("#allTabs").css("display", (start ? "none" : ""));
		$("#allDif").css("display", (start ? "none" : ""));
		//$("#aiMessage").html(start ? "Thinking ..." : "Waiting on player.");
		$("#aiProgress").css("width", "1%");

		gameInstance.UiUpdateHud();
		if(start) { $("#lblMsg").attr("class","textSprite txtThinking"); }
	};

	this.ValidatePlayerMove = function() {
		if(!this.EndGame) {
			var result = this.ValidateTilePlacement(0);
			if(!result.isValidTilePlacement) {
				alert(result.errorMsg);
			} else {
				this.ValidateWordsPlayed(0,result);
				if(result.isValidAllWords) {
					this.Players[0].Score += result.Score;
					this.CommitPlayedTiles(0);
					this.UiToggleButtons();
					this.UiDrawPlayerTiles();
					this.UiDrawBoardTiles(true);
					this.UiUpdateScores();
					StartAI();
				}
				if(result.errorMsg) { alert(result.errorMsg); }
			}
		}
	};

	
	this.ValidateTilePlacement = function(playerIndex) {
		var result = { 
			cellMin: {X:-1, Y:-1, I:-1},
			cellMax: {X:-1, Y:-1, I:-1},
			tilesPlayed: [],
			isValidTilePlacement: false,
			errorMsg: null
			};
		
		var index = 0;
		var centerPlayed = false;
		var isFirstPlay = (this.Players[0].Score == 0 && this.Players[1].Score == 0) ? true : false;
		var tilesPlayedCount = 0;
		var lenPlayerTiles = this.Players[playerIndex].Tiles.length;
		
		while(index < lenPlayerTiles) {
			var tile = this.Players[playerIndex].Tiles[index];
			var pos = tile.PlayedAt;
			if(pos >= 0) {
				result.tilesPlayed[tilesPlayedCount] = index;
				tilesPlayedCount++;
				var posX = Math.floor(pos % 15);
				var posY = Math.floor(pos / 15);
				if(result.cellMin.I == -1 || pos < result.cellMin.I) {
					result.cellMin.I = pos;
					result.cellMin.X = posX;
					result.cellMin.Y = posY;
				}
				if(result.cellMax.I == -1 || pos > result.cellMax.I) {
					result.cellMax.I = pos;
					result.cellMax.X = posX;
					result.cellMax.Y = posY;
				}
				if(posX == 7 && posY == 7) { centerPlayed = true; }
			}
			index++;
		}
		
		if(result.cellMin.I != -1 && result.cellMax.I != -1) {
			if(result.cellMin.I == result.cellMax.I && isFirstPlay) {
				result.errorMsg = "You must place more than one tile.";
			} else if(isFirstPlay && !centerPlayed) {
				result.errorMsg = "The first word played must touch the center tile.";
			} else {
				var dX = result.cellMax.X - result.cellMin.X;
				var dY = result.cellMax.Y - result.cellMin.Y;
				if(dX == 0 && dY == 0) {
					// assume valid placement, will check for
					// surrounding tiles in separate step.
					result.isValidTilePlacement = true;
				}
				
				if(!result.isValidTilePlacement) {
					var dI = 0;
					if(dX == 0) {
						dI = 15;
					} else if(dY == 0) {
						dI = 1;
					} else {
						result.errorMsg = "Tiles must be played in a row (horizontal or vertical).";
					}
					
					if(dI > 0) {
						var valid = true;
						var maxI = result.cellMax.I;
						index = result.cellMin.I;
						while(index <= maxI) {
							if(!valid) { break; }
							valid = false;
							if(this.Board.Tiles[index]) {
								valid = true;
							} else {
								for(var i = 0; i < tilesPlayedCount; i++) {
									if(index == this.Players[playerIndex].Tiles[result.tilesPlayed[i]].PlayedAt) {
										valid = true;
										break;
									}
								}
							}
							index += dI;
						}
						if(valid) { 
							result.isValidTilePlacement = true; 
						} else {
							result.errorMsg = "Tile must be contiguous (no gaps).";
						}
					}
				}
				
				if(result.isValidTilePlacement && !isFirstPlay) {
					// if not first play, must touch another tile
					var valid = false;
					for(var i = 0; i < tilesPlayedCount; i++) {
						index = this.Players[playerIndex].Tiles[result.tilesPlayed[i]].PlayedAt;
						var x = Math.floor(index % 15);
						var y = Math.floor(index / 15);

						if(x > 0  && this.Board.Tiles[index - 1]) { 
							valid = true; 
							break;
						} else if(y>0  && this.Board.Tiles[index - 15]) { 
							valid = true; 
							break;
						} else if(x<14 && this.Board.Tiles[index + 1]) { 
							valid = true; 
							break;
						} else if(y<14 && this.Board.Tiles[index + 15]) { 
							valid = true; 
							break;
						} 
					}
					
					if(!valid) {
						result.isValidTilePlacement = false;
						result.errorMsg = "At least one of the played tiles must be placed next to an existing tile.";
					}
				}
			}
		} else {
			result.errorMsg = "No tiles were placed? Strange.";
		}
		
		return result;
	};

	this.ValidateWordsPlayed = function(playerIndex, result) {
		if(result) {
			result.wordsPlayed = [];
			result.isValidAllWords = false;
			result.Score = 0;
			var tiles = result.tilesPlayed;

			var minX = result.cellMin.X;
			var maxX = result.cellMax.X;
			var minY = result.cellMin.Y;
			var maxY = result.cellMax.Y;
			var minI = result.cellMin.I;
			var maxI = result.cellMax.I;
			
			if(minI >= 0) {
				if(minX == -1) { minX = Math.floor(minI%15); }
				if(minY == -1) { minY = Math.floor(minI/15); }
			}
			if(maxI >= 0) {
				if(maxX == -1) { maxX = Math.floor(maxI%15); }
				if(maxY == -1) { maxY = Math.floor(maxI/15); }
			}

			var dI = 0;
			
			if(minI == maxI) {
				// played single tile. guess at orientation
				if(this.GetTile(playerIndex,tiles,minI-1) || this.GetTile(playerIndex,tiles,minI+1)) {
					dI = 1;
				} else if(this.GetTile(playerIndex,tiles,minI-15) || this.GetTile(playerIndex,tiles,minI+15)) {
					dI = 15;
				} else {
					// first word played? technically an error since min length is 2 tiles
					result.errorMsg = "One tile played. Doesn't touch an already-played tile.";
				}
			} else {
				if(maxX == minX) {
					dI = 15;
				} else if(maxY == minY) {
					dI = 1;
				} else {
					result.errorMsg = "Tiles don't appear to be colinear.";
				}
			}
			
			if(dI > 0) {
				var score = 0;
				var bonus = 1;
				var cellScore = 0;
				var tile = this.FindFirstWordTile(playerIndex, tiles, minI, dI);
				var branching = [];
				var branchingLen = 0;
				var wordsPlayed = [];
				var wordsPlayedLen = 0;
				var index = tile.PlayedAt;
				var dI2 = 16 - dI; // toggle 1|15
				
				var word = this.ScanForWord(playerIndex, tiles, index, dI);
				if(WordHelper.FindWord(word) < 0) {
					// sorry. you're not a winner.
					result.errorMsg = "'" + word + "' is not a valid word.";
				} else {
					var lenWord = word.length;
					var boardTiles = this.Board.Tiles;

					wordsPlayed[wordsPlayedLen++] = word;

					// tally score, check for branching words
					var numTilesPlayed = 0;
					for(var i = index; i < index + lenWord * dI; i += dI) {
						tile = this.GetTile(playerIndex,tiles,i);
						cellScore = tile.Score;
						if(!boardTiles[i]) {
							// newly-played tile, check for bonuses
							numTilesPlayed++;
							var special = this.Board.SpecialCells["#x" + Math.floor(i % 15) + "y" + Math.floor(i / 15)];
							if(special) {
								switch(special.txt) {
									case 'DL':
										cellScore = cellScore * 2;
										break;
									case 'TL':
										cellScore = cellScore * 3;
										break;
									case 'DW':
									//case '*':
										bonus = bonus * 2;
										break;
									case 'TW':
										bonus = bonus * 3;
										break;
								}
							}

							// cap branching scan so that we don't wrap to other side of board
							var minScanI = (dI2 == 15 ? 0     : i - Math.floor(i%15));
							var maxScanI = (dI2 == 15 ? 15*15 : i - Math.floor(i%15) + 15) - 1;

							if((i > minScanI) && boardTiles[i-dI2]) {
								branching[branchingLen++] = i;
							} else if((i < maxScanI) && boardTiles[i+dI2]) {
								branching[branchingLen++] = i;
							}
						}
						score = score + cellScore;
					}
					score *= bonus;
					
					if(numTilesPlayed == 7) {
						score += 50;
					}

					// validate branching words
					var branchingValid = true; // assume success
					for(var i = 0; i < branchingLen; i++) {
						tile = this.FindFirstWordTile(playerIndex,tiles,branching[i],dI2);
						index = tile.PlayedAt;
						word = this.ScanForWord(playerIndex,tiles,index,dI2);
						lenWord = word.length;
						wordsPlayed[wordsPlayedLen++] = word;
						if(WordHelper.FindWord(word) < 0) {
							branchingValid = false;
							result.errorMsg = "'" + word + "' is not a valid word..";
							break;
						} else {
							var branchWordScore = 0;
							bonus = 1;
							for(var iBWord = index; iBWord < index + lenWord * dI2; iBWord += dI2) {
								tile = this.GetTile(playerIndex,tiles,iBWord);
								cellScore = tile.Score;
								if(!boardTiles[iBWord]) {
									// newly-played tile, check for bonuses
									var special = this.Board.SpecialCells["#x" + Math.floor(iBWord % 15) + "y" + Math.floor(iBWord / 15)];
									if(special) {
										switch(special.txt) {
											case 'DL':
												cellScore = cellScore * 2;
												break;
											case 'TL':
												cellScore = cellScore * 3;
												break;
											case 'DW':
											//case '*':
												bonus = bonus * 2;
												break;
											case 'TW':
												bonus = bonus * 3;
												break;
										}
									}
								}
								branchWordScore += cellScore;
							}
							score += branchWordScore * bonus;
						}
					}
					if(branchingValid) {
						result.isValidAllWords = true;
						result.Score = score;
					}
				}

				result.WordsPlayed = wordsPlayed;
			}
		} else {
			result = { 
				cellMin: {X:-1, Y:-1, I:-1},
				cellMax: {X:-1, Y:-1, I:-1},
				tilesPlayed: [],
				isValidTilePlacement: false,
				wordsPlayed: [],
				isValidAllWords: false,
				errorMsg: "ValidateTilePlacement must be called before ValidateWordsPlayed.",
				Score: 0
				};
		}
		
		return result;
	};
	
	this.Log = function(msg) {
		if(console && console.log) {
			console.log(msg);
		}
	};

	this.GetTile = function(playerIndex,tiles,index) {
		var tile = this.Board.Tiles[index];
		if(!tile) {
			var len = tiles.length;
			for(var i = 0; i < len; i++) {
				tile = this.Players[playerIndex].Tiles[tiles[i]];
				if(tile.PlayedAt == index) { 
					break; 
				}
				tile = null;
			}
		}
		return tile;
	}

	this.FindFirstWordTile = function(playerIndex,tiles,index,dI) {
		var tile = this.GetTile(playerIndex,tiles,index);
		var minI = (
			dI == 1 ?
			index - Math.floor(index%15) :
			0);
		while(index > minI) {
			index -= dI;
			var t = this.GetTile(playerIndex,tiles,index);
			if(t) { 
				tile = t;
			} else {
				break;
			}
		}
		return tile;
	};
	
	this.ScanForWord = function(playerIndex, tiles, index, dI) {
		var word = "";
		var maxI = (
			dI == 1 ?
			index + 15 - Math.floor(index % 15)  :
			15*15);
		var tile = this.GetTile(playerIndex,tiles,index);
		while(tile && index < maxI) {
			word += tile.Letter;
			index += dI;
			tile = this.GetTile(playerIndex,tiles,index);
		}
		return word;
	};
	
	this.CommitPlayedTiles = function(playerIndex) {
		var oldTiles = this.Players[playerIndex].Tiles;
		var newTiles = [];
		var lenOld = oldTiles.length;
		var lenNew = 0;

		for(var i = 0; i < lenOld; i++) {
			var tile = oldTiles[i];
			if(tile.PlayedAt >= 0) {
				this.Board.Tiles[tile.PlayedAt] = tile;
				tile.PlayedOn = this.TurnNumber;
				tile.PlayedBy = playerIndex;
				oldTiles[i] = null;
				gameInstance.UiRevertPlayerTile(i,false);
			} else {
				newTiles[lenNew] = tile;
				lenNew++;
			}
		}
		
		this.Players[playerIndex].Tiles = newTiles;
		this.RefillPlayerTiles();
		this.TurnNumber++;
	};
	
	this.UiDrawHintTiles = function() {
		var tiles = this.Players[0].Tiles;
		var tilesLen = tiles.length;
		var boardTiles = this.Board.Tiles;
		
		for(var i = 0; i < tilesLen; i++) {
			var index = tiles[i].PlayedAt;
			if(index >= 0) {
				// draw hint
				var tile = tiles[i];
				var id = "#x" + Math.floor(index%15) + "y" + Math.floor(index/15);
				var txt = "<span class='letterTile'>" + tile.Letter.toUpperCase() + "</span><span class='letterScore'>" + tile.Score + "</span>";
				var className = "cell sprite cellEmpty";
				$(id).html(txt);
				$(id).attr("class", className);
				tile.Reset();
			}
		}
	}
	
	this.UiSkipTurn = function(playerIndex) {
		if(!gameInstance.EndGame) {
			this.TurnNumber++;
	
			var playerTiles = gameInstance.Players[playerIndex].Tiles;
			if(playerIndex == 0) {
				for(var i = 0; i < 7; i++) {
					gameInstance.UiRevertPlayerTile(i,false);
				}
			} else {
				for(var i = 0; i < 7; i++) {
					if(playerTiles[i]) { playerTiles[i].Reset(); }
				}
			}
	
			gameInstance.UiUpdateScores();
			gameInstance.UiToggleButtons();
			gameInstance.UiDrawPlayerTiles();
			gameInstance.UiDrawBoardTiles(true);
	
			if(playerIndex == 0) {
				gameInstance.UiPrepForAI(true);
				StartAI();
			} else {
				gameInstance.UiPrepForAI(false);
			}
		}
	};
};

