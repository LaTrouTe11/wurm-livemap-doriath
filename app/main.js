
// Prepare promises to load data
var promises = [
	fetchData('config', 'config.json'),
	fetchData('villages', 'villages.json'),
	fetchData('guardtowers', 'guardtowers.json'),
	fetchData('structures', 'structures.json'),
	fetchData('portals', 'portals.json')
];

if (document.body.getAttribute('data-realtime') === 'true') {
	promises.push(fetchData('players', 'players.php'));
}

// Start loading
Promise.all(promises)
.catch(function(err) {
	console.error('Could not load data');
	console.error(err);
	document.write('Something went wrong, map data could not be loaded'); // TODO add better error handling
})
.then(function() {
	// Add computed config values
	WurmMapGen.config.xyMulitiplier = (WurmMapGen.config.actualMapSize / WurmMapGen.config.mapTileSize);

	// Create the map
	WurmMapGen.map.create();

	// Initialise the GUI
	WurmMapGen.gui.init();

	// Set interval to refresh realtime data
	if (document.body.getAttribute('data-realtime') === 'true') {
		setRealtimeTimer();
	}
});

// End IIFE
})();
