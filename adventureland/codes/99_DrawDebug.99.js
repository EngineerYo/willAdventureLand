const draw_range_and_motion = (query = null) => {
	draw_circle(character.x, character.y, character.range + character.xrange, 1, 0x00ff00)

	rad = (deg) => (deg *= Math.PI / 180)
	for (let [id, monster] of Object.entries(parent.entities)) {
		// Are we only wanting to show query targets?
		if (query != null && monster.mtype != query) continue

		// Create new graphic object
		let [line, pill] = [new PIXI.Graphics(), new PIXI.Graphics()]
		pill.lineStyle(1, 0xff0000)
		line.lineStyle(1, 0xff0000)

		let { x, y, range, angle, going_x: to_x, going_y: to_y } = monster
		angle = rad(angle)

		if (monster.moving) {
			pill.arc(x, y, range, angle + rad(90), angle - rad(90))
				.arc(to_x, to_y, range, angle - rad(90), angle + rad(90))
				.arc(x, y, range, angle + rad(90), angle - rad(90))
		}

		line.moveTo(x, y)
			.lineTo(to_x, to_y)

		for (let graphic of [line, pill]) {
			parent.drawings.push(graphic)
			parent.map.addChild(graphic)
		}

	}
}

const draw_target = (from, to) => {
	if (!from || !to) return
	let [line, from_box, to_box] = [new PIXI.Graphics(), new PIXI.Graphics(), new PIXI.Graphics()]
	line.lineStyle(1, 0xFFFF00)
	from_box.lineStyle(1, 0x00FF00)
	to_box.lineStyle(1, 0xFF0000)

	const [from_x, from_y] = [from.real_x || from.x, from.real_y || from.y]
	const [to_x, to_y] = [to.real_x || to.x, to.real_y || to.y]

	const [from_w, from_h] = [from.awidth || from.width, from.aheight || from.height]
	const [to_w, to_h] = [to.awidth || to.width, to.aheight || to.height]

	// Draw a targetting line between from and to
	line.moveTo(from_x, from_y)
		.lineTo(to_x, to_y)

	// Draw the bounding box of from
	from_box.moveTo(from_x + from_w / 2, from_y + from_h / 2)
		.lineTo(from_x - from_w / 2, from_y + from_h / 2)
		.lineTo(from_x - from_w / 2, from_y - from_h / 2)
		.lineTo(from_x + from_w / 2, from_y - from_h / 2)
		.lineTo(from_x + from_w / 2, from_y + from_h / 2)

	// Draw the bounding box of to
	to_box.moveTo(to_x + to_w / 2, to_y + to_h / 2)
		.lineTo(to_x - to_w / 2, to_y + to_h / 2)
		.lineTo(to_x - to_w / 2, to_y - to_h / 2)
		.lineTo(to_x + to_w / 2, to_y - to_h / 2)
		.lineTo(to_x + to_w / 2, to_y + to_h / 2)

	for (let graphic of [line, from_box, to_box]) {
		parent.drawings.push(graphic)
		parent.map.addChild(graphic)
	}
}

module = {
	exports: {
		draw_range_and_motion,
		draw_target,
	}
}