const bboxes = {
	'crabx': G.maps['main'].monsters.find(s => s.type == 'crabx'),
	'crab': G.maps['main'].monsters.find(s => s.type == 'crab'),
	'boar': G.maps['winterland'].monsters.find(s => s.type == 'boar'),
}
const get_center = (bbox) => {
	return { x: 0.5 * (bbox.boundary[0] + bbox.boundary[2]), y: 0.5 * (bbox.boundary[1] + bbox.boundary[3]) }
}

var monster_lookup = () => {
	var monsters = {}
	Object.entries(G.maps).forEach(([map_key, map_obj]) => {
		log(map_key)
		map_obj.monsters?.forEach((m_val, m_key) => {
			m_val['map'] = map_key
			m_val['dnu'] = false

			if (!monsters[m_val.type]) monsters[m_val.type] = []
			monsters[m_val.type].push(m_val)
		})
	})

	return monsters
}

const afk_spots = {
	arcticbee: {
		Tiberian: { map: 'winterland', x: 1032, y: -873 },
		Llywelyn: { map: 'winterland', x: 1132, y: -873 },
		Godrick: { map: 'winterland', x: 1082, y: -873 },
		priority: ['grinch', 'snowman', 'phoenix', 'cutebee', 'arcticbee']
	},
	rat: {
		Tiberian: { map: 'mansion', x: 0, y: -125 },
		Llywelyn: { map: 'mansion', x: 0, y: -275 },
		Godrick: { map: 'mansion', x: 0, y: -200 },
		priority: ['grinch', 'snowman', 'phoenix', 'cutebee', 'rat']
	},
	minimush: {
		Tiberian: { map: 'halloween', x: 75, y: 650 },
		Llywelyn: { map: 'halloween', x: -75, y: 650 },
		Godrick: { map: 'halloween', x: 0, y: 650 },
		priority: ['grinch', 'snowman', 'phoenix', 'cutebee', 'minimush']
	},
	osnake: {
		Tiberian: { map: 'halloween', x: -500, y: -550 },
		Llywelyn: { map: 'halloween', x: -500, y: -400 },
		Godrick: { map: 'halloween', x: -500, y: -475 },
		priority: ['grinch', 'snowman', 'phoenix', 'cutebee', 'osnake', 'snake']
	},
	croc: {
		Tiberian: { map: 'main', x: 700, y: 1750 },
		Llywelyn: { map: 'main', x: 700, y: 1800 },
		Godrick: { map: 'main', x: 675, y: 1775 },
		priority: ['grinch', 'snowman', 'phoenix', 'cutebee', 'croc', 'armadillo']
	},
	armadillo: {
		Tiberian: { map: 'main', x: 494, y: 1820 },
		Llywelyn: { map: 'main', x: 580, y: 1820 },
		Godrick: { map: 'main', x: 537, y: 1790 },
		priority: ['grinch', 'snowman', 'phoenix', 'cutebee', 'armadillo', 'croc']
	},
	porcupine: {
		Tiberian: { map: 'desertland', x: -975, y: 290 },
		Llywelyn: { map: 'desertland', x: -950, y: 290 },
		Godrick: { map: 'desertland', x: -925, y: 290 },
		priority: ['grinch', 'snowman', 'phoenix', 'cutebee', 'porcupine']
	},
	bigbird: {
		Tiberian: { map: 'main', x: 1200, y: 400 },
		Llywelyn: { map: 'main', x: 1250, y: 400 },
		Godrick: { map: 'main', x: 1300, y: 400 },
		priority: ['grinch', 'snowman', 'phoenix', 'cutebee', 'bigbird']
	},
	stoneworm: {
		Tiberian: { map: 'spookytown', x: 600, y: 90 },
		Llywelyn: { map: 'spookytown', x: 600, y: 170 },
		Godrick: { map: 'spookytown', x: 600, y: 130 },
		priority: ['grinch', 'snowman', 'phoenix', 'cutebee', 'stoneworm']
	},
	bee: {
		Tiberian: { map: 'main', x: 230, y: 1475 },
		Llywelyn: { map: 'main', x: 90, y: 1475 },
		Godrick: { map: 'main', x: 160, y: 1475 },
		priority: ['grinch', 'snowman', 'phoenix', 'cutebee', 'bee']
	},
	cgoo: {
		Tiberian: { map: 'arena', x: 635, y: -280 },
		Llywelyn: { map: 'arena', x: 590, y: -275 },
		Godrick: { map: 'arena', x: 550, y: -250 },
		priority: ['grinch', 'snowman', 'phoenix', 'cutebee', 'cgoo']
	},
	snake: {
		Tiberian: { map: 'main', x: -75, y: 1800 },
		Llywelyn: { map: 'main', x: -155, y: 1800 },
		Godrick: { map: 'main', x: -115, y: 1800 },
		priority: ['grinch', 'snowman', 'phoenix', 'cutebee', 'snake']
	},
	bat: {
		Tiberian: { map: 'cave', x: -71, y: -300 },
		Llywelyn: { map: 'cave', x: -24, y: -300 },
		Godrick: { map: 'cave', x: 23, y: -300 },
		priority: ['grinch', 'snowman', 'phoenix', 'cutebee', 'bat']
	},
	squig: {
		Tiberian: { map: 'main', x: -1200, y: 300 },
		Godrick: { map: 'main', x: -1100, y: 400 },
		Llywelyn: { map: 'main', x: -1000, y: 500 },
		priority: ['grinch', 'phoenix', 'cutebee', 'squig', 'squigtoad', 'crab']
	},
	dragold: {
		Tiberian: { map: 'cave', x: 1200, y: -800 },
		Godrick: { map: 'cave', x: 1190, y: -790 },
		Llywelyn: { map: 'cave', x: 1200, y: -780 },
		priority: ['grinch', 'dragold']
	},
	crabx: {
		Tiberian: { map: 'main', x: get_center(bboxes['crabx']).x + 50, y: get_center(bboxes['crabx']).y + 25 * Math.cos(Math.PI / 4) },
		Godrick: { map: 'main', x: get_center(bboxes['crabx']).x, y: get_center(bboxes['crabx']).y - 25 * Math.cos(Math.PI / 4) },
		Llywelyn: { map: 'main', x: get_center(bboxes['crabx']).x - 50, y: get_center(bboxes['crabx']).y + 25 * Math.cos(Math.PI / 4) },
		priority: ['grinch', 'cutebee', 'phoenix', 'crabx', 'crabxx']
	},
	crab: {
		Tiberian: { map: 'main', x: get_center(bboxes['crab']).x + 50, y: get_center(bboxes['crab']).y + 25 * Math.cos(Math.PI / 4) },
		Godrick: { map: 'main', x: get_center(bboxes['crab']).x, y: get_center(bboxes['crab']).y - 25 * Math.cos(Math.PI / 4) },
		Llywelyn: { map: 'main', x: get_center(bboxes['crab']).x - 50, y: get_center(bboxes['crab']).y + 25 * Math.cos(Math.PI / 4) },
		priority: ['grinch', 'cutebee', 'phoenix', 'crab']
	},
	boar: {
		Tiberian: { map: 'winterland', x: -200, y: -1150 },
		Godrick: { map: 'winterland', x: -200, y: -1100 },
		Llywelyn: { map: 'winterland', x: -200, y: -1050 },
		priority: ['grinch', 'snowman', 'phoenix', 'cutebee', 'boar']
	},
}

var module = {
	exports: {
		afk_spots,
		merchant_name: 'Taliyah',
		keep_in_inventory: ['mpot0', 'mpot1', 'hpot0', 'hpot1', 'elixirluck', 'tracker', 'cake', 'elixirvit0', 'cdragon',],
		gold_to_keep: 100000,
		upgrade_whitelist: ['helmet', 'wcap', 'pants', 'wbreeches', 'gloves', 'wgloves', 'coat', 'wattire', 'shoes', 'wshoes', 'sshield', 'coat1', 'shoes1', 'gloves1', 'pants1', 'helmet1', 'firestaff', 'firesword', 'quiver', 'blade'],
		combine_whitelist: ['strearring', 'dexearring', 'intearring', 'dexamulet', 'stramulet', 'intamulet', 'hpbelt', 'vitring', 'hpamulet', 'wbook0', 'vitearring', 'strring', 'intring', 'dexring'],
		exchange_whitelist: ['gem0', 'gem1', 'gemfragment', 'armorbox', 'weaponbox', 'greenenvelope'],
		sell_whitelist: ['stinger', 'mushroomstaff', 'wbasher', 'ringsj', 'cclaw'],
		upgrade_loc: { x: -180, y: -185, map: 'main', map_obj: G.maps['main'] },
		compound_loc: { x: -235, y: -185, map: 'main', map_obj: G.maps['main'] },
		exchange_loc: { x: -20, y: -478, map: 'main', map_obj: G.maps['main'] },
	},
}