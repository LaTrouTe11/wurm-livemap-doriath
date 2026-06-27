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

		var colors = ['#00ccff', '#ff3333', '#cc33ff', '#33ff33', '#00ffff', '#ff9900'];

		// Add villages
		for (var i = 0; i < WurmMapGen.villages.length; i++) {
			var village = WurmMapGen.villages[i];
			var borderColor = colors[i % colors.length];

			var border = L.polygon([
				xy(village.borders, village.borders),
				xy(village.borders, village.borders),
				xy(village.borders, village.borders),
				xy(village.borders, village.borders)
			], {
				color: borderColor,
				fillColor: borderColor,
				fillOpacity: 0.08,
				weight: 2
			});

			var marker = L.marker(xy(village.x, village.y),
				{icon: WurmMapGen.markers.getMarker('village', village)}
			);

			// HABILLAGE INTERNE ET TRADUCTION SÉCURISÉE DES PARCHEMINS MÉDIÉVAUX
			marker.bindPopup(
				'<div style="padding: 2px;"><div align="center"><b style="color: #FFD700; font-size: 15px; text-shadow: 1px 2px 3px #000; font-family: Roboto, sans-serif; letter-spacing: 0.5px;">' + escapeHtml(village.name) + '</b><br>' +
				(village.motto ? '<i style="color: #bbb; font-size: 11px;">' + escapeHtml(village.motto) + '</i>' : '') + '</div>' +
				'<hr style="border:0; border-top:1px solid #ffcc00; margin:6px 0; opacity:0.3;"></hr>' +
				'<div style="font-size: 12px; line-height: 1.5; color: #fff;">' +
				'<b>Maire :</b> <span style="color: #00FF7F; font-weight: bold;">' + (village.mayor ? escapeHtml(village.mayor) : 'Inconnu') + '</span><br>' +
				'<b>Citoyens :</b> <span style="color: #00FFFF; font-weight: bold;">' + (village.citizens ? escapeHtml(village.citizens) : '1') + '</span><br>' +
				'<b>Créé le :</b> ' + (village.creation ? escapeHtml(village.creation) + ' 2026' : 'En 2026') + '<br>' +
				'<b>Position :</b> <span style="font-family: monospace; color: #ffcc00; font-weight: bold;">' + Math.floor(village.x) + ' x, ' + Math.floor(village.y) + ' y</span>' +
				'</div></div>',
				{
					keepInView: true,
					autoPan: true,
					offset: L.point(0, -25),
					autoPanPaddingTopLeft: L.point(50, 280),
					autoPanPaddingBottomRight: L.point(50, 50)
				}
			);

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
				xy(tower.borders, tower.borders),
				xy(tower.borders, tower.borders),
				xy(tower.borders, tower.borders),
				xy(tower.borders, tower.borders)
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
				xy(structure.borders, structure.borders),
				xy(structure.borders, structure.borders),
				xy(structure.borders, structure.borders),
				xy(structure.borders, structure.borders)
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
