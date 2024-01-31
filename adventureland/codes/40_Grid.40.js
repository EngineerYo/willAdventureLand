class Grid {
    constructor(map) {
        this.map = map
        this.resolution = 8 // 2px squares

        this.min_x = map.data.min_x
        this.max_x = map.data.max_x
        this.min_y = map.data.min_y
        this.max_y = map.data.max_y

        this.y_lines = map.data.y_lines
        this.x_lines = map.data.x_lines

        this.grid = {}

        this.construct()
    }

    clean_data() {
        let points = []
    }
    construct() {
        for (let x = this.min_x; x < this.max_x; x += this.resolution) {
            for (let y = this.min_y; y < this.max_y; y += this.resolution) {

                // first, find all y_lines in this column
                let my_y_lines = this.y_lines
                    .filter(([yt, x0, x1]) => x0 <= x && x < x1)

                // now, find the number we've crossed
                let crosses = my_y_lines
                    .filter(([yt, x0, x1]) => yt <= y)
                    .length

                if (crosses % 2 == 0) {
                    console.log('Continued!')
                    continue
                }
                if (!this.grid[x]) this.grid[x] = {}
                this.grid[x][y] = 1
            }
        }
        return this.grid
    }

    render() {
        let grid = new PIXI.Graphics()
        grid.lineStyle(1, 0x444444)

        for (let [x, y_obj] of Object.entries(this.grid)) {
            for (let [y, val] of Object.entries(y_obj)) {
                if (!val) continue
                grid.drawRect(x, y, this.resolution, this.resolution)
            }
        }

        parent.drawings.push(grid)
        parent.map.addChild(grid)
    }
    render_boundaries() {
        for (let [x, y0, y1] of this.x_lines) {
            draw_line(x, y0, x, y1, 1, 0xFFFFFF)
            draw_circle(x, y0, 2, 0, 0xFFFFFF)
            draw_circle(x, y1, 2, 0, 0xFFFFFF)
        }
        for (let [y, x0, x1] of this.y_lines) {
            draw_line(x0, y, x1, y, 1, 0xFFFFFF)
            draw_circle(x0, y, 2, 0, 0xFFFFFF)
            draw_circle(x1, y, 2, 0, 0xFFFFFF)
        }
    }
}

module = {
    exports: {
        Grid
    }
}