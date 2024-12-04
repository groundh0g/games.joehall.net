var isDebugDivShown = false;
function SaveState() {
	if(!isDebugDivShown) {
		var players = gameInstance.Players;
		var boardTiles = gameInstance.Board.Tiles;
		var unplayedTiles = gameInstance.UnplayedTiles;
		
		var output = "WordPlay";
		
		output += "%UP";
		for(var i = 0; i < unplayedTiles.length; i++) {
			output += "," + SerializeTile(unplayedTiles[i]);
		}
		
		output += "%P1," + players[0].Score; 
		for(var i = 0; i < 7; i++) {
			output += "," + SerializeTile(players[0].Tiles[i]);
		}
		
		output += "%P2," + players[1].Score; 
		for(var i = 0; i < 7; i++) {
			output += "," + SerializeTile(players[1].Tiles[i]);
		}
	
		output += "%BD";
		for(var i = 0; i < 15*15; i++) {
			output += "," + SerializeTile(boardTiles[i]);
		}
		
		$("#debugDiv").css("display","");
		$("#debugOut").text(output);
	} else {
		$("#debugDiv").css("display","none");
	}
	isDebugDivShown = !isDebugDivShown;
}

function RestoreState() {
	var input = $("#debugOut").val();
	var parts = input.split("%");
	
	var tiles = [];
	var len = 0;
	var state = parts[1].split(",");
	var lenState = state.length;
	for(var i = 1; i < lenState; i++) {
		tiles[len++] = DeserializeTile(state[i]);
	}
	gameInstance.UnplayedTiles = tiles;
	
	tiles = [];
	len = 0;
	state = parts[2].split(",");
	lenState = state.length;
	gameInstance.Players[0].Score = Math.floor(state[1]);
	for(var i = 2; i < lenState; i++) {
		tiles[len++] = DeserializeTile(state[i]);
	}
	gameInstance.Players[0].Tiles = tiles;
	
	tiles = [];
	len = 0;
	state = parts[3].split(",");
	lenState = state.length;
	gameInstance.Players[1].Score = Math.floor(state[1]);
	for(var i = 2; i < lenState; i++) {
		tiles[len++] = DeserializeTile(state[i]);
	}
	gameInstance.Players[1].Tiles = tiles;
	
	tiles = [];
	state = parts[4].split(",");
	lenState = state.length;
	for(var i = 1; i < lenState; i++) {
		var t = DeserializeTile(state[i]);
		if(t) { 
			tiles[t.PlayedAt] = t; 
		}
	}
	gameInstance.Board.Tiles = tiles;

	gameInstance.UiDrawPlayerTiles();
	gameInstance.UiDrawBoardTiles(true);
	gameInstance.UiUpdateScores();
}

function SerializeTile(tile) {
	return (tile ? 
		tile.Letter + "|" +
		tile.Score + "|" +
		tile.PlayedBy + "|" +
		tile.PlayedAt + "|" +
		tile.PlayedOn + "|" :
		"[null]");
}

function DeserializeTile(tile) {
	var parts = $.trim(tile).split("|");
	var tile = null;
	if(parts.length > 1) {
		tile = new WpTile(parts[0],Math.floor(parts[1]));
		tile.PlayedBy = Math.floor(parts[2]);
		tile.PlayedAt = Math.floor(parts[3]);
		tile.PlayedOn = Math.floor(parts[4]);
	}
	return tile;
}


/*********************************
	INVALID HINT [JLULA]
	INVALID XREF [PEJ]
WordPlay%UP,W|4|-1|-1|-1|,R|1|-1|-1|-1|,P|3|-1|-1|-1|,A|1|-1|-1|-1|,E|1|-1|-1|-1|,R|1|-1|-1|-1|,D|2|-1|-1|-1|,H|4|-1|-1|-1|,A|1|-1|-1|-1|,O|1|-1|-1|-1|,M|3|-1|-1|-1|,N|1|-1|-1|-1|,N|1|-1|-1|-1|,Y|4|-1|-1|-1|,Z|9|-1|-1|-1|,T|1|-1|-1|-1|,W|4|-1|-1|-1|,I|1|-1|-1|-1|,A|1|-1|-1|-1|,D|2|-1|-1|-1|,E|1|-1|-1|-1|,H|4|-1|-1|-1|,O|1|-1|-1|-1|,N|1|-1|-1|-1|,A|1|-1|-1|-1|,U|1|-1|-1|-1|,O|1|-1|-1|-1|,G|2|-1|-1|-1|,E|1|-1|-1|-1|,I|1|-1|-1|-1|,I|1|-1|-1|-1|,R|1|-1|-1|-1|,V|4|-1|-1|-1|,G|2|-1|-1|-1|,X|7|-1|-1|-1|,T|1|-1|-1|-1|,E|1|-1|-1|-1|,F|4|-1|-1|-1|,M|3|-1|-1|-1|,O|1|-1|-1|-1|,G|2|-1|-1|-1|,E|1|-1|-1|-1|,E|1|-1|-1|-1|,N|1|-1|-1|-1|,D|2|-1|-1|-1|,L|1|-1|-1|-1|,R|1|-1|-1|-1|,E|1|-1|-1|-1|,A|1|-1|-1|-1|,K|5|-1|-1|-1|,O|1|-1|-1|-1|,E|1|-1|-1|-1|,L|1|-1|-1|-1|,Q|9|-1|-1|-1|,V|4|-1|-1|-1|,T|1|-1|-1|-1|,R|1|-1|-1|-1|,A|1|-1|-1|-1|,N|1|-1|-1|-1|,I|1|-1|-1|-1|,D|2|-1|-1|-1|,I|1|-1|-1|-1|,E|1|-1|-1|-1|,S|1|-1|-1|-1|,U|1|-1|-1|-1|,C|3|-1|-1|-1|,I|1|-1|-1|-1|,T|1|-1|-1|-1|,E|1|-1|-1|-1|,I|1|-1|-1|-1|,O|1|-1|-1|-1|,A|1|-1|-1|-1|,C|3|-1|-1|-1|,S|1|-1|-1|-1|,O|1|-1|-1|-1|,R|1|-1|-1|-1|%P1,0,L|1|-1|-1|-1|,A|1|-1|-1|-1|,S|1|-1|-1|-1|,A|1|-1|-1|-1|,L|1|-1|-1|-1|,U|1|-1|-1|-1|,J|7|-1|-1|-1|%P2,16,F|4|-1|-1|-1|,B|3|-1|-1|-1|,Y|4|-1|-1|-1|,B|3|-1|-1|-1|,E|1|-1|-1|-1|,I|1|-1|-1|-1|,T|1|-1|-1|-1|%BD,[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],T|1|1|112|1|,O|1|1|113|3|,[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],U|1|1|127|1|,N|1|1|128|3|,[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],P|3|1|142|1|,E|1|1|143|3|,[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null]

	INVALID HINT [QULZAL]
WordPlay%UP,a|1|-1|-1|-1|,o|1|-1|-1|-1|,p|3|-1|-1|-1|,p|3|-1|-1|-1|,a|1|-1|-1|-1|,e|1|-1|-1|-1|,y|4|-1|-1|-1|,h|4|-1|-1|-1|,n|1|-1|-1|-1|,i|1|-1|-1|-1|,f|4|-1|-1|-1|,a|1|-1|-1|-1|,u|1|-1|-1|-1|,k|5|-1|-1|-1|,y|4|-1|-1|-1|,i|1|-1|-1|-1|,e|1|-1|-1|-1|,b|3|-1|-1|-1|,a|1|-1|-1|-1|,m|3|-1|-1|-1|,t|1|-1|-1|-1|,n|1|-1|-1|-1|,i|1|-1|-1|-1|,s|1|-1|-1|-1|,e|1|-1|-1|-1|,g|2|-1|-1|-1|,g|2|-1|-1|-1|,l|1|-1|-1|-1|,f|4|-1|-1|-1|,w|4|-1|-1|-1|,t|1|-1|-1|-1|,u|1|-1|-1|-1|,v|4|-1|-1|-1|,o|1|-1|-1|-1|,d|2|-1|-1|-1|,o|1|-1|-1|-1|,i|1|-1|-1|-1|,g|2|-1|-1|-1|,r|1|-1|-1|-1|,l|1|-1|-1|-1|,b|3|-1|-1|-1|,o|1|-1|-1|-1|,a|1|-1|-1|-1|,e|1|-1|-1|-1|,j|7|-1|-1|-1|,o|1|-1|-1|-1|,r|1|-1|-1|-1|,m|3|-1|-1|-1|,a|1|-1|-1|-1|,r|1|-1|-1|-1|,c|3|-1|-1|-1|,e|1|-1|-1|-1|,d|2|-1|-1|-1|,i|1|-1|-1|-1|,n|1|-1|-1|-1|,d|2|-1|-1|-1|,h|4|-1|-1|-1|,t|1|-1|-1|-1|,r|1|-1|-1|-1|,c|3|-1|-1|-1|,t|1|-1|-1|-1|,w|4|-1|-1|-1|,n|1|-1|-1|-1|,u|1|-1|-1|-1|,s|1|-1|-1|-1|,i|1|-1|-1|-1|,o|1|-1|-1|-1|,i|1|-1|-1|-1|,e|1|-1|-1|-1|%P1,28,e|1|-1|-1|-1|,u|1|-1|-1|-1|,l|1|-1|-1|-1|,a|1|-1|-1|-1|,l|1|-1|-1|-1|,q|9|-1|-1|-1|,r|1|-1|-1|-1|%P2,63,o|1|-1|-1|-1|,a|1|-1|-1|-1|,r|1|-1|-1|-1|,s|1|-1|-1|-1|,i|1|-1|-1|-1|,v|4|-1|-1|-1|,e|1|-1|-1|-1|%BD,[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],d|2|0|109|0|,a|1|0|110|0|,t|1|0|111|0|,e|1|0|112|0|,[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],e|1|1|124|1|,x|7|1|125|1|,o|1|1|126|1|,n|1|1|127|1|,[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],n|1|0|139|2|,e|1|0|140|2|,e|1|0|141|2|,[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],z|9|1|152|3|,i|1|1|153|3|,t|1|1|154|3|,s|1|1|155|3|,[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null]

	INVALID XREF [TLLE] & [LRATER]
WordPlay%UP,t|1|-1|-1|-1|,p|3|-1|-1|-1|,s|1|-1|-1|-1|,g|2|-1|-1|-1|,l|1|-1|-1|-1|,a|1|-1|-1|-1|,t|1|-1|-1|-1|,e|1|-1|-1|-1|,e|1|-1|-1|-1|,l|1|-1|-1|-1|,e|1|-1|-1|-1|,i|1|-1|-1|-1|,o|1|-1|-1|-1|,u|1|-1|-1|-1|,w|4|-1|-1|-1|,m|3|-1|-1|-1|,o|1|-1|-1|-1|,g|2|-1|-1|-1|,a|1|-1|-1|-1|,b|3|-1|-1|-1|%P1,195,z|9|-1|-1|-1|,i|1|-1|-1|-1|,v|4|-1|-1|-1|,i|1|-1|-1|-1|,o|1|-1|-1|-1|,n|1|-1|-1|-1|,y|4|-1|-1|-1|%P2,218,i|1|-1|-1|-1|,d|2|-1|-1|-1|,t|1|-1|-1|-1|,i|1|-1|-1|-1|,r|1|-1|-1|-1|,b|3|-1|-1|-1|,a|1|-1|-1|-1|%BD,[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],j|7|0|52|6|,[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],p|3|1|66|5|,u|1|1|67|5|,n|1|1|68|5|,[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],f|4|0|80|4|,i|1|0|81|4|,n|1|0|82|4|,e|1|0|83|4|,s|1|1|84|9|,[null],[null],[null],[null],[null],[null],[null],[null],t|1|0|93|2|,o|1|0|94|2|,e|1|0|95|2|,[null],k|5|0|97|6|,[null],u|1|1|99|9|,[null],[null],[null],[null],[null],[null],[null],[null],a|1|1|108|1|,r|1|1|109|1|,r|1|0|110|0|,a|1|0|111|0|,y|4|0|112|0|,[null],q|9|1|114|9|,u|1|1|115|11|,a|1|1|116|11|,d|2|1|117|11|,[null],[null],[null],n|1|1|121|7|,o|1|1|122|3|,n|1|1|123|3|,c|3|1|124|3|,e|1|1|125|3|,[null],[null],[null],[null],[null],c|3|0|131|12|,[null],[null],[null],m|3|0|135|10|,o|1|1|136|7|,w|4|0|137|10|,[null],[null],[null],[null],[null],[null],[null],[null],i|1|0|146|12|,[null],[null],[null],o|1|0|150|8|,h|4|1|151|7|,[null],[null],[null],[null],[null],[null],[null],h|4|0|159|18|,[null],d|2|0|161|12|,[null],[null],[null],v|4|0|165|8|,[null],[null],[null],t|1|1|169|19|,[null],[null],[null],[null],a|1|0|174|18|,[null],s|1|1|176|17|,e|1|1|177|17|,g|2|1|178|17|,s|1|1|179|17|,e|1|0|180|8|,f|4|1|181|13|,[null],[null],l|1|1|184|19|,r|1|0|185|16|,a|1|0|186|16|,t|1|0|187|16|,e|1|0|188|16|,r|1|0|189|18|,[null],[null],[null],[null],[null],r|1|0|195|8|,e|1|1|196|13|,[null],o|1|1|198|15|,l|1|1|199|15|,e|1|1|200|15|,a|1|1|201|15|,[null],[null],d|2|0|204|18|,[null],[null],[null],[null],[null],[null],n|1|1|211|13|,i|1|0|212|14|,x|7|0|213|14|,e|1|1|214|19|,[null],[null],[null],[null],[null],[null],[null],[null],[null],[null]

	INVALID HINT [DAINUY]
WordPlay%UP,o|1|-1|-1|-1|,g|2|-1|-1|-1|,i|1|-1|-1|-1|,i|1|-1|-1|-1|,u|1|-1|-1|-1|,i|1|-1|-1|-1|,o|1|-1|-1|-1|,a|1|-1|-1|-1|,e|1|-1|-1|-1|,b|3|-1|-1|-1|,d|2|-1|-1|-1|,l|1|-1|-1|-1|,h|4|-1|-1|-1|,e|1|-1|-1|-1|,r|1|-1|-1|-1|,s|1|-1|-1|-1|,e|1|-1|-1|-1|,d|2|-1|-1|-1|,i|1|-1|-1|-1|,d|2|-1|-1|-1|,t|1|-1|-1|-1|,a|1|-1|-1|-1|,l|1|-1|-1|-1|,n|1|-1|-1|-1|,c|3|-1|-1|-1|,w|4|-1|-1|-1|,o|1|-1|-1|-1|,a|1|-1|-1|-1|,g|2|-1|-1|-1|,z|9|-1|-1|-1|,n|1|-1|-1|-1|,e|1|-1|-1|-1|,e|1|-1|-1|-1|,r|1|-1|-1|-1|,l|1|-1|-1|-1|,i|1|-1|-1|-1|,a|1|-1|-1|-1|,o|1|-1|-1|-1|,b|3|-1|-1|-1|,t|1|-1|-1|-1|,s|1|-1|-1|-1|,e|1|-1|-1|-1|,i|1|-1|-1|-1|,e|1|-1|-1|-1|,m|3|-1|-1|-1|,g|2|-1|-1|-1|,e|1|-1|-1|-1|,x|7|-1|-1|-1|,a|1|-1|-1|-1|,v|4|-1|-1|-1|,t|1|-1|-1|-1|,l|1|-1|-1|-1|,o|1|-1|-1|-1|,w|4|-1|-1|-1|,o|1|-1|-1|-1|,u|1|-1|-1|-1|,e|1|-1|-1|-1|,a|1|-1|-1|-1|,n|1|-1|-1|-1|,e|1|-1|-1|-1|,r|1|-1|-1|-1|,t|1|-1|-1|-1|,c|3|-1|-1|-1|,h|4|-1|-1|-1|,p|3|-1|-1|-1|,q|9|-1|-1|-1|,v|4|-1|-1|-1|,m|3|-1|-1|-1|,r|1|-1|-1|-1|,i|1|-1|-1|-1|,k|5|-1|-1|-1|,s|1|-1|-1|-1|,r|1|-1|-1|-1|,f|4|-1|-1|-1|,i|1|-1|-1|-1|,f|4|-1|-1|-1|,n|1|-1|-1|-1|,s|1|-1|-1|-1|,t|1|-1|-1|-1|,r|1|-1|-1|-1|%P1,0,t|1|-1|-1|-1|,u|1|-1|-1|-1|,a|1|-1|-1|-1|,d|2|-1|-1|-1|,i|1|-1|-1|-1|,u|1|-1|-1|-1|,y|4|-1|-1|-1|%P2,9,e|1|-1|-1|-1|,a|1|-1|-1|-1|,o|1|-1|-1|-1|,e|1|-1|-1|-1|,a|1|-1|-1|-1|,n|1|-1|-1|-1|,j|7|-1|-1|-1|%BD,[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],p|3|1|112|1|,o|1|1|113|1|,n|1|1|114|1|,y|4|1|115|1|,[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null]

	INVALID HINT [tuwed] -- from SJones 
WordPlay%UP,e|1|-1|-1|-1|,j|7|-1|-1|-1|,n|1|-1|-1|-1|,i|1|-1|-1|-1|,t|1|-1|-1|-1|,f|4|-1|-1|-1|,b|3|-1|-1|-1|,i|1|-1|-1|-1|,d|2|-1|-1|-1|,m|3|-1|-1|-1|,r|1|-1|-1|-1|,t|1|-1|-1|-1|,r|1|-1|-1|-1|,r|1|-1|-1|-1|,q|9|-1|-1|-1|,a|1|-1|-1|-1|,m|3|-1|-1|-1|,a|1|-1|-1|-1|,s|1|-1|-1|-1|,r|1|-1|-1|-1|,i|1|-1|-1|-1|,z|9|-1|-1|-1|,b|3|-1|-1|-1|,l|1|-1|-1|-1|,i|1|-1|-1|-1|,e|1|-1|-1|-1|,e|1|-1|-1|-1|,a|1|-1|-1|-1|,g|2|-1|-1|-1|,s|1|-1|-1|-1|,l|1|-1|-1|-1|,c|3|-1|-1|-1|,n|1|-1|-1|-1|,p|3|-1|-1|-1|,t|1|-1|-1|-1|,y|4|-1|-1|-1|,d|2|-1|-1|-1|,l|1|-1|-1|-1|,o|1|-1|-1|-1|,n|1|-1|-1|-1|,h|4|-1|-1|-1|,e|1|-1|-1|-1|,f|4|-1|-1|-1|,v|4|-1|-1|-1|,i|1|-1|-1|-1|,e|1|-1|-1|-1|,a|1|-1|-1|-1|,i|1|-1|-1|-1|,a|1|-1|-1|-1|,o|1|-1|-1|-1|,i|1|-1|-1|-1|,n|1|-1|-1|-1|,i|1|-1|-1|-1|,o|1|-1|-1|-1|,x|7|-1|-1|-1|,w|4|-1|-1|-1|,g|2|-1|-1|-1|,s|1|-1|-1|-1|,a|1|-1|-1|-1|,t|1|-1|-1|-1|,k|5|-1|-1|-1|,u|1|-1|-1|-1|,o|1|-1|-1|-1|,u|1|-1|-1|-1|,e|1|-1|-1|-1|,g|2|-1|-1|-1|,i|1|-1|-1|-1|,e|1|-1|-1|-1|,r|1|-1|-1|-1|,r|1|-1|-1|-1|,e|1|-1|-1|-1|,n|1|-1|-1|-1|,t|1|-1|-1|-1|,o|1|-1|-1|-1|,e|1|-1|-1|-1|,a|1|-1|-1|-1|%P1,6,d|2|-1|161|-1|,t|1|-1|101|-1|,w|4|-1|131|-1|,a|1|-1|-1|-1|,u|1|-1|116|-1|,e|1|-1|146|-1|,o|1|-1|-1|-1|%P2,20,u|1|-1|-1|-1|,h|4|-1|-1|-1|,e|1|-1|-1|-1|,y|4|-1|-1|-1|,p|3|-1|-1|-1|,d|2|-1|-1|-1|,s|1|-1|-1|-1|%BD,[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],c|3|0|112|0|,o|1|0|113|0|,a|1|0|114|0|,l|1|0|115|0|,[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],o|1|1|127|1|,[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],v|4|1|142|1|,[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],e|1|1|157|1|,[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],n|1|1|172|1|,[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null],[null]
 
 *********************************/