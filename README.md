# FunGeo - Fun Geometry

This is just my hobby project. This is not intended to be used for serious stuff.

Status: Still experimenting. WIP.

## Usage

### Online

[jonesangga.github.io/fungeo/](https://jonesangga.github.io/fungeo/)

### Offline

Install.
```
git clone --depth 1 https://github.com/jonesangga/fungeo.git
cd fungeo
npm install
```

Run.
```
npm start
```

----------------------------------------------------------------------

## Core Documentation

Note: This is not complete.

### Definition

```
let a = 10
let b = "a string"
let c = false
let d = true
let e = [1,2,3]
```

### Comment

```
// Single line comment
let a = 2  // Another comment

/*
    Multiline comment.
*/
```

----------------------------------------------------------------------

## Module Documentation

### Fish

My implementation of Functional Geometry
[paper](https://dl.acm.org/doi/pdf/10.1145/800068.802148)
by Peter Henderson.

#### Object and Functions

**Names**

- `fishp`, `fishq`, `fishr`, `fishs` are builtin fish components with size 16x16.
You need to resize it before drawing.
- `Picture` class.

**Constructor**

- `Pic(width: Num, height: Num)`. Create a picture object.

**Object methods**

All these methods except `draw()` return `this`.

- `place(x: Num, y: Num)`. Set the position of upper-left corner of the picture.
- `with_frame()`. Will be drawn with frame.
- `no_frame()`. Will be drawn without frame.
- `add_segment(x1: Num, y1: Num, x2: Num, y2: Num)`.
- `draw()`. Draw to canvas. Next modification to the picture will be updated live in canvas.

**Class methods**

All these methods return new `Picture`.

- `Pic.flipH(p: Pic)`. Flip horizontally.
- `Pic.flipV(p: Pic)`. Flip vertically.
- `Pic.cw(p: Pic)`. Rotate clockwise 90 deg.
- `Pic.ccw(p: Pic)`. Rotate counter clockwise 90 deg.
- `Pic.above(p1: Pic, p2: Pic)`. Place `p1` above `p2` with even ratio.
- `Pic.above(r1: Num, r2: Num, p1: Pic, p2: Pic)`. Place `p1` above `p2` with ratio `r1`:`r2`.
- `Pic.beside(p1: Pic, p2: Pic)`. Place p1 beside p2 with even ratio.
- `Pic.beside(r1: Num, r2: Num, p1: Pic, p2: Pic)`. Place `p1` beside `p2` with ratio `r1`:`r2`.
- `Pic.quartet(p: Pic, q: Pic, r: Pic, s: Pic)`. Similar to `Pic.above(Pic.beside(p, q), Pic.beside(r, s))`.
- `Pic.cycle(p: Pic)`. Similar to `Pic.quartet(p, Pic.cw(p), Pic.cw(Pic.cw(p)), Pic.ccw(p))`.
- `Pic.resize(p: Pic, w: Num, h: Num)`.

#### Result

This is to draw the squarelimit. Just paste it to a fresh repl session.

```
let p = fishp
let q = fishq
let r = fishr
let s = fishs
let nil = Pic(16, 16)
let t = Pic.quartet(p, q, r, s)
let u = Pic.cycle(Pic.ccw(q))
let side1 = Pic.quartet(nil, nil, Pic.ccw(t), t)
let side2 = Pic.quartet(side1, side1, Pic.ccw(t), t)
let corner1 = Pic.quartet(nil, nil, nil, u)
let corner2 = Pic.quartet(corner1, side1, Pic.ccw(side1), u)

let corner =
  Pic.above(1,
            2,
            Pic.beside(1,
                       2,
                       corner2,
                       Pic.beside(1,
                                  1,
                                  side2,
                                  side2)),
            Pic.above(1,
                      1,
                      Pic.beside(1,
                                 2,
                                 Pic.ccw(side2),
                                 Pic.beside(1,
                                            1,
                                            u,
                                            Pic.ccw(t))),
                      Pic.beside(1,
                                 2,
                                 Pic.ccw(side2),
                                 Pic.beside(1,
                                            1,
                                            Pic.ccw(t),
                                            Pic.ccw(q)))))

let squarelimit = Pic.cycle(corner)
\canvas0.resize(600, 600)
Pic.resize(squarelimit, 600, 600).draw()
```

#### TODO

- Add tests.
- Add `flipH()`, `flipV()`, `cw()`, `ccw()`, `Pic.overlay(p1: Pic, p2: Pic)`.

----------------------------------------------------------------------

### Apollonian

#### Object and Functions

**Names**

- `Apol` class.

**Object methods**

- `draw()`. Draw to canvas. Next modification to the picture will be updated live in canvas.

**Class methods**

All these methods return new `Apol`.

- `Apol.enclosing(r: Num)`. Create new object with radius `r`.
- `Apol.next()`. Do next iteration.

#### TODO

- Add tests.
- Set ratio of the first two inner circles.
- `Apol.prev()` to move to the previous iteration.
- Support coloring.
- Implement integer bends variant.

----------------------------------------------------------------------

### Sierpinski

#### Object and Functions

**Names**

- `Sierp` class.

**Constructor**

- `Sierp(x1: Num, y1: Num, x2: Num, y2: Num, x3: Num, y3: Num)`. Create a Siepinski object.

**Object methods**

- `draw()`. Draw to canvas. Next modification to the picture will be updated live in canvas.

**Class methods**

All these methods return new `Sierp`.

- `Sierp.next()`. Do next iteration.

#### TODO

- Add tests.
- Create object given 3 angles.
- Don't draw all triangles in every iteraion. Only draw the last iteration.

----------------------------------------------------------------------

### Tiling

#### Object and Functions

**Names**

- `Hexa` class.

**Constructor**

- `Hexa()`. Create a Hexagonal grid object.

**Object methods**

- `draw()`. Draw to canvas. Next modification to the picture will be updated live in canvas.

#### TODO

- Add tests.
- Add some transformations.
- Setting visible range.

----------------------------------------------------------------------

## License

MIT.
