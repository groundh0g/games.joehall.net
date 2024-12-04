
function Task(onInit,onDoTask,onDone,onError) {
	this.IsInitialized = false;
	this.IsRunning = false;
	this.Result = -1;
	this.ErrorMessage = null;
	this.TaskCounter = 0;
	this.Timer = null;

	this.OnInit       = onInit;
	this.OnDoTask     = onDoTask;
	this.OnDone       = onDone;
	this.OnError      = onError;
};

Task.prototype.Initialize = function(args) {
	if(this.OnInit) { this.OnInit(args); }
	this.IsInitialized = true;
	this.IsRunning = false;
	this.Result = -1;
	this.ErrorMessage = null;
	this.TaskCounter = 0;
};

Task.prototype.DoTask = function() {
	if(this.OnDoTask) { 
		this.IsRunning = true;
		this.OnDoTask();
		this.TaskCounter++;
	} else {
		this.IsRunning = false;
		this.ErrorMessage = "Nothing to do.";
		if(this.OnError) { this.OnError(); }
	}
	
	if(this.IsRunning) { 
		var _this = this;
		this.Timer = setTimeout(function() { _this.DoTask(); }, 1);
	} else {
		if(this.Timer) {
			clearTimeout(this.Timer);
		}
		this.Timer = null;
	}
};

Task.prototype.StartTask = function(args) {
	this.Initialize(args);
	this.DoTask();
};