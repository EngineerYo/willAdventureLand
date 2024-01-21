let item_list = ['wcap', 'wshoes', 'sshield']
let target_level = 7


let do_upgrade = (item) => {
	set_message(`${item}`)
	if (item_list.length == 0) return

	let scroll_idx = locate_item('scroll0')
	let item_idx = locate_item(item)

	if (scroll_idx == -1) buy('scroll0', 1)
	if (item_idx == -1) {
		item_list.shift()
		do_upgrade(item_list[0])
	}

	use_skill('massproduction')
	upgrade(item_idx, scroll_idx).then(
		// Success
		(res) => {
			if (res.success && res.level >= target_level) item_list.shift()
			do_upgrade(item_list[0])
		},
		// Failure
		(res) => {
			do_upgrade(item_list[0])
		})
}

do_upgrade(item_list[0])
