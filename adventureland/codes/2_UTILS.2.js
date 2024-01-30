var module = {
	exports: {
		in_boundary: (location, boundary, range = 0) => {
			// Will need to check map elsewhere
			let min_x = location.x >= boundary[0] - range
			let max_x = location.x <= boundary[2] + range
			let min_y = location.y >= boundary[1] - range
			let max_y = location.y <= boundary[3] + range
			return min_x && max_x && min_y && max_y
		},

		nearest_at_range: (origin, location, range) => {
			let offset = { x: location.x - origin.x, y: location.y - origin.y }
			let distance = distance(location, origin)

			let unit = { x: offset.x / distance, y: offset.y / distance }
			let final = { x: unit.x * range, y: unit.y * range }

			return final
		},
		ms_to_next_skill: (skill) => {
			const next_skill = parent.next_skill[skill]
			if (next_skill == undefined) return 0
			const ms = parent.next_skill[skill].getTime() - Date.now()
			return ms < 0 ? 0 : ms
		},
		get_scroll: (inv_item) => {
			if (inv_item.level === undefined) return false
			let passed = G.items[inv_item.name].grades.filter(lvl => inv_item.level >= lvl).length
			if (G.items[inv_item.name].compound) return `cscroll${passed}`
			else if (G.items[inv_item.name].upgrade) return `scroll${passed}`
			else return false
		}
	},
}
