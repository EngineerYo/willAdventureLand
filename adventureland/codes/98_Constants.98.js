const get_center = (bbox) => {
	return { x: 0.5 * (bbox.boundary[0] + bbox.boundary[2]), y: 0.5 * (bbox.boundary[1] + bbox.boundary[3]) }
}

var monster_lookup = () => {
	let inaccessible = ['old_main']
	var monsters = {}
	Object.entries(G.maps).forEach(([map_key, map_obj]) => {
		map_obj.monsters?.forEach((m_val, m_key) => {
			m_val['map'] = map_key
			m_val['score'] = m_val.count

			if (inaccessible.includes(map_key)) m_val['score'] -= 1000
			if (map_key == 'arena') m_val['score'] -= 100
			if (map_key == 'main') m_val['score'] -= 3

			if (map_key['grow']) m_val['score'] += 3


			if (!monsters[m_val.type]) monsters[m_val.type] = []
			monsters[m_val.type].push(m_val)
		})
	})

	return monsters
}

var module = {
	exports: {
		merchant_name: 'willMerch',
		keep_in_inventory: ['mpot0', 'mpot1', 'hpot0', 'hpot1', 'elixirluck', 'tracker', 'cake', 'elixirvit0', 'cdragon',],
		gold_to_keep: 100000,
		upgrade_whitelist: ['wcap', 'wbreeches', 'wgloves', 'wattire', 'wshoes', 'sshield', 'coat1', 'shoes1', 'gloves1', 'pants1', 'helmet1', 'firestaff', 'fireblade', 'quiver', 'blade', 'basher', 'firestars', 'mcape', 'vgloves', 'fierygloves'],
		combine_whitelist: ['strearring', 'dexearring', 'intearring', 'dexamulet', 'stramulet', 'intamulet', 'hpbelt', 'vitring', 'wbook0', 'vitearring', 'strring', 'intring', 'dexring'],
		exchange_whitelist: ['gem0', 'gem1', 'gemfragment', 'armorbox', 'weaponbox', 'greenenvelope', 'candy0', 'candy1', 'goldenegg'],
		sell_whitelist: ['stinger', 'mushroomstaff', 'wbasher', 'ringsj', 'cclaw', 'hpamulet', 'slimestaff'],
		upgrade_loc: { x: -180, y: -185, map: 'main', map_obj: G.maps['main'] },
		compound_loc: { x: -235, y: -185, map: 'main', map_obj: G.maps['main'] },
		exchange_loc: { x: -20, y: -478, map: 'main', map_obj: G.maps['main'] },
		GLOBAL_PRIORITY: ['grinch', 'phoenix', 'cutebee'],
		monster_lookup,
		get_center,
	},
}