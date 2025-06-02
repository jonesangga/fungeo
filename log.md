# Log

#### 01-06-25

- change call in `_Type()`
- add type() for all FG functions
- don't use emitConstant for fn since it changes in runtime
  use index = makeConstant(new String(name)), followed by emitBytes(Op.GetUsr, index)
- remove version from FGCallNative and FGCallUser

#### 31-05-25

- new Data type for storing partial application: FGCurry

- change signature without n: Number in all functions in vmfunction since there is overload now
- clean up  get_global() since there is only one version of functios
- don't emit ver
- in vm: dont read the ver
- change version signature to not use array
- add examples for new namespaced functions
- just comment Above and Beside for now
- change all overloaded functions to use namespace
    - C -> C.FromPoints
    - R -> R.FromPoints
- change FromPoint to FromPoints
- add new example about this

- check if can compile Seg.FromPoint p q. Done
- parse Dot in parse_callable(), not in statement()
- remove overload in Seg into method Seg.FromPoint
- new token Dot
- add optional methods field on names

#### 30-05-25

- add more examples
- example fail bare block
- add fizzbuzz to demo
- add fibonacci to demo
- force callable name to use PascalCase
- change token Name into NCallable and Callable

#### 29-05-25

- script to run example test
- add (one) test file for example files
- add example files
- use 'let' for control scope
- can only use block as a body
- forbid bare block statement
- make demo

#### 28-05-25

- major rewrite
- optional value field in tempNames
- fix scoping bug
- update tests

#### 27-05-25

- global keyword
- mutable name
- success implement apollonian gasket
- clean up scanner, update scanner.test
- make procedure that return value
- change vmfunction input output
- change Op.Set mechanism
- change type representation

#### 26-05-25

- add comment support
- fix bug: index in disassemble_instr

#### 25-05-25

- list indexing
- add bend optional field
- implement complex number
- make assertList()
- separate <> for string, ++ for list
- add token LR
- change string concat syntax to use `<>`
- change CheckType representation. Just use list.
- add optional elKind in TypeCheck after base
- overload ++ for list concat
- implement list

#### 24-05-25

- make temporary Ccurv function to create Circle given a curvature
  later it should be namespaced
- display help on start up
- new help.ts file
- make Clear/0 native procedure
- remove Clear token, Op, and in vm switch
- add test for native procedure with no arg
- bug: cannot print <fn funcname>. Change to {fn funcname}
- make native procedure Help/0
- support native procedure that doesnt have arg
- fix bug: this should not be error
  Print Print
- change Op.Set type arg to Kind.CallUser for fn in fn()
- change Op.Set type arg to Kind.CallUser for proc in proc()
- update the related part in get_name()
  make another check case for Kind.CallUser after Kind.CallNative
- write test for native function and user function

#### 23-05-25

- move call to jsdom to one file
- change FGCallable to FGCallNative
- change all FGFunction to FGCallUser
- make FGCallUser
- add Bool type
- fix bug: in Ret forgot to update currChunk
- basic Picture test

#### 22-05-25

- create Map funciton
- clean up data/fish
- add ratio to Beside and Above
- add Clear statment
- add token Clear
  this should be a built-in procedure. Change after it support built-in procedure without arg
- add Quartet and Cycle
- add beside and above default ratio
- add flipH and flipV
- add cw and ccw
- add map_to
- add fish data
- add Paint function
- add Pic
- test Circle and Ellipse
- add Ellipse
- add Circle
- rename frame to currFrame
- add rect.test
- add Rect

#### 21-05-25

- test Midpoint
- test Point
- implement Midpoint in Segement class
- overload Seg
- implement canvas.clear()
- add Point
- remove equal method
- remove FG import
- tes Segment
- install canvas
- install jsdom global-jsdom
- test dom

#### 20-05-25

- remove interface GeoSegment
- add Segment
- add canvas and repl to nativeNames
- make new type UIObj = Canvas | Repl;
- add kind to Repl and Canvas
- change KindName type
- add Canvas and Repl to Kind enum
- change canvas to canvasElem
- for now there is one canvas
- add canvas element
- add canvas.ts

#### 19-05-25

- pass argCount to Op.Call
- update CallNat and CallUsr disassemble
- Load function before its args before calling
- use Result type in vm
- change init_compiler() to begin_compiler()

#### 18-05-25

- reset lastT in compiler.compile()
- handle infinite loop
- new Op: CkExcD, CkIncD, Loop
- step is mandatory for decreasing range
- fix bug: [0.5,3)i Print i
  => 0.5
     1.5
  should be
     0.5
     1.5
     2.5

- change compare to boolean_compare
- fix bug: this should not be error
  Print $ 2 + 3

#### 17-05-25

- update chunk.test according to below update
- add name field to FGCallable
- display function name in disassembler
- clean up chunk.ts
- clean up chunk.test
- scanner.test: match kind in each token test
- update scanner.test
- clean up scanner.ts
- update TokenTName type
- change Token interface to type

#### 16-05-25

- Ret op takes one arg: how many slot to pop and push back
- support procedure
- new Token Proc
- fix bug: undefined name when doing recursive
  set canParseArgument to true
- add ifx for if expression
- add Then token
- fix bug: infinite loop because Cond and Inc
- match fn return type with return expression type
- new parse_params() and parse_type()
- For now only pure function
  later will add procedure like pascal
- new CallUsr
- there is a diff between calling native fn vs user-dfn
- new fun() in compiler
- syntax for fn decl is different
- new Token Fn, NumT, StrT, Return
- new FGFunction

#### 14-05-25

- remove arrow
- new assertT() for type check
- change interface Types to type Info
- make equal() method fo each class
- change Op.Eq implementation to use equal() method
- new FGType
- change parser.previous to prevTok, parser.current to currTok
- make Padl function
  Padl "a" 4 " " -> "  a"
- support open right interval

#### 13-05-25

- mandatory step local
- pass amount to increent
- support step [a,b,step]
- compiler.test error: start and end not number
- start and end of range in loop should be number
- change chunk.test: Inc, Cond

- test compiler error
  no ,
  no ]
  no ->
  no iterator
  reassignment to iterator

- solved
- bug: if there is assignment in body loop it is not popped after assignment
  normally it is popped in endScope()
  should simulate endScope() but the scopeDepth is not incremented here
  solution: iterate and pop locals in current.locals UNTIL start+1

- I thinkk I should add dummy locals in each loop
  _Start, and _End correpond to start and end of range
  and when parsing the iterator name, manually change the _Start name to it

- solved
- bug: same as Inc below, Cond must have arg

- update Inc in chunk related to below bug
- bug: when there is another local in loop body, Inc operator will increment the END of the range
  should add arg (START of the range) for Inc to look and change

- solved
- bug: if there is a block in loop body it will scopeDepth will be incremented
  this make local variable can be reassigned since the check for duplicates fail
  should parse `{` before the body and `}` after the body

- vm.test: JmpBack, Inc, Cond, IsDiv
- compiler.test: parse_loop() (Cond, Inc, JmpBack), binary() (IsDiv)
- chunk.test: Cond, Inc, JmpBack, IsDiv
- scanner.test: TokenT.Arrow

#### 12-05-25

- add show function
- create printf function
- make Pipe as mod `if 2|4`
- change Jmp used for backward to be JmpBack
- delete Op.Loop
- change Loop to use Jmp with negative
- add TokenT.Arrow
- Add loop.

#### 11-05-25

- vm.test: all combination of a || b and a && b
- compiler.test: error in parse_if, conditional is not boolean
- compiler.test: error in a || b and a && b
- compiler.test: a || b and a && b
- scanner.test: Amp, AmpAmp, Pipe, PipePipe token types.
- fixed
- bug: conditional expression accept non boolean type
- scanner: add Amp, AmpAmp, Pipe, PipePipe lexemes
- update docs to include block, if, else
- fixed: it is because I copy paste a rule and change that to If but
  forgot to change the infix and precendence
- bug: cannot surround conditional expression with parentheses in a nested if
       it should be allwed
- fix: small typo in compare().
- vm.test: Op.Jmp, Op.JmpF
- compiler.test: `parse_if`.
- chunk.test: Op.Jmp, Op.JmpF
- scanner.test: If, Else tokens

#### 10-05-25

- color red for error, green otherwise
- count code number
- change the left and width of terminal
- change terminal from <pre> to <div>
- update repl
- if stmt support
- new Op: Jmp, JmpF
- new Token: If, Else
- vm.test Op.GetLoc and Op.SetLoc
- chunk.test Op.GetLoc and Op.SetLoc
- compiler.test: block error: local duplicate
- compiler.test: block
- scanner.test: change scanner error message unexpecter character to include the character
- scanner.test: add test for `{` and `}` lexemes.
- make TokenType sorted alphabetically
- fixed.
- bug: compiler.test compare()
- change `parse_callable()` to `global_callable()`
- change `parse_non_callable()` to `global_non_callable()`
- refactor `parse_name()`
- vm instruction for SetLoc
- change Local.name type from Token to string
- add type property in Local
- add `{` and `}` in tokentype
- add block statement support

#### 09-05-25

- fixed
- bug: forgot changing lastType to boolean in compare()
  this will error: Print !(2 < 3): 
- test vm: Eq, NEq, LT, GT, LEq, GEq
- bug: forget update lastType in eq() and neq()
- test compiler: Eq, NEq, LT, GT, LEq, GEq
- test.chunk: group test by their args number
- test chunk: Eq, NEq, LT, GT, LEq, GEq
- test scanner: Eq, BangEq, Less, Greater, LessEq, GreaterEq
- bug on Op.Eq and Op.NEq in VM: solved
- update README
- link doc in README
- make separated repo for docs
- make type Comparable = FGNumber | FGString
- new compare() function
- Add Eq, NEq, LT, GT, LEq, GEq to chunk
- test not() in compiler
- test negate() in compiler
- split unary() into not() and negate()

#### 08-05-25

- test vm: FGString.add
- test compiler: binary_str
- test chunk: Op.AddStr
- test scanner: ++
- new syntax ++ for string concat
- test Op.CallNat in chunk
- add test chunk.test for GetUsr GetNat
- add Type nativefn
- add Op.CallNat in VM
- add Op.CallNat in chunk
- new CallNat, CallUsr
- update chunk.test.ts
- change padding to 7
- initialize Precedence num
- initialize TokenT enum
- initialize Kind enum
- initialize Op enum so it doesn't pollute the diff when inserting or changing order
- remove unnecessary Op.False and Op.True
- vm: Neg, Not and test

#### 07-05-25

- test division by zero
- add test for below
- fix sub, mul, div
- add test for FGNumber add
- reset userNames in vm.test
- update compiler.test for GetUsr
- update chunk.test for GetUsr
- new instruction Op.GetUsr
- change Op.Get to Op.GetNat for nativeNames
- make new userNames
- change names to nativeNames
- modify Op.Get instruction, need another flag for which names?
- separate built-name names with user defined names
- remove InterpretResult enum
- test vm stack
- test compiler error: expect expression
- bug: rules[parser.current.kind] is undefined: solve
  make rules exhaustive
- store code in history unmodified, but append to terminal modified (change new line to |)
- bug: the source is modified in repl before compiled: solved
- send compilerResult to repl
- add set_callback(string) to repl module 
- add vm.ts

#### 06-05-25

- remove getRule just index the array directly
- update chunk.test
- add grouping test
- fix grouping
- search how to skip test
- refactor compiler.test.ts
- test invalid unary operator
    `-` only for number
    '!' only for boolean
- test invalid binary operator
- note we don't need to set lastType to number in binaryop
  it is already from the right operand
- test binary op with vairable
- lastType check in binaryop
- test multiple unary
- test multiple binary
- test unary ! -
- test binary + - * /
- update scanner.test.ts
- make lexeme property not optional
- for now only immutable variable
- change literal() to boolean in compiler.ts
- test compiler: CompileError
    - undefined variable
    - scanner error
- bug: when error happen in advance() before try catch: solved
- test compiler: success
- test compiler: assignment

#### 05-05-25

- test value.ts
- change Op.Const to Op.Load
- change chunk.add_constants to chunk.add_value
- change chunk.constants to chunk.values
- minimize padding for Op name in chunk.disassemble_instr() to 10
- write test for chunk
- make optional flag for lexeme
- change test script in package.json
- remove test dir in root
- use
    "module": "nodenext"
    "moduleResolution": "nodenext"
- test move test to src
- test nodeNext module
- add dev-dependencies @types/node
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
