class Grid {
	constructor(element, width, height) {
		if(element === undefined) throw new Error(`Grid.constructor: argument "element" is required.`)
		switch(typeof element) {
			case "string":
				element = document.querySelector(element)
			case "object":
				if(element === null) throw new Error(`Grid.constructor: canvas element is null.`)
				this.cvs = element
				try {
					this.ctx = this.cvs.getContext("2d")
				} catch(err) {
					this.cvs = undefined
					this.ctx = undefined
					throw new Error(`Grid.constructor: element is not a canvas.`)
				}
				break
			default:
				throw new Error(`Grid.constructor: argument "element" is invalid.`)
		}
		this.width = width !== undefined ? width : null
		this.height = height !== undefined ? height : null

		this.Cell = class {
			constructor(x, y) {
				this.coord = {
					x: undefined,
					y: undefined
				}
				this.color = {
					r: undefined,
					g: undefined,
					b: undefined,
					a: undefined
				}

				this.x = x
				this.y = y
			}
			get x() {
				return this.coord.x
			}
			set x(val) {
				if(typeof +val !== "number" && isNaN(+val)) throw new Error(`Cell.x: value of "x" is invalid.`)
				this.coord.x = val
			}
			get y() {
				return this.coord.y
			}
			set y(val) {
				if(typeof +val !== "number" && isNaN(+val)) throw new Error(`Cell.y: value of "y" is invalid.`)
				this.coord.y = val
			}
			// get color() {
			// }
			// set color(val) {
			// }
		}

		this.opts = {
			outerFrameWidth: 2,
			outerFrameColor: "#777777",
			cellFrameWidth: 1,
			cellFrameColor: "#aaaaaa"
		}
		if(this.width > 0 && this.height > 0) this.init(this.width, this.height)
	}
	get options() {
		return JSON.stringify(this.opts)
	}
	set options(val) {
		if(typeof val !== "object") throw new Error(`Grid.options: assigned value is not an object.`)
		for(let key in val) {
			if(!this.opts.hasOwnProperty(key)) continue
			switch(key) {
				// case "outerFrameWidth":
				// 	this._drawOutline(this.opts[key] = val[key])
			}
		}
	}
	init(width, height) {
		if(typeof +width !== "number" && isNaN(+width)) throw new Error(`Grid.init: argument "width" is invalid.`)
		if(typeof +height !== "number" && isNaN(+height)) throw new Error(`Grid.init: argument "height" is invalid.`)
		this._drawOutline(3)
		console.log("init!")
	}
	_clear() {
		const cvsw = this.cvs.width
		const cvsh = this.cvs.height
		this.ctx.clearRect(0, 0, cvsw, cvsh)
	}
	_drawOutline(linewidth) {
		const cvsw = this.cvs.width
		const cvsh = this.cvs.height
		// top
		this.ctx.fillRect(0, 0, cvsw, linewidth)
		// right
		this.ctx.fillRect(cvsw - linewidth, 0, cvsw, cvsh)
		// bottom
		this.ctx.fillRect(0, cvsh - linewidth, cvsw, cvsh)
		// left
		this.ctx.fillRect(0, 0, linewidth, cvsh)
	}
	_drawCell(x, y, linewidth) {
		
	}
}
