const bboxes = {
	'crabx': G.maps['main'].monsters.find(s => s.type == 'crabx'),
	'crab': G.maps['main'].monsters.find(s => s.type == 'crab'),
	'boar': G.maps['winterland'].monsters.find(s => s.type == 'boar'),
}
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

const afk_spots = {
	arcticbee: {
		willBow: { map: 'winterland', x: 1032, y: -873 },
		willStaff: { map: 'winterland', x: 1132, y: -873 },
		willPray: { map: 'winterland', x: 1082, y: -873 },
		priority: ['grinch', 'snowman', 'phoenix', 'cutebee', 'arcticbee']
	},
	rat: {
		willBow: { map: 'mansion', x: 0, y: -125 },
		willStaff: { map: 'mansion', x: 0, y: -275 },
		willPray: { map: 'mansion', x: 0, y: -200 },
		priority: ['grinch', 'snowman', 'phoenix', 'cutebee', 'rat']
	},
	minimush: {
		willBow: { map: 'halloween', x: 75, y: 650 },
		willStaff: { map: 'halloween', x: -75, y: 650 },
		willPray: { map: 'halloween', x: 0, y: 650 },
		priority: ['grinch', 'snowman', 'phoenix', 'cutebee', 'minimush']
	},
	osnake: {
		willBow: { map: 'halloween', x: -500, y: -550 },
		willStaff: { map: 'halloween', x: -500, y: -400 },
		willPray: { map: 'halloween', x: -500, y: -475 },
		priority: ['grinch', 'snowman', 'phoenix', 'cutebee', 'osnake', 'snake']
	},
	croc: {
		willBow: { map: 'main', x: 700, y: 1750 },
		willStaff: { map: 'main', x: 700, y: 1800 },
		willPray: { map: 'main', x: 675, y: 1775 },
		priority: ['grinch', 'snowman', 'phoenix', 'cutebee', 'croc', 'armadillo']
	},
	armadillo: {
		willBow: { map: 'main', x: 494, y: 1820 },
		willStaff: { map: 'main', x: 580, y: 1820 },
		willPray: { map: 'main', x: 537, y: 1790 },
		priority: ['grinch', 'snowman', 'phoenix', 'cutebee', 'armadillo', 'croc']
	},
	porcupine: {
		willBow: { map: 'desertland', x: -975, y: 290 },
		willStaff: { map: 'desertland', x: -950, y: 290 },
		willPray: { map: 'desertland', x: -925, y: 290 },
		priority: ['grinch', 'snowman', 'phoenix', 'cutebee', 'porcupine']
	},
	bigbird: {
		willBow: { map: 'main', x: 1200, y: 400 },
		willPray: { map: 'main', x: 1250, y: 400 },
		willStaff: { map: 'main', x: 1300, y: 400 },
		priority: ['grinch', 'snowman', 'phoenix', 'cutebee', 'bigbird']
	},
	stoneworm: {
		willBow: { map: 'spookytown', x: 600, y: 90 },
		willStaff: { map: 'spookytown', x: 600, y: 170 },
		willPray: { map: 'spookytown', x: 600, y: 130 },
		priority: ['grinch', 'snowman', 'phoenix', 'cutebee', 'stoneworm']
	},
	bee: {
		willBow: { map: 'main', x: 230, y: 1475 },
		willStaff: { map: 'main', x: 90, y: 1475 },
		willPray: { map: 'main', x: 160, y: 1475 },
		priority: ['grinch', 'snowman', 'phoenix', 'cutebee', 'bee']
	},
	cgoo: {
		willBow: { map: 'arena', x: 635, y: -280 },
		willStaff: { map: 'arena', x: 590, y: -275 },
		willPray: { map: 'arena', x: 550, y: -250 },
		priority: ['grinch', 'snowman', 'phoenix', 'cutebee', 'cgoo']
	},
	snake: {
		willBow: { map: 'main', x: -75, y: 1800 },
		willStaff: { map: 'main', x: -155, y: 1800 },
		willPray: { map: 'main', x: -115, y: 1800 },
		priority: ['grinch', 'snowman', 'phoenix', 'cutebee', 'snake']
	},
	bat: {
		willBow: { map: 'cave', x: -71, y: -300 },
		willStaff: { map: 'cave', x: -24, y: -300 },
		willPray: { map: 'cave', x: 23, y: -300 },
		priority: ['grinch', 'snowman', 'phoenix', 'cutebee', 'bat']
	},
	squig: {
		willBow: { map: 'main', x: -1200, y: 300 },
		willPray: { map: 'main', x: -1100, y: 400 },
		willStaff: { map: 'main', x: -1000, y: 500 },
		priority: ['grinch', 'phoenix', 'cutebee', 'squig', 'squigtoad', 'crab']
	},
	dragold: {
		willBow: { map: 'cave', x: 1200, y: -800 },
		willPray: { map: 'cave', x: 1190, y: -790 },
		willStaff: { map: 'cave', x: 1200, y: -780 },
		priority: ['grinch', 'dragold']
	},
	crabx: {
		willBow: { map: 'main', x: get_center(bboxes['crabx']).x + 50, y: get_center(bboxes['crabx']).y + 25 * Math.cos(Math.PI / 4) },
		willPray: { map: 'main', x: get_center(bboxes['crabx']).x, y: get_center(bboxes['crabx']).y - 25 * Math.cos(Math.PI / 4) },
		willStaff: { map: 'main', x: get_center(bboxes['crabx']).x - 50, y: get_center(bboxes['crabx']).y + 25 * Math.cos(Math.PI / 4) },
		priority: ['grinch', 'cutebee', 'phoenix', 'crabx', 'crabxx']
	},
	crab: {
		willBow: { map: 'main', x: get_center(bboxes['crab']).x + 50, y: get_center(bboxes['crab']).y + 25 * Math.cos(Math.PI / 4) },
		willPray: { map: 'main', x: get_center(bboxes['crab']).x, y: get_center(bboxes['crab']).y - 25 * Math.cos(Math.PI / 4) },
		willStaff: { map: 'main', x: get_center(bboxes['crab']).x - 50, y: get_center(bboxes['crab']).y + 25 * Math.cos(Math.PI / 4) },
		priority: ['grinch', 'cutebee', 'phoenix', 'crab']
	},
	boar: {
		willBow: { map: 'winterland', x: -200, y: -1150 },
		willPray: { map: 'winterland', x: -200, y: -1100 },
		willStaff: { map: 'winterland', x: -200, y: -1050 },
		priority: ['grinch', 'snowman', 'phoenix', 'cutebee', 'boar']
	},
}

var module = {
	exports: {
		afk_spots,
		merchant_name: 'willMerch',
		keep_in_inventory: ['mpot0', 'mpot1', 'hpot0', 'hpot1', 'elixirluck', 'tracker', 'cake', 'elixirvit0', 'cdragon',],
		gold_to_keep: 100000,
		upgrade_whitelist: ['wcap', 'wbreeches', 'wgloves', 'wattire', 'wshoes', 'sshield', 'coat1', 'shoes1', 'gloves1', 'pants1', 'helmet1', 'firestaff', 'fireblade', 'quiver', 'blade', 'basher', 'firestars', 'mcape', 'vgloves', 'fierygloves'],
		combine_whitelist: ['strearring', 'dexearring', 'intearring', 'dexamulet', 'stramulet', 'intamulet', 'hpbelt', 'vitring', 'wbook0', 'vitearring', 'strring', 'intring', 'dexring'],
		exchange_whitelist: ['gem0', 'gem1', 'gemfragment', 'armorbox', 'weaponbox', 'greenenvelope', 'candy0', 'candy1', 'goldenegg'],
		sell_whitelist: ['stinger', 'mushroomstaff', 'wbasher', 'ringsj', 'cclaw', 'hpamulet'],
		upgrade_loc: { x: -180, y: -185, map: 'main', map_obj: G.maps['main'] },
		compound_loc: { x: -235, y: -185, map: 'main', map_obj: G.maps['main'] },
		exchange_loc: { x: -20, y: -478, map: 'main', map_obj: G.maps['main'] },
		GLOBAL_PRIORITY: ['grinch', 'phoenix', 'cutebee'],
		monster_lookup,
	},
}