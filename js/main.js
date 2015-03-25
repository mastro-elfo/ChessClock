
var clock;

$.Dom.addEvent(window, 'load', function(){});

$.Dom.addEvent(window, 'load', function(){
	clock = new Clock();
	clock.set(0, 10);
	$.Dom.fireEvent(window, 'clock-idle');
});

(function(){
	var skip = false;
	var toString = function(value) {
		var ms, ss, mm, hh;
		
		ms = value % 1000;
		
		value = parseInt(value /1000);
		ss = value % 60;
		
		value = parseInt(value /60);
		mm = value % 60;
		
		hh = value = parseInt(value /60);
		
		if (hh == 0) {
			if (mm == 0) {
				if (ms < 10) {
					ms = '00' + ms ;
				}
				else if (ms < 100) {
					ms = '0' + ms;
				}
				return ss + '.'+ ms;
			}
			else {
				if (ss < 10){
					ss = '0' + ss;
				}
				return mm + ':' + ss;
			}
		}
		else {
			if (mm < 10) {
				mm = '0' + mm;
			}
			if (ss < 10) {
				ss = '0' + ss;
			}
			return hh +':'+ mm +':'+ ss;
		}
		
		// return hh +':'+ mm +':'+ ss +'.'+ ms;
	};
	$.Dom.addEvent(window, 'clock-idle', function(){
		if (!skip) {
			skip = true;
			var values = clock.get();
			values.white = toString(values.white);
			values.black = toString(values.black);
			var white = $.Dom.id('white-clock');
			var black = $.Dom.id('black-clock');
			white.innerHTML = values.white;
			black.innerHTML = values.black;
			skip = false;
		}
	});
})();

(function(){
	var toggle = function(){
		$.Dom.id('index-header-h1').setAttribute('data-header', clock.status() || 'stop');
	};
	$.Dom.addEvent(window, 'clock-toggle', toggle);
	$.Dom.addEvent(window, 'clock-start', toggle);
	$.Dom.addEvent(window, 'clock-stop', toggle);
	$.Dom.addEvent(window, 'clock-set', function(){
		$.Dom.id('index-header-h1').setAttribute('data-header', 'start');
	});
})();

$.Dom.addEvent(window, 'load', function(){
	$.Dom.addEvent(window, 'clock-set', function(){
		$.Dom.addClass('status', 'hidden');
	});
});

$.Dom.addEvent(window, 'load', function(){
	$.Dom.addEvent(window, 'clock-stop', function(){
		var values = clock.get();
		if (values.white == 0) {
			$.Dom.id('status-p').innerHTML = 'White time ended';
			$.Dom.removeClass('status', 'hidden');
		}
		else if (values.black == 0) {
			$.Dom.id('status-p').innerHTML = 'Black time ended';
			$.Dom.removeClass('status', 'hidden');
		}
	});
});

(function(){
	var toggle = function(){
		if (clock.status()) {
			clock.toggle();
		}
		else {
			var values = clock.get();
			if (values.white == 0 || values.black == 0) {
				clock.reset();
			}
			else {
				clock.start();
			}
		}
	};
	$.Dom.addEvent(window, 'load', function(){
		$.Dom.addEvent('clock-toggle', 'click', toggle);
		$.Dom.addEvent('clock-toggle', 'touchstart', toggle);
		$.Dom.addEvent('clock-toggle', 'keypress', toggle);
	});
})();

$.Dom.addEvent(window, 'load', function(){
	$.Dom.addEvent('settings-done', 'click', function(){
		clock.stop();
		var hh = $.Dom.id('settings-hours').value || 0;
		var mm = $.Dom.id('settings-minutes').value || 0;
		if (hh == 0 && mm == 0) {
			mm = 10;
		}
		clock.set(hh, mm);
		$.Dom.fireEvent(window, 'clock-idle');
		$.Dom.id('settings-hours').value = hh;
		$.Dom.id('settings-minutes').value = mm;
	});
});

$.Dom.addEvent(window, 'load', function(){
	$.Dom.addEvent(window, 'reload-sidebar', function(){
		var favouriteList = $.Dom.id('favourite-list');
		favouriteList.innerHTML = '';
		var favouriteTimes = $.Storage.get('favourite-times');
		$.Each(favouriteTimes, function(item, key, flags){
			var li = $.Dom.element('li', {
					'data-counter': item.counter
				}, '<a href="#">'+ item.name.replace('<hour>', 'hour').replace('<hours>', 'hours').replace('<minute>', 'minute').replace('<minutes>', 'minutes') +'</a>', {
					'click': function(event){
						clock.set(item.hh, item.mm, item.ss);
						$.Dom.fireEvent(window, 'clock-idle');
					}
				}
			);
			
			if(flags.first) {
				$.Dom.inject(li, favouriteList);
			}
			else {
				$.Each($.Dom.children(favouriteList, 'li'), function(thisLi, key, flags){
					var counter = parseInt(thisLi.getAttribute('data-counter'));
					if (item.counter > counter) {
						$.Dom.inject(li, thisLi, 'before');
						return false;
					}
					else if (flags.last) {
						$.Dom.inject(li, thisLi, 'after');
					}
					return true;
				});
			}
		});
	});
	$.Dom.fireEvent(window, 'reload-sidebar');
	
	$.Dom.addEvent('settings-reset-favourites', 'click', function(){
		if(confirm("Are you sure you want to reset your favourite times list?\nThis action will delete all the informations about your favourite times and can't be undone.\nProceed?")) {
			$.Storage.set('favourite-times', '');
			$.Dom.id('favourite-list').innerHTML = '';
		}
	});
	
	$.Dom.addEvent(window, 'clock-set', function(){
		var hh = clock._startValue.hh;
		var mm = clock._startValue.mm;
		var ss = clock._startValue.ss;
		
		var key = hh +':'+ mm +':'+ ss;
		var record = $.Storage.getns('favourite-times', key);
		if (record) {
			record.counter++;
		}
		else {
			var name = '';
			if (hh != 0) {
				if (hh == 1) {
					name = hh +' <hour>';
				}
				else {
					name = hh +' <hours>';
				}
				if (mm != 0) {
					name += ' and ';
				}
			}
			if (mm != 0) {
				if (mm == 1) {
					name += mm +' <minute>';
				}
				else {
					name += mm +' <minutes>';
				}
			}
			
			record = {
				name: name,
				counter: 1,
				hh: hh,
				mm: mm,
				ss: ss
			}
		}
		$.Storage.setns('favourite-times', key, record);
		$.Dom.fireEvent(window, 'reload-sidebar');
	});
});

$.Dom.addEvent(window, 'load', function(){
	$.Dom.addEvent(window, 'resize', function(){
		$.Dom.style('clocks', 'font-size', (Math.min(Math.max(window.innerWidth /220.8, 1), 10)) + 'rem'); // 220.8 = 13.8 * 16 = #clock total width [em] * html:font-size [px]
	});
	$.Dom.fireEvent(window, 'resize');
});

$.Dom.addEvent(window, 'load', function(){
	document.body.setAttribute('data-ready', true);
});

$.Dom.addEvent(window, 'load', function(){
	// Add 'goto' events
	$.Each(document.body.querySelectorAll('[data-goto]'), function(item){
		$.Dom.addClass(item, 'pointer');
		$.Dom.addEvent(item, 'click', function(event){
			Page.open(event.target.getAttribute('data-goto'));
		});
	});
	
	// Add 'goback' events
	$.Each(document.body.querySelectorAll('[data-goback]'), function(item){
		$.Dom.addClass(item, 'pointer');
		$.Dom.addEvent(item, 'click', function(event){
			Page.back();
		});
	});
});
