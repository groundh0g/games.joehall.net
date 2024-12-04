// ------------------
// -- Word validation
// ------------------
var WordHelper = {
	WordList : new Array(),
	WordListCount : function() {
		var cnt = 0; 
		for(var key in this.WordList) { cnt++; }
		return cnt;
	},
	FindWord : function(word) {
		var pos = -1;
		if(word && word.length > 1) {
			//word = word.toLowerCase();
			var key = word.charAt(0) + word.length;
			var list = this.WordList[key];
			if(list && list.length > 0) {
				pos = this.BinaryWordSearch(list,word.substring(1));
			}
		}
		return pos;
	},
	BinaryWordSearch : function(list,word) {
		var position = -1;
		var wordLength = word.length;
		var listLength = list.length;
		var l = 0;
		var r = Math.floor(listLength / wordLength - 1);
		var m = 0;
		var match = false;

		while(r >= l) {
			m = Math.floor((l + r) / 2);
			position = m * wordLength;
			var data = list.substring(position, position + wordLength);
			match = true;
			for(var i = 0; i < wordLength; i++) {
				if(word.charAt(i) != data.charAt(i)) { 
					match = false;
					if(word.charAt(i) < data.charAt(i)) {
						r = m - 1;
					} else  {
						l = m + 1;
					}
					break; 
				}
			}
			if(match) { r = -1; }
		}
		if(!match) { position = -1; }
		return position;
	}
}
// ------------------


// ------------------
// -- Load words task
// ------------------
var TaskLoadWords = new Task(
	// onInit
	function (args) {
		this.Alphabet = "abcdefghijklmnopqrstuvwxyz";
		this.AlphaIndex = 0;

		this.MinLen = 2;
		this.MaxLen = 15;
		this.LenIndex = this.MinLen;

		this._total = this.Alphabet.length * (this.MaxLen - this.MinLen + 1);
        $("#loadingMessage").text("Initializing Loader");
        $("#loadingProgress").width(0);
	},
	// onDoTask
	function () {
		var alpha = this.Alphabet.charAt(this.AlphaIndex);
		var path = 'words/' + this.LenIndex + "/" + alpha + ".txt";
		//var path = 'http://c775495.r95.cf2.rackcdn.com/words/' + this.LenIndex + "/" + alpha + ".txt";
		var key = alpha + this.LenIndex;
		jQuery.ajax({
			url: path,
			dataType: 'text',
			success: function(data) { WordHelper.WordList[key] = "" + data; },
			async: false
			});
		this.LenIndex++;
		if(this.LenIndex > this.MaxLen) {
			this.LenIndex = this.MinLen;
			this.AlphaIndex++;
		}
		if(this.AlphaIndex >= this.Alphabet.length) {
			this.IsRunning = false;
			this.Result = 0;
			if(this.OnDone) { this.OnDone(); }
		}
        //$("#index").text();
        
        var i = this.AlphaIndex * (this.MaxLen - this.MinLen) + this.LenIndex - this.MinLen;
		var pct = Math.floor(100 * i / this._total);
        $("#loadingMessage").text("Loading " + i + " of " + this._total + ".");
        $("#loadingProgress").css("width",pct + "%");
	},
	// onDone
	function () {
		$("#loadingPanel").hide();
		//$("#testPanel").show();
		$("#boardPanel").show();
        InitGame();
	},
	// onError
	function () {
		//$("#foo").text("Error: " + this.ErrorMessage);
	});
// ------------------

