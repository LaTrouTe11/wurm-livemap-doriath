'use strict';

WurmMapGen.gui = {
	app: null,
	init: function() {
		WurmMapGen.gui.app = new Vue({
			el: '#gui',
			data: { loaded: false, sidebarVisible: Cookies.get('sidebar_visible') !== 'false', showVillages: Cookies.get('show_villages') !== 'false', showVillageBorders: Cookies.get('show_village_borders') !== 'false', showTowers: Cookies.get('show_towers') !== 'false', showTowerBorders: Cookies.get('show_tower_borders') !== 'false', searchQuery: '' },
			computed: {
				searchResults: function() {
					var q = this.searchQuery.toLowerCase().trim(); if (q === '') return []; var res = [];
					if (WurmMapGen.villages) {
						for (var i = 0; i < WurmMapGen.villages.length; i++) {
							var v = WurmMapGen.villages[i]; if (v.name.toLowerCase().indexOf(q) !== -1) { res.push({ type: 'village', name: v.name, text: 'Mayor: ' + v.mayor, x: v.x, y: v.y }); }
						}
					}
					if (WurmMapGen.guardtowers) {
						for (var i = 0; i < WurmMapGen.guardtowers.length; i++) {
							var t = WurmMapGen.guardtowers[i]; if (t.creator.toLowerCase().indexOf(q) !== -1) { res.push({ type: 'guardtower', name: 'Guard Tower', text: 'Created by ' + t.creator, x: t.x, y: t.y }); }
						}
					}
					return res.slice(0, 5);
				}
			},
			watch: {
				sidebarVisible: function(v) { Cookies.set('sidebar_visible', v); },
				showVillages: function(v) { Cookies.set('show_villages', v); WurmMapGen.gui.updateLayers(); },
				showVillageBorders: function(v) { Cookies.set('show_village_borders', v); WurmMapGen.gui.updateLayers(); },
				showTowers: function(v) { Cookies.set('show_towers', v); WurmMapGen.gui.updateLayers(); },
				showTowerBorders: function(v) { Cookies.set('show_tower_borders', v); WurmMapGen.gui.updateLayers(); }
			},
			methods: { clickResult: function(r) { this.searchQuery = ''; WurmMapGen.map.map.setView(WurmMapGen.util.xy(r.x, r.y), WurmMapGen.config.mapMaxZoom); } },
			mounted: function() { this.loaded = true; WurmMapGen.gui.updateLayers(); WurmMapGen.gui.injectCustomDesign(); }
		});
	},
	updateLayers: function() {
		var app = WurmMapGen.gui.app, map = WurmMapGen.map.map, layers = WurmMapGen.map.layers; if (!app || !map || !layers) return;
		if (layers.villageMarkers) { if (app.showVillages) map.addLayer(layers.villageMarkers); else map.removeLayer(layers.villageMarkers); }
		if (layers.villageBorders) { if (app.showVillages && app.showVillageBorders) map.addLayer(layers.villageBorders); else map.removeLayer(layers.villageBorders); }
		if (layers.guardtowerMarkers) { if (app.showTowers) map.addLayer(layers.guardtowerMarkers); else map.removeLayer(layers.guardtowerMarkers); }
		if (layers.guardtowerBorders) { if (app.showTowers && app.showTowerBorders) map.addLayer(layers.guardtowerBorders); else map.removeLayer(layers.guardtowerBorders); }
	},
	injectCustomDesign: function() {
		var sb = document.getElementById('sidebar'), old = document.getElementById('playercount'); if (!sb) return;
		if (old) old.style.display = 'none';
		var pad = sb.querySelector('.block.padding');
		if (pad && !document.getElementById('injected-header')) {
			var h = document.createElement('div'); h.id = 'injected-header'; h.style.cssText = 'padding:12px;border-bottom:1px solid #444;text-align:center;background:#222;margin:-20px -15px 10px -15px;';
			h.innerHTML = '<a href="https://wurm-unlimited.com" target="_blank" rel="noreferrer noopener"><img src="images/half-banner-1.png" border="0" onerror="this.src=\'https://wurm-unlimited.combanners/half-banner-1.png\';" style="border-radius:4px;border:1px solid #ffcc00;width:100%;max-width:100%;height:auto;object-fit:contain;display:block;margin:0 auto;"></a>';
			pad.insertBefore(h, pad.firstChild);
		}
		if (!document.getElementById('injected-links')) {
			var blk = document.createElement('div'); blk.className = 'block'; blk.id = 'injected-links';
			blk.innerHTML = '<strong style="color:#ffcc00;font-size:12px;display:block;margin-bottom:4px;">🌐 Links (Liens) / Community :</strong>' +
				'<a href="https://wurm-unlimited.com" target="_blank" rel="noreferrer noopener" style="display:block!important;text-align:center!important;text-decoration:none!important;font-family:sans-serif!important;font-size:11px!important;font-weight:bold!important;padding:8px!important;margin:8px 0!important;border-radius:4px!important;text-shadow:1px 1px 1px #000!important;box-shadow:0 2px 4px rgba(0,0,0,0.4)!important;background:#ffcc00!important;color:#111!important;border:1px solid #cca300!important;">🔗 SERVER WEB PAGE (PAGE WEB)</a>' +
				'<a href="https://discord.gg" target="_blank" rel="noreferrer noopener" style="display:block!important;text-align:center!important;text-decoration:none!important;font-family:sans-serif!important;font-size:11px!important;font-weight:bold!important;padding:8px!important;margin:8px 0!important;border-radius:4px!important;text-shadow:1px 1px 1px #000!important;box-shadow:0 2px 4px rgba(0,0,0,0.4)!important;background:#5865F2!important;color:#fff!important;border:1px solid #4752c4!important;">💬 JOIN DISCORD (REJOINDRE)</a>';
			sb.insertBefore(blk, sb.children[1]);
		}
		var lbl = sb.getElementsByTagName('span');
		for (var i = 0; i < lbl.length; i++) {
			if (lbl[i].innerText === 'Show deeds') lbl[i].innerText = 'Show deeds (Afficher les colonies)';
			if (lbl[i].innerText === 'Show deed borders') lbl[i].innerText = 'Show deed borders (Frontières)';
			if (lbl[i].innerText === 'Show guard tower borders') lbl[i].innerText = 'Show tower borders (Rayons d\'action)';
		}
		var glbl = sb.getElementsByTagName('label');
		for (var j = 0; j < glbl.length; j++) {
			if (glbl[j].textContent.indexOf('Show guard towers') !== -1 && glbl[j].children.length === 1) {
				var s = document.createElement('span'); s.innerText = ' Show guard towers (Tours de garde)'; glbl[j].appendChild(s);
			}
		}
		var attr = sb.querySelector('.block.attribution');
		if (attr && !document.getElementById('injected-sync')) {
			var syn = document.createElement('div'); syn.id = 'injected-sync'; syn.style.cssText = 'background:rgba(0,0,0,0.4);border:1px solid #ffcc00;padding:6px;border-radius:4px;font-size:10px;color:#ffcc00;font-weight:bold;text-align:center;margin-top:10px;line-height:1.3;';
			syn.innerHTML = 'Last update / Dernière mise à jour :<br><span id="live-sync-date" style="color:#fff;font-size:11px;font-family:monospace;">2026-06-27 a 12:00:00</span>';
			attr.appendChild(syn);
		}
		var mapInstance = WurmMapGen.map.map;
		if (mapInstance) {
			mapInstance.on('popupopen', function(e) {
				var p = e.popup, html = p.getContent(); if (html && html.indexOf('txt-x') !== -1) return;
				if (html && (html.indexOf('Mayor:') !== -1 || html.indexOf('Citizens:') !== -1)) {
					p.options.maxWidth = 250; p.options.minWidth = 250; p.options.keepInView = true; p.options.autoPan = true; p.options.offset = L.point(0, -15);
					var lines = html.split('<br>'), vName = "Colonie", mName = "Inconnu", cCount = "1";
					for (var k = 0; k < lines.length; k++) {
						var txt = lines[k].replace(/<\/?[^>]+(>|$)/g, "").trim(); if (k === 0) vName = txt;
						if (txt.toLowerCase().indexOf('mayor:') !== -1) mName = txt.replace(/mayor\s*:\s*/i, "").trim();
						if (txt.toLowerCase().indexOf('citizens:') !== -1) cCount = txt.replace(/citizens\s*:\s*/i, "").trim();
					}
					var ll = p.getLatLng(), mult = WurmMapGen.config && WurmMapGen.config.xyMulitiplier ? WurmMapGen.config.xyMulitiplier : 8;
					var px = Math.floor(ll.lng * mult), py = Math.floor((-ll.lat) * mult);
					p.setContent([
						'<div align="center"><b>' + vName + '</b></div><hr style="border:0;border-top:1px solid #ffcc00;margin:6px 0;opacity:0.3;">',
						'<div style="font-size:11px;line-height:1.6;color:#fff;">👑 <b>Mayor (Maire) :</b> <span class="txt-m">' + mName + '</span><br>',
						'👥 <b>Citizens (Citoyens) :</b> <span class="txt-c">' + cCount + '</span><br>📅 <b>Founded (Créé) :</b> <span>2026</span><br>',
						'📍 <b>Coordinates (Position) :</b> <span class="txt-x">X' + px + '</span>, <span class="txt-y">Y' + py + '</span></div>'
					].join('')); p.update();
				}
			});
		}
	}
};
