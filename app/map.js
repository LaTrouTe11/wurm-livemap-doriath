'use strict';

WurmMapGen.map = {

	layers: {},
	playerMarkers: {},
	playerMarkerIds: [],

	/**
	 * Initialises and creates the map interface
	 */
	create: function() {
		var config = WurmMapGen.config;
		var xy = WurmMapGen.util.xy;
		var escapeHtml = WurmMapGen.util.escapeHtml;

		// Set up the map
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

		var mapBounds = new L.LatLngBounds(
			map.unproject([0, config.maxMapSize], config.mapMaxZoom),
			map.unproject([config.maxMapSize, 0], config.mapMaxZoom));

		map.fitBounds(mapBounds);
        map.setZoom(Math.ceil((config.mapMinZoom + config.mapMaxZoom) / 2) - 1);

		var wurmMapLayer = L.tileLayer('tiles/{x}-{y}.png', {
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

		// Add coordinates display
		L.control.coordinates({
			position:"bottomleft",
			labelFormatterLng : function(e){
				if (e < 0) {
					e = ((180 + e) + 180);
				}
				return Math.floor(e * config.xyMulitiplier) + ' x,';
			},
			labelFormatterLat : function(e){
				return Math.floor((-e) * config.xyMulitiplier) + ' y';
			}
		}).addTo(map);

		// Create layer groups
		var villageBorders = WurmMapGen.map.layers.villageBorders = L.layerGroup();
		var villageMarkers = WurmMapGen.map.layers.villageMarkers = L.layerGroup();
		var guardtowerBorders = WurmMapGen.map.layers.guardtowerBorders = L.layerGroup();
		var guardtowerMarkers = WurmMapGen.map.layers.guardtowerMarkers = L.layerGroup();
		var structureBorders = WurmMapGen.map.layers.structureBorders = L.layerGroup();
		var portalMarkers = WurmMapGen.map.layers.portalMarkers = L.layerGroup();
		var playerMarkers = WurmMapGen.map.layers.playerMarkers = L.layerGroup();

		// PALETTE DE COULEURS ÉCLATANTES POUR LES FRONTIÈRES DES ROYAUMES
		var colors = ['#00ccff', '#ff3333', '#cc33ff', '#33ff33', '#00ffff', '#ff9900'];

		// Add villages
		for (var i = 0; i < WurmMapGen.villages.length; i++) {
			var village = WurmMapGen.villages[i];
			
			// Attribution d une couleur unique par village de facon automatique
			var borderColor = colors[i % colors.length];

			var border = L.polygon([
				xy(village.borders[0], village.borders[1]),
				xy(village.borders[0], village.borders[3]),
				xy(village.borders[2], village.borders[3]),
				xy(village.borders[2], village.borders[1])
			], {
				color: borderColor,
				fillColor: borderColor,
				fillOpacity: 0.08,
				weight: 2
			});

			var marker = L.marker(xy(village.x, village.y),
				{icon: WurmMapGen.markers.getMarker('village', village)}
			);

			marker.bindPopup([
				'<div align="center"><b>' + escapeHtml(village.name) + '</b>',
				'<i>' + escapeHtml(village.motto) + '</i></div>',
				'<b>Mayor:</b> ' + escapeHtml(village.mayor),
				'<b>Citizens:</b> ' + escapeHtml(village.citizens)
				].join('<br>'));

			if (WurmMapGen.config.markerType === 3) {
				marker.setZIndexOffset(1000);
			}

			border.on('click', WurmMapGen.map.openMarker.bind(null, marker));

			villageBorders.addLayer(border);
			villageMarkers.addLayer(marker);
		}

		// Add guard towers
		for (var i = 0; i < WurmMapGen.guardtowers.length; i++) {
			var tower = WurmMapGen.guardtowers[i];

			var border = L.polygon([
				xy(tower.borders[0], tower.borders[1]),
				xy(tower.borders[0], tower.borders[3]),
				xy(tower.borders[2], tower.borders[3]),
				xy(tower.borders[2], tower.borders[1])
			], {
				color: 'red',
				fillOpacity: 0.1,
				weight: 1
			});

			var marker = L.marker(xy(tower.x, tower.y),
				{icon: WurmMapGen.markers.getMarker('guardtower')}
			);

			marker.bindPopup([
				'<div align="center"><b>Guard Tower</b>',
				'<i>Created by ' + escapeHtml(tower.creator) + '</i></div>',
				'<b>QL:</b> ' + escapeHtml(tower.ql),
				'<b>DMG:</b> ' + escapeHtml(tower.dmg)
				].join('<br>'));

			border.on('click', WurmMapGen.map.openMarker.bind(null, marker));

			guardtowerBorders.addLayer(border);
			guardtowerMarkers.addLayer(marker);
		}

		// Add structures
		for (var i = 0; i < WurmMapGen.structures.length; i++) {
			var structure = WurmMapGen.structures[i];

			var border = L.polygon([
				xy(structure.borders[0], structure.borders[1]),
				xy(structure.borders[0], structure.borders[3]),
				xy(structure.borders[2], structure.borders[3]),
				xy(structure.borders[2], structure.borders[1])
			], {
				color: 'blue',
				fillOpacity: 0.1,
				weight: 1
			});

			border.bindPopup([
				'<div align="center"><b>' + escapeHtml(structure.name) + '</b>',
				'<i>Created by ' + escapeHtml(structure.creator) + '</i></div>'
				].join('<br>'));

			structureBorders.addLayer(border);
		}

		// Add portals
		for (var i = 0; i < WurmMapGen.portals.length; i++) {
			var portal = WurmMapGen.portals[i];

			var marker = L.marker(xy(portal.x, portal.y),
				{icon: WurmMapGen.markers.getMarker('portal')}
			);

			marker.bindPopup([
				'<div align="center"><b>' + escapeHtml(portal.name) + '</b>',
				'<i>Portal</i></div>'
				].join('<br>'));

			portalMarkers.addLayer(marker);
		}

		WurmMapGen.map.updatePlayerMarkers();

		villageBorders.addTo(map);
		villageMarkers.addTo(map);
		guardtowerBorders.addTo(map);
		guardtowerMarkers.addTo(map);
		structureBorders.addTo(map);
		portalMarkers.addTo(map);
		playerMarkers.addTo(map);
	},

	updatePlayerMarkers: function() {
		if (!WurmMapGen.players) { return; }
		var timestamp = Date.now();
		for(var i = 0; i < WurmMapGen.players.length; i++) {
			var player = WurmMapGen.players[i];
			var marker = WurmMapGen.map.playerMarkers[player.id];
			if (marker === undefined) {
				WurmMapGen.map.playerMarkers[player.id] = marker = {};
				marker.marker = L.marker(WurmMapGen.util.xy(player.x, player.y), {icon: WurmMapGen.markers.getMarker('player')});
				marker.marker.bindPopup('<div align="center"><b>' + WurmMapGen.util.escapeHtml(player.name) + '</b></div>');
				WurmMapGen.map.playerMarkerIds.push(player.id);
				WurmMapGen.map.layers.playerMarkers.addLayer(marker.marker);
			} else {
				marker.marker.setLatLng(WurmMapGen.util.xy(player.x, player.y));
			}
			marker.updated = timestamp;
		}
		var idsToRemove = [];
		for (var i = 0; i < WurmMapGen.map.playerMarkerIds.length; i++) {
			var playerId = WurmMapGen.map.playerMarkerIds[i];
			var marker = WurmMapGen.map.playerMarkers[playerId];
			if (marker.updated !== timestamp) {
				WurmMapGen.map.layers.playerMarkers.removeLayer(marker.marker);
				idsToRemove.push(playerId);
			}
		}
		for (var i = 0; i < idsToRemove.length; i++) {
			var playerId = idsToRemove[i];
			delete WurmMapGen.map.playerMarkers[playerId];
			WurmMapGen.map.playerMarkerIds.splice(WurmMapGen.map.playerMarkerIds.indexOf(playerId), 1);
		}
	},

	openMarker: function(marker) {
		marker.openPopup();
	}
};

