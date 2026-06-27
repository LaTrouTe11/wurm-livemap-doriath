'use strict';

WurmMapGen.gui = {

	app: null,

	/**
	 * Initialises the GUI
	 */
	init: function() {
		WurmMapGen.gui.app = new Vue({
			el: '#gui',
			// CORRECTION : Utilisation des délimiteurs standards {{ }}
			// Cela correspond à la syntaxe utilisée dans votre template index.html
			delimiters: ['{{', '}}'],
			data: {
				loaded: false,
				sidebarVisible: Cookies.get('sidebar_visible') !== 'false',
				showVillages: Cookies.get('show_villages') !== 'false',
				showVillageBorders: Cookies.get('show_village_borders') !== 'false',
				showTowers: Cookies.get('show_towers') !== 'false',
				showTowerBorders: Cookies.get('show_tower_borders') !== 'false',
				searchQuery: ''
			},
			computed: {
				searchResults: function() {
					var q = this.searchQuery.toLowerCase().trim();
					if (q === '') { return []; }

					var results = [];

					// Recherche dans les villages
					if (WurmMapGen.villages) {
						for (var i = 0; i < WurmMapGen.villages.length; i++) {
							var village = WurmMapGen.villages[i];
							if (village.name.toLowerCase().indexOf(q) !== -1) {
								results.push({
									type: 'village',
									name: village.name,
									text: 'Maire: ' + village.mayor,
									x: village.x,
									y: village.y
								});
							}
						}
					}

					// Recherche dans les tours de garde
					if (WurmMapGen.guardtowers) {
						for (var i = 0; i < WurmMapGen.guardtowers.length; i++) {
							var tower = WurmMapGen.guardtowers[i];
							if (tower.creator.toLowerCase().indexOf(q) !== -1) {
								results.push({
									type: 'guardtower',
									name: 'Tour de garde',
									text: 'Créée par ' + tower.creator,
									x: tower.x,
									y: tower.y
								});
							}
						}
					}

					return results.slice(0, 5);
				}
			},
			watch: {
				sidebarVisible: function(v) { Cookies.set('sidebar_visible', v); },
				showVillages: function(v) {
					Cookies.set('show_villages', v);
					WurmMapGen.gui.updateLayers();
				},
				showVillageBorders: function(v) {
					Cookies.set('show_village_borders', v);
					WurmMapGen.gui.updateLayers();
				},
				showTowers: function(v) {
					Cookies.set('show_towers', v);
					WurmMapGen.gui.updateLayers();
				},
				showTowerBorders: function(v) {
					Cookies.set('show_tower_borders', v);
					WurmMapGen.gui.updateLayers();
				}
			},
			methods: {
				clickResult: function(result) {
					this.searchQuery = '';
					WurmMapGen.map.map.setView(WurmMapGen.util.xy(result.x, result.y), WurmMapGen.config.mapMaxZoom);
				}
			},
			mounted: function() {
				this.loaded = true;
				WurmMapGen.gui.updateLayers();
			}
		});
	},

	/**
	 * Met à jour les couches de la carte
	 */
	updateLayers: function() {
		var app = WurmMapGen.gui.app;
		var map = WurmMapGen.map.map;
		var layers = WurmMapGen.map.layers;

		if (!app || !map || !layers) { return; }

		// Villages
		if (layers.villageMarkers) {
			if (app.showVillages) { map.addLayer(layers.villageMarkers); }
			else { map.removeLayer(layers.villageMarkers); }
		}

		if (layers.villageBorders) {
			if (app.showVillages && app.showVillageBorders) { map.addLayer(layers.villageBorders); }
			else { map.removeLayer(layers.villageBorders); }
		}

		// Tours de garde
		if (layers.guardtowerMarkers) {
			if (app.showTowers) { map.addLayer(layers.guardtowerMarkers); }
			else { map.removeLayer(layers.guardtowerMarkers); }
		}

		if (layers.guardtowerBorders) {
			if (app.showTowers && app.showTowerBorders) { map.addLayer(layers.guardtowerBorders); }
			else { map.removeLayer(layers.guardtowerBorders); }
		}
	}
};
