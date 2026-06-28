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
			map.unproject([0, config.actualMapSize], config.mapMaxZoom),
			map.unproject([config.actualMapSize, 0], config.mapMaxZoom));

		map.fitBounds(mapBounds);
		map.setZoom(Math.ceil((config.mapMinZoom + config.mapMaxZoom) / 2) - 1);

		var wurmMapLayer = L.tileLayer('images/{x}-{y}.png', {
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

		// Add villages
		for (var i = 0; i < WurmMapGen.villages.length; i++) {
			var village = WurmMapGen.villages[i];

			var border = L.polygon([
				xy(village.borders[0], village.borders[1]),
				xy(village.borders[2], village.borders[1]),
				xy(village.borders[2], village.borders[3]),
				xy(village.borders[0], village.borders[3])
			], {
				color: (village.permanent ? 'orange' : 'white'),
				fillOpacity: 0,
				weight: 1
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
				xy(tower.borders[2], tower.borders[1]),
				xy(tower.borders[2], tower.borders[3]),
				xy(tower.borders[0], tower.borders[3])
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
				xy(structure.borders[2], structure.borders[1]),
				xy(structure.borders[2], structure.borders[3]),
				xy(structure.borders[0], structure.borders[3])
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

		// Encadré de la dernière mise à jour basé sur timestamp.json
		if (WurmMapGen.timestamp && WurmMapGen.timestamp.timestamp) {
			var updateControl = L.Control.extend({
				options: { position: 'bottomleft' },
				onAdd: function() {
					var container = L.DomUtil.create('div', 'wurm-timestamp-control');
					var date = new Date(WurmMapGen.timestamp.timestamp * 1000);
					var jour = String(date.getDate()).padStart(2, '0');
					var mois = String(date.getMonth() + 1).padStart(2, '0');
					var annee = date.getFullYear();
					var heures = String(date.getHours()).padStart(2, '0');
					var minutes = String(date.getMinutes()).padStart(2, '0');
					
					container.innerHTML = '<b>Mise à jour :</b> ' + jour + '/' + mois + '/' + annee + ' à ' + heures + ':' + minutes;
					return container;
				}
			});
			map.addControl(new updateControl());
		}

		// Add players
		WurmMapGen.map.updatePlayerMarkers();

		// Add layers to map
		villageBorders.addTo(map);
		villageMarkers.addTo(map);
		guardtowerBorders.addTo(map);
		guardtowerMarkers.addTo(map);
		structureBorders.addTo(map);
		portalMarkers.addTo(map);
		playerMarkers.addTo(map);
	},

	/**
	 * Updates the player markers on the map with newly loaded data.
	 */
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
