'use strict';

(function() {

	WurmMapGen.config = null;
	WurmMapGen.villages = null;
	WurmMapGen.guardtowers = null;
	WurmMapGen.structures = null;
	WurmMapGen.portals = null;
	WurmMapGen.players = null;

	var modulesLoaded = 0;

	function loadData(file, callback) {
		fetch('data/' + file + '.json?v=' + Date.now())
			.then(function(response) {
				if (!response.ok) {
					callback(null);
					return;
				}
				return response.json();
			})
			.then(function(data) {
				callback(data);
			})
			.catch(function() {
				callback(null);
			});
	}

	function checkProgress() {
		modulesLoaded++;
		if (modulesLoaded === 6) {
			WurmMapGen.gui.init();
			WurmMapGen.map.create();
			WurmMapGen.gui.loaded();
		}
	}

	loadData('config', function(data) { WurmMapGen.config = data ? data.config : {}; checkProgress(); });
	loadData('villages', function(data) { WurmMapGen.villages = data ? data.villages : []; checkProgress(); });
	loadData('guardtowers', function(data) { WurmMapGen.guardtowers = data ? data.guardtowers : []; checkProgress(); });
	loadData('structures', function(data) { WurmMapGen.structures = data ? data.structures : []; checkProgress(); });
	loadData('portals', function(data) { WurmMapGen.portals = data ? data.portals : []; checkProgress(); });
	loadData('players', function(data) { WurmMapGen.players = data ? data.players : []; checkProgress(); });

})();

