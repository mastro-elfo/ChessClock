
var Clock = function () {
	/**
	 * _status can be null|'white'|'black'
	 */
	this._status = null;
	
	this._whiteClock = 0;
	this._blackClock = 0;
	this._startValue = {
		ss: 0,
		mm: 0,
		hh: 0
	};
	
	this._fireEvent = function(event, data){
		$.Dom.fireEvent(window, 'clock-' + event, data);
	}
	
	this._idleDelay = 10;
	this._idle = function(){
		var self = this;
		if (this._status == 'white') {
			this._whiteClock -= this._idleDelay;
			if (this._whiteClock <= 0) {
				this._whiteClock = 0;
				this.stop();
			}
			else {
				$.Timeout.set('clock-idle', function(){self._idle();}, this._idleDelay);
			}
		}
		else if (this._status == 'black') {
			this._blackClock -= this._idleDelay;
			if (this._blackClock <= 0) {
				this._blackClock = 0;
				this.stop();
			}
			else {
				$.Timeout.set('clock-idle', function(){self._idle();}, this._idleDelay);
			}
		}
		this._fireEvent('idle');
	}
};

Clock.prototype.status = function(){
	return this._status;
};

Clock.prototype.set = function (hh, mm, ss) {
	typeof hh == 'undefined' ? hh = 0 : 0;
	typeof mm == 'undefined' ? mm = 1 : 0;
	typeof ss == 'undefined' ? ss = 0 : 0;
	
	this._startValue = {
		ss: ss,
		mm: mm,
		hh: hh
	};
	
	this._whiteClock = this._blackClock = (60 * mm + 3600 * hh) * 1000;
	
	this._fireEvent('set');
	return this;
};

Clock.prototype.reset = function() {
	this.set(this._startValue.hh, this._startValue.mm);
	return this;
};

Clock.prototype.get = function(){
	return {
		'white': this._whiteClock,
		'black': this._blackClock
	};
};

Clock.prototype.start = function() {
	if (this._status == null) {
		this._status = 'white';
		this._idle();
		this._fireEvent('start');
	}
	return this;
};

Clock.prototype.stop = function() {
	if (this._status != null) {
		this._status = null;
		this._fireEvent('stop');
	}
	return this;
};

Clock.prototype.toggle = function () {
	if (this._status == 'white') {
		this._status = 'black';
		this._fireEvent('toggle');
	}
	else if (this._status == 'black') {
		this._status = 'white';
		this._fireEvent('toggle');
	}
	else {
		this.start();
	}
	return this;
};
