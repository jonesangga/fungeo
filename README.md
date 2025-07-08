# FunGeo - Fun Geometry

This is just my hobby project. This is not intended to be used for serious stuff.

Status: Still experimenting. WIP.

- [Live](https://jonesangga.github.io/fungeo/)

Documentation: see below.

## Installation

```
git clone --depth 1 https://github.com/jonesangga/fungeo.git
cd fungeo
npm install
```

## Usage

```
npm start
```

## Test

The directory `test_output` contains test files containing FunGeo source code and the associated
output files containing the expected output for each test.

```
npm run testout
```

## Documentation

This is not complete.

### Core

#### Definition

```
let a = 10
let b = "a string"
let c = false
let d = true
let e = [1,2,3]
```

#### Comment

```
// Single line comment
let a = 2  // Another comment

/*
    Multiline comment.
*/
```

### Modules

#### Fish

This module contains my implementation of Functional Geometry
[paper](https://dl.acm.org/doi/pdf/10.1145/800068.802148)
by Peter Henderson.

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
- `flipH()` TODO.
- `flipV()` TODO.
- `cw()` TODO.
- `ccw()` TODO.
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
- `Pic.overlay(p1: Pic, p2: Pic)` TODO.

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

## License

MIT.
