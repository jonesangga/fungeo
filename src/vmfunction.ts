// const fillableT = new UnionT([circleT, ellipseT]);

// function _printf(): void {
    // let value = session.pop();
    // session.pop();              // The function.
    // session.write( value.to_str() );
// }
// let printf = new FGCallNative("printf", _printf,
    // new FunctionT([anyT], nothingT)
// );

// function _sqrt(): void {
    // let value = session.pop() as FGNumber;
    // session.pop();              // The function.
    // push(new FGNumber( Math.sqrt(value.value) ));
// }
// let sqrt = new FGCallNative("sqrt", _sqrt,
    // new FunctionT([numberT], numberT)
// );

// function _abs(): void {
    // let value = session.pop() as FGNumber;
    // session.pop();              // The function.
    // push(new FGNumber( Math.abs(value.value) ));
// }
// let abs = new FGCallNative("abs", _abs,
    // new FunctionT([numberT], numberT)
// );

// function _show(): void {
    // let value = session.pop();
    // session.pop();              // The function.
    // push(new FGString( value.to_str() ));
// }
// let show = new FGCallNative("show", _show,
    // new FunctionT([numberT], stringT)
// );

// function _padl(): void {
    // let filler = (pop() as FGString).value;
    // let width = (pop() as FGNumber).value;
    // let text = (pop() as FGString).value;
    // pop();              // The function.

    // let result = (filler.repeat(width) + text).slice(-width);
    // push(new FGString(result));
// }
// let padl = new FGCallNative("padl", _padl,
    // new FunctionT([stringT, numberT, stringT], stringT)
// );

// function _RGB(): void {
    // let b = (pop() as FGNumber).value;
    // let g = (pop() as FGNumber).value;
    // let r = (pop() as FGNumber).value;
    // pop();              // The function.
    // push(new FGColor(r, g, b));
// }
// let RGB = new FGCallNative("RGB", _RGB,
    // new FunctionT([numberT, numberT, numberT], colorT)
// );

// // TODO: Think about this again. We lose the type information because that is on table not on stack or on the value.
// function _TypeFn(): void {
    // let value = pop();
    // pop();              // The function.
    // push((value as FGCallNative).typeof());
// }
// let TypeFn = new FGCallNative("TypeFn", _TypeFn,
    // new FunctionT([anyT], stringT)
// );

// // TODO: not type safe, change to use generic.
// function _Push(): void {
    // let el = pop();
    // let list = pop() as FGList;
    // pop();              // The function.
    // list.value.push(el);
// }
// let Push = new FGCallNative("Push", _Push,
    // new FunctionT([new ListT(anyT), anyT], nothingT)
// );

// function _label(session: Session, ver: number): void {
    // let label = (session.pop() as FGString).value;
    // let v = session.pop() as RichGeoObj;
    // session.pop();              // The function.
    // v.label = label;
    // draw_onScreen();
// }
// let label = new FGCallNative("label", _label,
    // new OverloadT([
        // new FunctionT([richgeoT, stringT], nothingT),
    // ])
// );

// function _Fill(): void {
    // console.log("in _Fill()");
    // let v = pop() as Fillable;
    // let color = pop() as FGColor;
    // pop();              // The function.
    // v.fillStyle = color.to_hex();
    // draw_onScreen();
// }
// let Fill = new FGCallNative("Fill", _Fill,
    // new FunctionT([colorT, fillableT], nothingT)
// );

// function _intersect(session: Session, ver: number): void {
    // let q = session.pop() as Circle;
    // let p = session.pop() as Circle;
    // session.pop();              // The function.
    // let points = p.intersect(q);
    // let res = new FGList(points, pointT);
    // session.push(res);
// }
// let intersect = new FGCallNative("intersect", _intersect,
    // new OverloadT([
        // new FunctionT([circleT, circleT], new ListT(pointT)),
        // new FunctionT([richCircleT, richCircleT], new ListT(richPointT)),
    // ])
// );

// function _rcircle(session: Session, ver: number): void {
    // if (ver === 0) {
        // let q = session.pop() as RichPoint;
        // let p = session.pop() as RichPoint;
        // session.pop();              // The function.
        // session.push(new RichCircle(p, q));
    // }
    // else if (ver === 1) {
        // let r = (session.pop() as FGNumber).value;
        // let p = session.pop() as RichPoint;
        // session.pop();              // The function.
        // let q = new RichPoint(p.x + r, p.y);
        // session.push(new RichCircle(p, q));
    // }
// }
// let rcircle = new FGCallNative("rcircle", _rcircle,
    // new OverloadT([
        // new FunctionT([richPointT, richPointT], richCircleT),
        // new FunctionT([richPointT, numberT], richCircleT),
    // ])
// );

// function _Ccurv(): void {
    // let bend = (pop() as FGNumber).value;
    // let y = (pop() as FGNumber).value;
    // let x = (pop() as FGNumber).value;
    // pop();              // The function.
    // let c = Circle.with_bend(x, y, bend);
    // push(c);
// }
// const Ccurv = new FGCallNative("Ccurv", _Ccurv,
    // new FunctionT([numberT, numberT, numberT], circleT)
// );

// // TODO: Clean up
// function _Descart(): void {
    // let c3 = pop() as Circle;
    // let c2 = pop() as Circle;
    // let c1 = pop() as Circle;
    // pop();              // The function.
    // let list = new FGList(Circle.descartes(c1, c2, c3), numberT);
    // push(list);
// }
// const Descart = new FGCallNative("Descart", _Descart,
    // new FunctionT(
        // [circleT, circleT, circleT],
        // new ListT(numberT),
    // )
// );

// // TODO: Clean up
// function _ComplexDescart(): void {
    // let curv = pop() as FGNumber;
    // let c3 = pop() as Circle;
    // let c2 = pop() as Circle;
    // let c1 = pop() as Circle;
    // pop();              // The function.
    // let circles = new FGList(Circle.complex_descartes(c1, c2, c3, curv), circleT);
    // push(circles);
// }
// const ComplexDescart = new FGCallNative("ComplexDescart", _ComplexDescart,
    // new FunctionT(
        // [circleT, circleT, circleT, numberT],
        // new ListT(circleT),
    // )
// );

// function _E(): void {
    // let ry = (pop() as FGNumber).value;
    // let rx = (pop() as FGNumber).value;
    // let y  = (pop() as FGNumber).value;
    // let x  = (pop() as FGNumber).value;
    // pop();              // The function.
    // let e = new Ellipse(x, y, rx, ry);
    // push(e);
// }
// let E = new FGCallNative("E", _E,
    // new FunctionT(
        // [numberT, numberT, numberT, numberT],
        // ellipseT,
    // )
// );

// function _rpt(session: Session, ver: number): void {
    // if (ver === 0) {
        // let y = (session.pop() as FGNumber).value;
        // let x = (session.pop() as FGNumber).value;
        // session.pop();              // The function.
        // session.push(new RichPoint(x, y));
    // }
    // else {
        // let p = session.pop() as Point;
        // session.pop();              // The function.
        // session.push(new RichPoint(p.x, p.y));
    // }
// }
// let rpt = new FGCallNative("rpt", _rpt,
    // new OverloadT([
        // new FunctionT([numberT, numberT], richPointT),
        // new FunctionT([pointT], richPointT),
    // ])
// );

// function _coord_hide_grid(session: Session, ver: number): void {
    // let o = session.pop() as Coord;
    // session.pop();              // The function.
    // session.push(o.hide_grid());
// }
// export let coord_hide_grid = new FGCallNative("coord_hide_grid", _coord_hide_grid,
    // new OverloadT([
        // new FunctionT([], coordT),
    // ])
// );
// coordT.methods["pt"] = { type: coord_pt.sig, value: coord_pt };
// coordT.methods["hide_grid"] = { type: coord_hide_grid.sig, value: coord_hide_grid };

// function _R(): void {
    // let h = (session.pop() as FGNumber).value;
    // let w = (session.pop() as FGNumber).value;
    // let y = (session.pop() as FGNumber).value;
    // let x = (session.pop() as FGNumber).value;
    // session.pop();              // The function.
    // let rect = new Rect(x, y, w, h);
    // push(rect);
// }
// let R = new FGCallNative("R", _R,
    // new FunctionT(
        // [numberT, numberT, numberT, numberT],
        // // rectStruct.value,
        // numberT,  // TODO: fix
    // )
// );

// function _R_WithCenter(): void {
    // let h = (session.pop() as FGNumber).value;
    // let w = (session.pop() as FGNumber).value;
    // let y = (session.pop() as FGNumber).value;
    // let x = (session.pop() as FGNumber).value;
    // pop();              // The function.
    // let rect = new Rect(x-w/2, y-h/2, w, h);
    // push(rect);
// }
// let R_WithCenter = new FGCallNative("R_WithCenter", _R_WithCenter,
    // new FunctionT(
        // [numberT, numberT, numberT, numberT],
        // // rectStruct.value,
        // numberT,  // TODO: fix
    // )
// );

// function _R_FromPoints(): void {
    // let q = pop() as Point;
    // let p = pop() as Point;
    // pop();              // The function.
    // let x = Math.min(p.x, q.x);
    // let y = Math.min(p.y, q.y);
    // let w = Math.abs(p.x - q.x);
    // let h = Math.abs(p.y - q.y);
    // let rect = new Rect(x, y, w, h);
    // push(rect);
// }
// let R_FromPoints = new FGCallNative("R_FromPoints", _R_FromPoints,
    // new FunctionT(
        // [pointT, pointT],
        // // rectStruct.value,
        // numberT,  // TODO: fix
    // )
// );

// function _length(session: Session, ver: number): void {
    // if (ver === 0) {
        // let s = session.pop() as Segment;
        // session.pop();              // The function.
        // session.push(new FGNumber(s.length()));
    // }
    // else if (ver === 1) {
        // let s = session.pop() as RichSegment;
        // session.pop();              // The function.
        // session.push(new FGNumber(s.length()));
    // }
// }
// let length = new FGCallNative("length", _length,
    // new OverloadT([
        // new FunctionT([segmentT], numberT),
        // new FunctionT([richSegmentT], numberT),
    // ])
// );

// function _rsegment(session: Session, ver: number): void {
    // if (ver === 0) {
        // let y2 = (session.pop() as FGNumber).value;
        // let x2 = (session.pop() as FGNumber).value;
        // let y1 = (session.pop() as FGNumber).value;
        // let x1 = (session.pop() as FGNumber).value;
        // session.pop();              // The function.
        // let p = new RichPoint(x1, y1);
        // p.label = "P";
        // let q = new RichPoint(x2, y2);
        // q.label = "Q";
        // session.push(new RichSegment(p, q));
    // }
    // else if (ver === 1) {
        // let q = session.pop() as RichPoint;
        // let p = session.pop() as RichPoint;
        // session.pop();              // The function.
        // session.push(new RichSegment(p, q));
    // }
// }
// let rsegment = new FGCallNative("rsegment", _rsegment,
    // new OverloadT([
        // new FunctionT([numberT, numberT, numberT, numberT], richSegmentT),
        // new FunctionT([richPointT, richPointT], richSegmentT),
    // ])
// );

// function _Midpoint(): void {
    // let segment = pop() as Segment;
    // pop();              // The function.
    // let point = segment.midpoint();
    // push(point);
// }
// let Midpoint = new FGCallNative("Midpoint", _Midpoint,
    // new FunctionT([segmentT], pointT)
// );

// export let nativeNames: Names = {
    // // UI objects.
    // "repl":   { type: replT, value: repl },

    // // "Push":   { type: Push.sig, value: Push },
    // // "RGB":    { type: RGB.sig, value: RGB },
    // // "printf": { type: printf.sig, value: printf },
    // // "show":   { type: show.sig, value: show },
    // // "padl":   { type: padl.sig, value: padl },
    // // "Type":   { type: TypeFn.sig, value: TypeFn },
    // label:  { type: label.sig, value: label },
    // // "Fill":   { type: Fill.sig, value: Fill },
    // // "Paint":  { type: Paint.sig, value: Paint },
    // // "Ccurv":   { type: Ccurv.sig, value: Ccurv },
    // // "Descart": { type: Descart.sig, value: Descart },
    // // "ComplexDescart": { type: ComplexDescart.sig, value: ComplexDescart },
    // // "E":      { type: E.sig, value: E },
    // rcircle:   { type: rcircle.sig, value: rcircle },
    // coord:     { type: coord.sig, value: coord },
    // intersect: { type: intersect.sig, value: intersect },
    // // rpt:       { type: rpt.sig, value: rpt },
    // rsegment:  { type: rsegment.sig, value: rsegment },
    // length:    { type: length.sig, value: length },
    // mappic:    { type: mappic.sig, value: mappic },
    // // "R":      { type: R.sig, value: R, methods: {
        // // "FromPoints": { type: R_FromPoints.sig, value: R_FromPoints },
        // // "WithCenter": { type: R_WithCenter.sig, value: R_WithCenter },
    // // }},
    // // "Midpoint": { type: Midpoint.sig, value: Midpoint },
    // // "sqrt": { type: sqrt.sig, value: sqrt },
    // // "abs": { type: abs.sig, value: abs },
// };
