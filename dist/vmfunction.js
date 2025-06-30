import { FGNumber, FGList } from "./value.js";
import canvas from "./ui/canvas.js";
import { RichCircle } from "./geo/circle.js";
import { Coord } from "./geo/coordinate.js";
import { RichPoint } from "./geo/point.js";
import Picture from "./geo/picture.js";
import { RichSegment } from "./geo/segment.js";
import { ListT, UnionT, pictureT, ellipseT, segmentT, richSegmentT, pointT, richPointT, circleT, richCircleT, coordT } from "./literal/type.js";
const geoUnion = new UnionT([ellipseT, pictureT, pointT, richPointT, segmentT, richSegmentT, circleT, richCircleT]);
const geoList = new ListT(geoUnion);
const geoT = new UnionT([ellipseT, coordT, pictureT, pointT, richPointT, segmentT, richSegmentT, circleT, richCircleT, geoList]);
export const richgeoT = new UnionT([richPointT, richSegmentT, richCircleT]);
let on_scrn = [];
let label_on_scrn = [];
function draw_onScreen() {
    canvas.clear();
    for (let obj of on_scrn) {
        obj.draw();
    }
    for (let obj of label_on_scrn) {
        obj.draw_label();
    }
}
function isGeo(v) {
    return [700, 720, 905, 750, 840, 850, 900, 910, 920, 1000].includes(v.kind);
}
function isRichGeo(v) {
    return [905, 910, 920].includes(v.kind);
}
function _draw(session, ver) {
    let v = session.pop();
    session.pop();
    if (v instanceof FGList) {
        for (let i of v.value) {
            if (isGeo(i))
                on_scrn.push(i);
            if (isRichGeo(i))
                label_on_scrn.push(i);
        }
    }
    else {
        if (isGeo(v))
            on_scrn.push(v);
        if (isRichGeo(v))
            label_on_scrn.push(v);
    }
    draw_onScreen();
}
function _label(session, ver) {
    let label = session.pop().value;
    let v = session.pop();
    session.pop();
    v.label = label;
    draw_onScreen();
}
function _intersect(session, ver) {
    let q = session.pop();
    let p = session.pop();
    session.pop();
    let points = p.intersect(q);
    let res = new FGList(points, pointT);
    session.push(res);
}
function _rcircle(session, ver) {
    if (ver === 0) {
        let q = session.pop();
        let p = session.pop();
        session.pop();
        session.push(new RichCircle(p, q));
    }
    else if (ver === 1) {
        let r = session.pop().value;
        let p = session.pop();
        session.pop();
        let q = new RichPoint(p.x + r, p.y);
        session.push(new RichCircle(p, q));
    }
}
function _quartet(session) {
    let s = session.pop();
    let r = session.pop();
    let q = session.pop();
    let p = session.pop();
    session.pop();
    session.push(Picture.quartet(p, q, r, s));
}
function _mappic(session) {
    let target = session.pop();
    let src = session.pop();
    session.pop();
    src.map_to(target);
    draw_onScreen();
}
function _pic(session) {
    let w = session.pop().value;
    let h = session.pop().value;
    session.pop();
    let pic = new Picture(w, h);
    session.push(pic);
}
function _coord(session) {
    let yr = session.pop().value;
    let yl = session.pop().value;
    let xr = session.pop().value;
    let xl = session.pop().value;
    session.pop();
    session.push(new Coord(Math.floor(xl), Math.ceil(xr), Math.floor(yl), Math.ceil(yr)));
}
function _coord_pt(session, ver) {
    if (ver === 0) {
        let o = session.pop();
        let label = session.pop().value;
        let y = session.pop().value;
        let x = session.pop().value;
        session.pop();
        session.push(o.add_pt(x, y, label));
    }
    else if (ver === 1) {
        let o = session.pop();
        let y = session.pop().value;
        let x = session.pop().value;
        session.pop();
        session.push(o.add_pt(x, y));
    }
}
function _coord_hide_grid(session, ver) {
    let o = session.pop();
    session.pop();
    session.push(o.hide_grid());
}
function _length(session, ver) {
    if (ver === 0) {
        let s = session.pop();
        session.pop();
        session.push(new FGNumber(s.length()));
    }
    else if (ver === 1) {
        let s = session.pop();
        session.pop();
        session.push(new FGNumber(s.length()));
    }
}
function _rsegment(session, ver) {
    if (ver === 0) {
        let y2 = session.pop().value;
        let x2 = session.pop().value;
        let y1 = session.pop().value;
        let x1 = session.pop().value;
        session.pop();
        let p = new RichPoint(x1, y1);
        p.label = "P";
        let q = new RichPoint(x2, y2);
        q.label = "Q";
        session.push(new RichSegment(p, q));
    }
    else if (ver === 1) {
        let q = session.pop();
        let p = session.pop();
        session.pop();
        session.push(new RichSegment(p, q));
    }
}
function _clear(session) {
    session.pop();
    canvas.clear();
    on_scrn = [];
    label_on_scrn = [];
}
