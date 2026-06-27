'use strict';

(function() {
	function initHook() {
		if (window.WurmMapGen && WurmMapGen.map && WurmMapGen.map.map) {
			var map = WurmMapGen.map.map;

			setInterval(function() {
				var src = document.getElementById('playercount');
				var dst = document.getElementById('custom-playercount');
				if (src && dst) { dst.innerText = (parseInt(src.innerText) || 0) + ' players (joueurs) online'; }
			}, 1000);

			window.runDeedsFilter = function() {
				if (!WurmMapGen.map.layers.villageMarkers) return;
				var c1 = document.getElementById('opt-solo'), c2 = document.getElementById('opt-small'), c3 = document.getElementById('opt-large');
				WurmMapGen.map.layers.villageMarkers.eachLayer(function(m) {
					var d = document.createElement('div'); d.innerHTML = m.getPopup().getContent();
					var s = d.querySelector('.txt-c'), c = s ? parseInt(s.innerText) : 1, v = false;
					if (c === 1 && c1 && c1.checked) v = true;
					if (c >= 2 && c <= 5 && c2 && c2.checked) v = true;
					if (c >= 6 && c3 && c3.checked) v = true;
					if (v) { if (!map.hasLayer(m)) map.addLayer(m); } else { if (map.hasLayer(m)) map.removeLayer(m); }
				});
			};

			map.on('popupopen', function(e) {
				var p = e.popup, h = p.getContent(); if (h && h.indexOf('txt-x') !== -1) return;
				if (h && (h.indexOf('Mayor:') !== -1 || h.indexOf('Maire :') !== -1 || h.indexOf('Citizens:') !== -1)) {
					p.options.maxWidth = 250; p.options.minWidth = 250; p.options.keepInView = true; p.options.autoPan = true; p.options.offset = L.point(0, -15);
					var lines = h.split('<br>'), name = "Colonie", mayor = "Inconnu", cit = "1";
					for (var i = 0; i < lines.length; i++) {
						var n = lines[i].replace(/<\/?[^>]+(>|$)/g, "").trim(); if (i === 0) name = n;
						if (n.toLowerCase().indexOf('mayor:') !== -1) { mayor = n.replace(/mayor\s*:\s*mayor\s*:/i, "").replace(/mayor\s*:/i, "").trim(); }
						if (n.toLowerCase().indexOf('citizens:') !== -1) { cit = n.replace(/citizens\s*:\s*citizens\s*:/i, "").replace(/citizens\s*:/i, "").trim(); }
					}
					var ll = p.getLatLng(), mult = window.WurmMapGen && WurmMapGen.config && WurmMapGen.config.xyMulitiplier ? WurmMapGen.config.xyMulitiplier : 8;
					var px = Math.floor(ll.lng * mult), py = Math.floor((-ll.lat) * mult);
					p.setContent([
						'<div align="center"><b>' + name + '</b></div><hr style="border:0;border-top:1px solid #ffcc00;margin:6px 0;opacity:0.3;">',
						'<div style="font-size:11px;line-height:1.6;color:#fff;">👑 <b>Mayor (Maire) :</b> <span class="txt-m">' + mayor + '</span><br>',
						'👥 <b>Citizens (Citoyens) :</b> <span class="txt-c">' + cit + '</span><br>📅 <b>Founded (Créé) :</b> <span>2026</span><br>',
						'📍 <b>Coordinates (Position) :</b> <span class="txt-x">X' + px + '</span>, <span class="txt-y">Y' + py + '</span></div>'
					].join(''));
					p.update();
				}
			});
		} else { setTimeout(initHook, 100); }
	}
	initHook();
})();


