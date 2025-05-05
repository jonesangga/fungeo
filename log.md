# Log

#### 05-05-25

- use import type
- add names.ts
- remoove interface for Lit*, make them into class

#### 04-05-25

- make OpName object
- change OpCode to Op
- add types.ts
- add value.ts
- add chunk.ts
- add compiler.ts
- remove Clear
- clean up TokenT, group like keyword, operator, etc
- create objs TokenTName containing string version of enum TokenT item.
- rename TokenType to TokenT
- scanner.all_string() method
- add scanner.ts
- add server deps
- add history

#### 03-05-25

- add repl
    - create replDiv element
    - append to body
    - etc
- restart index.html
- change tsconfig to use module
- add package.json
- Restart again

#### 02-05-25

- make name Rgba, Rgb, Gray, Hex
- bug: parse_callable error report: solved
- move page, canvas, and repl to ui dir
- add color name constant to names

#### 01-05-25

- dynamically expand repl input width
- change history_ var in repl object to a new replHistory object
- change event to e in callback
- write repl doc
- bug: entering text with only newlines got added to history
  use trim()
- bug: when at the top history, pressing shift+up will highlight the text. It should not: solved
- pressing Enter in repl will make new line
  repl.style.height = "auto"
  repl.style.height = repl.scrollHeight + "px";
- pressing shift+up/down to move history
- pressing up/down to move in current source text
  that means we cannot select/highlight text vertically
- bug pressing arrow up for history doenst update the textarea height until pressing an input: solved
- pressing shift+enter to execute (instead of just enter)
- remove enter event from repl, back to default
- place book.toml in root
- disable search in dev enable in prod
- copy book.toml from another project
- source is in md dir, build is in html dir
- make documentation in mdbook
- change input to textarea
- change name.ts to names.ts
- Use square brackets for indexing list

#### 30-04-25

expressStmt happen when lastType is not invalidType when entering declaration()
problem:
Length arr will leave a value in stack that not get pop()
solution:
disallow expression statement
- add length function to return length of list
- make print as function
- line can be made from coords like Segment is made
l = L a b c d
- line can be made from 2 Points
l = L p q
- line can be made from Segment
s = Seg a b c d
l = L s
- flip all fish component so we don't need flipV

    function flipY(a) {
      return a.map(i => [i[0], 16-i[1], i[2], 16-i[3]]);
    }
    a.reduce((acc, curr) => acc + "[" + curr.join(",") + "],", "[") + "]"

- change map in Pic to mapto

#### 29-04-25

- draw Line in all case: quadran, slope
- create a Line
- change all reference to Line to Segment
- change #line_scale to #segment_scale
- remove GeoLine because it will be used later like a real Line
- add Midpoint(seg) -> Point command
- change DefineName to AssignName
- make tempNames to hold names in compile-time

#### 28-04-25

- make page fillable.
- change (almost) everything to class.
- change line to segment
- make non related PicOp methods private

#### 25-04-25

- overload above
- overload beside

#### 24-04-25

- make a fn to check if a kind can be listed
- make special debug window
- create a list of lines
- overload paint to accept a list of GeoOb
- make new() in lineOp replacing newLine()
- change line printing to use lineOp `to_str()`
- make LineOp interface

#### 21-04-25

- dl original paper 1982
- implement above(p, q)
- add ellipse constructor
- implement beside(p, q)
- new command clear to clear all onScreen
- $ not after a function is illegal
- $ that is parsed in expression() is illegal
- fix $ and canParseArgument in parsing
- in `parse_definition`, set canParseArgument to true before parsing RHS
- when first parsing expression, set canParseArgument to true
- in `parse_callable`, set canParseArgument = match(TokenType.Dollar)
- implement filpV
- make a good sample pic
- implement flipH
- implement ccw
- new method paint pic a to append GeoObj a to pic.objs array
- fill fillableSet
- fix fill()
- remove `parse_draw` in compiler.ts
- handle canParseArgument in delcaration -> Identifier
- remove draw from scanner token
- add draw to names
- presrve color for transform
- change CW to cw

#### 20-04-25

- make bind method
- in a Pic either don't draw or draw all
- add array of GObj in Pic.
- make functions to create all GObj
- make OpCode.Call(ver) for general call

#### 19-04-25

- make resize() function in vm accept 1 argument (the version number)
- make color interface
- change type to interface in value.ts
- move all types in primitive.ts to types.ts
- move all types in value.ts to types.ts
- change kind.Invalid to kind.Nothing

#### 18-04-25

- create method resize
- create type Rectangular
- make type UIObj = UICanvas;
- change Canvas to UI Canvas
- create Pic constructor
- create a type Bindable
- create a Pic object
- make Coord obj: GeoCoord

#### 17-04-25

- remove L, R, P, etc from rules
- change justDefinedGObj to lastType
- think how to overload function L: done
- change geoKind to use Set data structure

#### 16-04-25

- use early return when canParseArgument is false for easy reading
- make `parse_L` return its type when canParseArgument is false
- change lastType's type to Types
- change back function notation like haskell: L, P
- clean up replOutput style
- push to hostory, don't prepend.

#### 15-04-25

- support d = C(q, P(150,150))
- support making circle given center point and point at circle.
- change function call to use (): R
- support making rectangle from 2 Points.
- when to reset this lastType? in the caller for expression().
- global variable lastType for type checking in compiler
- check type of argument of L, must be numbers.
- don't support expression statement
- overload L. Accept 2 points arguments.
- change kind in LObj to use Kind enum
- change function call to use (): P
- change function call to use (): L
- move cursor to the end when going through repl history (bug fix)
- add Token Comma
- make test.html
- make fungeo-test.js

#### 14-04-25

- create closed shape object GeoShape
- method S to make closed shape object
- change length property to end in token because we always do
    slice(token.start, token.start + token.length);
- add optional property error for token error
- add C command to make circle
  c = C 100 100 50
- add circle support
- add stroke command
- make fill fail when the argument doesn't have fillStyle property
- change fillStyle to strokeStyle in GeoLine
- change stroke property to strokeStyle
- change color property to fillStyle
- change color command to fill
- use const enum for kind property in GObj (or in all Obj??)

#### 13-04-25

- don't fire enter when repl is empty
- don't compiler empty string
- use try catch in compiler.
- give error when trying to draw non GObj.

#### 12-04-25

- add `lineop_obj` as bindable
- make syntax L 100 100 100 100
- create repl object
- create default canvas 300x300
- separate files
- create a scanner object
- print input text in console
- add input field
- make simple html without css
