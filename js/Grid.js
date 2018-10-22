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
		this.cells = []

		this._cellpixel = {
			width: undefined,
			height: undefined
		}
		this._resolution = 1
		this._events = []

		this.Cell = class {
			constructor(x, y) {
				this.coord = {
					x: undefined,
					y: undefined
				}
				this.pixelCoord = {
					x: undefined,
					y: undefined
				}
				this.color = {
					r: undefined,
					g: undefined,
					b: undefined,
					a: undefined
				}
				this._width = 0
				this._height = 0

				this.x = x
				this.y = y
			}
			get x() {
				return this.coord.x
			}
			set x(val) {
				if(typeof +val !== "number" || isNaN(+val)) throw new Error(`Cell.x: assigned value is invalid.`)
				this.coord.x = +val
			}
			get y() {
				return this.coord.y
			}
			set y(val) {
				if(typeof +val !== "number" || isNaN(+val)) throw new Error(`Cell.y: assigned value is invalid.`)
				this.coord.y = +val
			}
			get px() {
				return this.pixelCoord.x
			}
			set px(val) {
				if(typeof +val !== "number" || isNaN(+val)) throw new Error(`Cell.px: assigned value is invalid.`)
				this.pixelCoord.x = +val
			}
			get py() {
				return this.pixelCoord.y
			}
			set py(val) {
				if(typeof +val !== "number" || isNaN(+val)) throw new Error(`Cell.py: assigned value is invalid.`)
				this.pixelCoord.y = +val
			}
			get width() {
				return this._width
			}
			set width(val) {
				if(typeof +val !== "number" || isNaN(+val)) throw new Error(`Cell.width: assigned value is invalid.`)
				this._width = +val
			}
			get height() {
				return this._height
			}
			set height(val) {
				if(typeof +val !== "number" || isNaN(+val)) throw new Error(`Cell.height: assigned value is invalid.`)
				this._height = +val
			}
			// get color() {
			// }
			// set color(val) {
			// }
		}

		this.opts = {
			outerFrameWidth: 2,
			outerFrameColor: "#777777",
			cellFrameWidth: 0.5,
			cellFrameColor: "#aaaaaa"
		}
		if(this.width > 0 && this.height > 0) this.init(this.width, this.height)
	}
	get options() {
		return JSON.stringify(this.opts)
	}
	set options(val) {
		if(typeof val === "string") {
			try {
				val = JSON.parse(val)
			} catch(err) {
				throw new Error(`Grid.options: cannot parse the assigned string`)
			}
		}
		if(typeof val !== "object") throw new Error(`Grid.options: assigned value is not an object.`)
		for(let key in val) {
			if(!this.opts.hasOwnProperty(key)) continue
			this.opts[key] = val[key]
		}
		this.init()
	}
	get resolution() {
		return this._resolution
	}
	set resolution(val) {
		if(typeof +val !== "number" || isNaN(+val)) throw new Error(`Grid.resolution: assigned value is invalid.`)
		val = +val
		const original = {
			width: this.cvs.width / this.resolution,
			height: this.cvs.height / this.resolution
		}
		this.cvs.width = original.width * val
		this.cvs.height = original.height * val
		this.ctx.scale(val, val)
		this.cvs.style.width = `${ original.width }px`
		this.cvs.style.height = `${ original.height }px`
		this._resolution = val
	}
	init(width, height) {
		if(!(width === undefined && height === undefined && this.width !== undefined && this.height !== undefined)) {
			if(typeof +width !== "number" || isNaN(+width)) throw new Error(`Grid.init: argument "width" is invalid.`)
			if(typeof +height !== "number" || isNaN(+height)) throw new Error(`Grid.init: argument "height" is invalid.`)
			this.width = +width
			this.height = +height
		}
		this.resolution = 2
		this._calcSize()
		this._drawCells()
		this._drawOutline()
		this._addEvent()
		console.log("init!")
	}
	setResolution(val = 1) {
		this.resolution = val
		this.init()
	}
	cellLoc(px, py) {
		if(typeof +px !== "number" || isNaN(+px)) throw new Error(`Grid.init: argument "px" is invalid.`)
		if(typeof +py !== "number" || isNaN(+py)) throw new Error(`Grid.init: argument "py" is invalid.`)
		const cvsw = this.cvs.width / this.resolution
		const cvsh = this.cvs.height / this.resolution
		const outerFrameWidth = this.opts.outerFrameWidth
		const cellFrameWidth = this.opts.cellFrameWidth
		px = +px
		py = +py
		const location = {
			x: undefined,
			y: undefined
		}
		if(px > outerFrameWidth && px < cvsw - outerFrameWidth) location.x = (px - (outerFrameWidth / 2)) / (this._cellpixel.width + cellFrameWidth) | 0
		if(py > outerFrameWidth && py < cvsh - outerFrameWidth) location.y = (py - (outerFrameWidth / 2)) / (this._cellpixel.height + cellFrameWidth) | 0
		if(location.x === undefined || location.y === undefined) return { x: undefined, y: undefined }
		return location
	}
	_clear() {
		const cvsw = this.cvs.width / this.resolution
		const cvsh = this.cvs.height / this.resolution
		this.ctx.clearRect(0, 0, cvsw, cvsh)
	}
	_calcSize() {
		const cvsw = this.cvs.width / this.resolution
		const cvsh = this.cvs.height / this.resolution
		const outerFrameWidth = this.opts.outerFrameWidth
		const cellFrameWidth = this.opts.cellFrameWidth
		const cellWidth = (cvsw - outerFrameWidth * 2 + cellFrameWidth) / this.width - cellFrameWidth
		const cellHeight = (cvsh - outerFrameWidth * 2 + cellFrameWidth) / this.height - cellFrameWidth
		this._cellpixel.width = cellWidth
		this._cellpixel.height = cellHeight
	}
	_drawOutline() {
		const linewidth = this.opts.outerFrameWidth
		const cvsw = this.cvs.width / this.resolution
		const cvsh = this.cvs.height / this.resolution
		// top
		this.ctx.fillRect(0, 0, cvsw, linewidth)
		// right
		this.ctx.fillRect(cvsw - linewidth, 0, cvsw, cvsh)
		// bottom
		this.ctx.fillRect(0, cvsh - linewidth, cvsw, cvsh)
		// left
		this.ctx.fillRect(0, 0, linewidth, cvsh)
	}
	_drawCell(x, y) {
		if(x < 0 || x >= this.width) throw new Error(`Grid._drawCell: x is out of range.`)
		if(y < 0 || y >= this.height) throw new Error(`Grid._drawCell: y is out of range.`)
		const frameWidth = this.opts.outerFrameWidth
		const linewidth = this.opts.cellFrameWidth
		// top
		if(y > 0) {
			const startx = frameWidth + this._cellpixel.width * x + linewidth * (x - 1)
			const starty = frameWidth + this._cellpixel.height * y + linewidth * (y - 1)
			this.ctx.fillRect(startx, starty, this._cellpixel.width + linewidth, linewidth)
		}
		// right
		if(x < this.width - 1) {
			const startx = frameWidth + this._cellpixel.width * (x + 1) + linewidth * x
			const starty = frameWidth + this._cellpixel.height * y + linewidth * (y - 1)
			this.ctx.fillRect(startx, starty, linewidth, this._cellpixel.height + linewidth)
		}
		// bottom
		if(y < this.height - 1) {
			const startx = frameWidth + this._cellpixel.width * x + linewidth * (x - 1)
			const starty = frameWidth + this._cellpixel.height * (y + 1) + linewidth * y
			this.ctx.fillRect(startx, starty, this._cellpixel.width + linewidth, linewidth)
		}
		// left
		if(x > 0) {
			const startx = frameWidth + this._cellpixel.width * x + linewidth * (x - 1)
			const starty = frameWidth + this._cellpixel.height * y + linewidth * (y - 1)
			this.ctx.fillRect(startx, starty, linewidth, this._cellpixel.height + linewidth)
		}
		const corner = {
			x: frameWidth + (this._cellpixel.width + linewidth) * x,
			y: frameWidth + (this._cellpixel.height + linewidth) * y
		}
		return corner
	}
	_drawCells() {
		this._initCells()
		for(let i = 0; i < this.width; i++) {
			for(let j = 0; j < this.height; j++) {
				const corner = this._drawCell(i, j)
				// this.ctx.fillStyle = "rgb(255, 0, 0)"
				// this.ctx.fillRect(corner.x + 1, corner.y + 1, 2, 2)
				this.cells[i][j].px = corner.x
				this.cells[i][j].py = corner.y
				this.cells[i][j].width = this._cellpixel.width
				this.cells[i][j].height = this._cellpixel.height
			}
		}
	}
	_initCells() {
		this.cells = Array(this.width).fill(null)
		for(let i in this.cells) {
			this.cells[i] = Array(this.height).fill(null)
			for(let j in this.cells[i]) {
				this.cells[i][j] = new this.Cell(+i, +j)
			}
		}
	}
	_clickEvent(e) {
		const cvsw = this.cvs.width / this.resolution
		const cvsh = this.cvs.height / this.resolution
		const clientRect = this.cvs.getBoundingClientRect()
		const cvsposX = clientRect.left + window.pageXOffset
		const cvsposY = clientRect.top + window.pageYOffset
		const rx = e.pageX - cvsposX
		const ry = e.pageY - cvsposY
		console.log(this.cellLoc(rx, ry))
	}
	_removeAllEvents() {
		for(let key in this._events) {
			this.cvs.removeEventListener("click", this._events[key])
			this.cvs.removeEventListener("mousedown", this._events[key])
			this.cvs.removeEventListener("mousemove", this._events[key])
			this.cvs.removeEventListener("mouseup", this._events[key])
			this.cvs.removeEventListener("mouseover", this._events[key])
		}
		this._events.length = 0
	}
	_addEvent() {
		this._removeAllEvents()
		let cb = () => {}
		this.cvs.addEventListener("mousemove", cb = this._clickEvent.bind(this))
		this._events.push(cb)
	}
}
