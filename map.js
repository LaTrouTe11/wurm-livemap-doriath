'use strict';

WurmMapGen.map = {
	layers: {},
	playerMarkers: {},
	playerMarkerIds: [],

	create: function() {
		var config = WurmMapGen.config;
		var xy = WurmMapGen.util.xy;
		var escapeHtml = WurmMapGen.util.escapeHtml;

		// Initialisation de la carte Leaflet
		var map = WurmMapGen.map.map = L.map('map', {
			maxBounds: [xy(0,0), xy(config.actualMapSize,config.actualMapSize)],
			maxBoundsViscosity: 1.0,
			maxZoom: config.mapMaxZoom,
			minZoom: config.mapMinZoom,
			crs: L.CRS.Simple,
			zoomControl: false,
			attributionControl: false
		});

		new L.Control.Zoom({position: 'bottomright'}).addTo(map);

		// Calcul des dimensions de la grille
		var mapBounds = new L.LatLngBounds(
			map.unproject([0, config.actualMapSize], config.mapMaxZoom),
			map.unproject([config.actualMapSize, 0], config.mapMaxZoom));

		map.fitBounds(mapBounds);
		map.setZoom(Math.ceil((config.mapMinZoom + config.mapMaxZoom) / 2) - 1);

		// Affichage dynamique de TOUTES les tuiles d'images (Images quadrillées)
		L.tileLayer('images/{x}-{y}.png', {
			tileSize: config.mapTileSize,
			maxNativeZoom: config.nativeZoom,
			minNativeZoom: config.nativeZoom,
			minZoom: config.mapMinZoom,
			maxZoom: config.mapMaxZoom,
			maxBounds: mapBounds,
			maxBoundsViscosity: 1.0,
			inertia: false,
			noWrap: true,
			tms: false
		}).addTo(map);

		// Création des conteneurs de marqueurs
		var villageBorders = WurmMapGen.map.layers.villageBorders = L.layerGroup().addTo(map);
		var villageMarkers = WurmMapGen.map.layers.villageMarkers = L.layerGroup().addTo(map);
		var guardtowerBorders = WurmMapGen.map.layers.guardtowerBorders = L.layerGroup().addTo(map);
		var guardtowerMarkers = WurmMapGen.map.layers.guardtowerMarkers = L.layerGroup().addTo(map);
		var structureBorders = WurmMapGen.map.layers.structureBorders = L.layerGroup().addTo(map);
		var portalMarkers = WurmMapGen.map.layers.portalMarkers = L.layerGroup().addTo(map);
		var playerMarkers = WurmMapGen.map.layers.playerMarkers = L.layerGroup().addTo(map);

		// Ajout des calques de villages
		if (WurmMapGen.villages) {
			for (var i = 0; i < WurmMapGen.villages.length; i++) {
				var village = WurmMapGen.villages[i];
				var marker = L.marker(xy(village.x, village.y), {icon: WurmMapGen.markers.getMarker('village', village)});
				marker.bindPopup('<b>' + escapeHtml(village.name) + '</b><br>Maire: ' + escapeHtml(village.mayor));
				villageMarkers.addLayer(marker);
			}
		}

		// Ajout des calques de tours de garde
		if (WurmMapGen.guardtowers) {
			for (var i = 0; i < WurmMapGen.guardtowers.length; i++) {
				var tower = WurmMapGen.guardtowers[i];
				var marker = L.marker(xy(tower.x, tower.y), {icon: WurmMapGen.markers.getMarker('guardtower')});
				marker.bindPopup('<b>Tour de Garde</b><br>Créée par: ' + escapeHtml(tower.creator));
				guardtowerMarkers.addLayer(marker);
			}
		}
	},

	updatePlayerMarkers: function() {
		// Module de rafraîchissement
	},

	openMarker: function(marker) {
		marker.openPopup();
	}
};
