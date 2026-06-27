'use strict';

WurmMapGen.map = {
    layers: {},
    playerMarkers: {},
    playerMarkerIds: [],

    /**
     * Initialisation et création de l'interface cartographique
     */
    create: function() {
        var config = WurmMapGen.config;
        var xy = WurmMapGen.util.xy;
        var escapeHtml = WurmMapGen.util.escapeHtml;

        // Configuration de la carte
        var map = WurmMapGen.map.map = L.map('map', {
            maxBounds: [xy(0,0), xy(config.actualMapSize, config.actualMapSize)],
            maxZoom: config.mapMaxZoom,
            minZoom: config.mapMinZoom,
            crs: L.CRS.Simple,
            zoomControl: false,
            attributionControl: false
        });

        new L.Control.Zoom({position: 'bottomright'}).addTo(map);

        var mapBounds = new L.LatLngBounds(
            map.unproject([0, config.maxMapSize], config.mapMaxZoom),
            map.unproject([config.maxMapSize, 0], config.mapMaxZoom)
        );

        map.fitBounds(mapBounds);

        // Couche de tuiles
        L.tileLayer('images/{x}-{y}.png', {
            tileSize: config.mapTileSize,
            maxNativeZoom: config.nativeZoom,
            minNativeZoom: config.nativeZoom,
            minZoom: config.mapMinZoom,
            maxZoom: config.mapMaxZoom,
            noWrap: true,
            errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
        }).addTo(map);

        // Groupes de calques
        var villageMarkers = WurmMapGen.map.layers.villageMarkers = L.layerGroup().addTo(map);
        var playerMarkers = WurmMapGen.map.layers.playerMarkers = L.layerGroup().addTo(map);

        // Ajout des villages
        if (WurmMapGen.villages) {
            for (var i = 0; i < WurmMapGen.villages.length; i++) {
                var village = WurmMapGen.villages[i];
                var marker = L.marker(xy(village.x, village.y), {
                    icon: WurmMapGen.markers.getMarker('village', village)
                });

                marker.bindPopup([
                    '<div><b>' + escapeHtml(village.name) + '</b></div>',
                    '👑 <b>Maire:</b> <span class="txt-m">' + escapeHtml(village.mayor) + '</span>',
                    '👥 <b>Citoyens:</b> <span class="txt-c">' + escapeHtml(village.citizens) + '</span>',
                    '📍 <b>Coord:</b> <span class="txt-x">X' + Math.floor(village.x) + '</span>, <span class="txt-y">Y' + Math.floor(village.y) + '</span>'
                ].join('<br>'));
                villageMarkers.addLayer(marker);
            }
        }
    },

    /**
     * Met à jour les marqueurs de joueurs
     */
    updatePlayerMarkers: function() {
        if (!WurmMapGen.players) return;

        var timestamp = Date.now();
        for(var i = 0; i < WurmMapGen.players.length; i++) {
            var player = WurmMapGen.players[i];
            var marker = WurmMapGen.map.playerMarkers[player.id];

            if (marker === undefined) {
                WurmMapGen.map.playerMarkers[player.id] = {
                    marker: L.marker(WurmMapGen.util.xy(player.x, player.y), {icon: WurmMapGen.markers.getMarker('player')}).addTo(WurmMapGen.map.layers.playerMarkers),
                    updated: timestamp
                };
                WurmMapGen.map.playerMarkerIds.push(player.id);
            } else {
                marker.marker.setLatLng(WurmMapGen.util.xy(player.x, player.y));
                marker.updated = timestamp;
            }
        }

        // Nettoyage des joueurs déconnectés
        var idsToRemove = [];
        for (var j = 0; j < WurmMapGen.map.playerMarkerIds.length; j++) {
            var pid = WurmMapGen.map.playerMarkerIds[j];
            if (WurmMapGen.map.playerMarkers[pid].updated !== timestamp) {
                WurmMapGen.map.layers.playerMarkers.removeLayer(WurmMapGen.map.playerMarkers[pid].marker);
                idsToRemove.push(pid);
            }
        }

        // Suppression sécurisée des IDs
        for (var k = 0; k < idsToRemove.length; k++) {
            var pidToRemove = idsToRemove[k];
            delete WurmMapGen.map.playerMarkers[pidToRemove];
            
            var index = WurmMapGen.map.playerMarkerIds.indexOf(pidToRemove);
            if (index > -1) {
                WurmMapGen.map.playerMarkerIds.splice(index, 1);
            }
        }
    }
};
