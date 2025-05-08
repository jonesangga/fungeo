// @jonesangga, 12-04-2025, MIT License.
//
// TODO: Clean up this.

import { Kind, type Value } from "./value.js"
import { Print, Type } from "./vmfunction.js"

export interface Types {
    kind:     Kind;
    value?:   Value;
    listKind?: Kind;
    drawn?:   boolean;
}

interface Names {
    [name: string]: Types;
}

export let userNames: Names = {};

export let nativeNames: Names = {

    "Print": { kind:  Kind.Callable, value: Print },
    "Type": { kind:  Kind.Callable, value: Type },

    // // Build-in fish components from paper "Functional Geometry" by Peter Henderson, 1982.
    // "fishp": { kind: Kind.Pic, value: fishp, drawn: true },
    // "fishq": { kind: Kind.Pic, value: fishq, drawn: true },
    // "fishr": { kind: Kind.Pic, value: fishr, drawn: true },
    // "fishs": { kind: Kind.Pic, value: fishs, drawn: true },

    // // Color names.
    // "WHITE":  { kind: Kind.Color, value: WHITE },
    // "BLACK":  { kind: Kind.Color, value: BLACK },
    // "RED":    { kind: Kind.Color, value: RED },
    // "GREEN":  { kind: Kind.Color, value: GREEN },
    // "BLUE":   { kind: Kind.Color, value: BLUE },
    // "YELLOW": { kind: Kind.Color, value: YELLOW },
    // "PINK":   { kind: Kind.Color, value: PINK },

    // // UI objects.
    // "canvas": { kind: Kind.Canvas, value: canvas },
    // "page": { kind: Kind.Page, value: page },
    // "repl": { kind: Kind.Repl, value: repl },

    // "cw": {
        // kind:    Kind.Callable,
        // call:    cw,
        // version: [
            // {
                // input:  [Kind.Pic],
                // output: Kind.Pic,
            // },
        // ],
    // },
    // "ccw": {
        // kind:    Kind.Callable,
        // call:    ccw,
        // version: [
            // {
                // input:  [Kind.Pic],
                // output: Kind.Pic,
            // },
        // ],
    // },
    // "flipV": {
        // kind:    Kind.Callable,
        // call:    flipV,
        // version: [
            // {
                // input:  [Kind.Pic],
                // output: Kind.Pic,
            // },
        // ],
    // },
    // "flipH": {
        // kind:    Kind.Callable,
        // call:    flipH,
        // version: [
            // {
                // input:  [Kind.Pic],
                // output: Kind.Pic,
            // },
        // ],
    // },
    // "beside": {
        // kind:    Kind.Callable,
        // call:    beside,
        // version: [
            // {
                // input:  [Kind.Pic, Kind.Pic],
                // output: Kind.Pic,
            // },
            // {
                // input:  [Kind.Number, Kind.Number, Kind.Pic, Kind.Pic],
                // output: Kind.Pic,
            // },
        // ],
    // },
    // "above": {
        // kind:    Kind.Callable,
        // call:    above,
        // version: [
            // {
                // input:  [Kind.Pic, Kind.Pic],
                // output: Kind.Pic,
            // },
            // {
                // input:  [Kind.Number, Kind.Number, Kind.Pic, Kind.Pic],
                // output: Kind.Pic,
            // },
        // ],
    // },
    // "quartet": {
        // kind:    Kind.Callable,
        // call:    quartet,
        // version: [
            // {
                // input:  [Kind.Pic, Kind.Pic, Kind.Pic, Kind.Pic],
                // output: Kind.Pic,
            // },
        // ],
    // },
    // "cycle": {
        // kind:    Kind.Callable,
        // call:    cycle,
        // version: [
            // {
                // input:  [Kind.Pic],
                // output: Kind.Pic,
            // },
        // ],
    // },
    // "paint": {
        // kind:    Kind.Callable,
        // call:    paint,
        // version: [
            // {
                // input:  [Kind.Pic, geoKindSet],
                // output: Kind.Nothing,
            // },
            // {
                // input:  [Kind.Pic, Kind.List],
                // output: Kind.Nothing,
            // },
        // ],
    // },
    // "draw": {
        // kind:    Kind.Callable,
        // call:    draw,
        // version: [
            // {
                // input:  [geoKindSet],
                // output: Kind.Nothing,
            // },
        // ],
    // },
    // "bind": {
        // kind:    Kind.Callable,
        // call:    bind_,
        // version: [
            // {
                // input:  [bindableSet],
                // output: Kind.Nothing,
            // },
        // ],
    // },
    // "resize": {
        // kind:    Kind.Callable,
        // call:    resize,
        // version: [
            // {
                // input:  [rectangularSet, Kind.Number, Kind.Number],
                // output: Kind.Nothing,
            // },
        // ],
    // },
    // "map": {
        // kind:    Kind.Callable,
        // call:    map,
        // version: [
            // {
                // input:  [rectangularSet, rectangularSet],
                // output: Kind.Nothing,
            // },
        // ],
    // },
    // "place": {
        // kind:    Kind.Callable,
        // call:    place,
        // version: [
            // {
                // input:  [placeableSet, Kind.Number, Kind.Number],
                // output: Kind.Nothing,
            // },
        // ],
    // },
    // "fill": {
        // kind:    Kind.Callable,
        // call:    fill,
        // version: [
            // {
                // input:  [fillableSet, Kind.Color],
                // output: Kind.Nothing,
            // },
            // {
                // input:  [fillableSet, Kind.String],
                // output: Kind.Nothing,
            // },
        // ],
    // },
    // "Rgba": {
        // kind:    Kind.Callable,
        // call:    Rgba,
        // version: [
            // {
                // input:  [Kind.Number, Kind.Number, Kind.Number, Kind.Number],
                // output: Kind.Color,
            // },
        // ],
    // },
    // "Rgb": {
        // kind:    Kind.Callable,
        // call:    Rgb,
        // version: [
            // {
                // input:  [Kind.Number, Kind.Number, Kind.Number],
                // output: Kind.Color,
            // },
        // ],
    // },
    // "Gray": {
        // kind:    Kind.Callable,
        // call:    Gray,
        // version: [
            // {
                // input:  [Kind.Number],
                // output: Kind.Color,
            // },
        // ],
    // },
    // "Hex": {
        // kind:    Kind.Callable,
        // call:    Hex,
        // version: [
            // {
                // input:  [Kind.String],
                // output: Kind.Color,
            // },
        // ],
    // },
    // "Pic": {
        // kind:    Kind.Callable,
        // call:    Picture,
        // version: [
            // {
                // input:  [Kind.Number, Kind.Number],
                // output: Kind.Pic,
            // },
        // ],
    // },
    // "Midpoint": {
        // kind:    Kind.Callable,
        // call:    Midpoint,
        // version: [
            // {
                // input:  [Kind.Segment],
                // output: Kind.Point,
            // },
        // ],
    // },
    // "P": {
        // kind:    Kind.Callable,
        // call:    P,
        // version: [
            // {
                // input:  [Kind.Number, Kind.Number],
                // output: Kind.Point,
            // },
        // ],
    // },
    // "Seg": {
        // kind:    Kind.Callable,
        // call:    Seg,
        // version: [
            // {
                // input:  [Kind.Number, Kind.Number, Kind.Number, Kind.Number],
                // output: Kind.Segment,
            // },
            // {
                // input:  [Kind.Point, Kind.Point],
                // output: Kind.Segment,
            // },
        // ],
    // },
    // "Tri": {
        // kind:    Kind.Callable,
        // call:    Tri,
        // version: [
            // {
                // input:  [Kind.Number, Kind.Number, Kind.Number, Kind.Number, Kind.Number, Kind.Number],
                // output: Kind.Triangle,
            // },
            // {
                // input:  [Kind.Point, Kind.Point, Kind.Point],
                // output: Kind.Triangle,
            // },
        // ],
    // },
    // "L": {
        // kind:    Kind.Callable,
        // call:    L,
        // version: [
            // {
                // input:  [Kind.Number, Kind.Number, Kind.Number, Kind.Number],
                // output: Kind.Line,
            // },
            // {
                // input:  [Kind.Point, Kind.Point],
                // output: Kind.Line,
            // },
            // {
                // input:  [Kind.Segment],
                // output: Kind.Line,
            // },
        // ],
    // },
    // "Length": {
        // kind:    Kind.Callable,
        // call:    Length,
        // version: [
            // {
                // input:  [Kind.List],
                // output: Kind.Number,
            // },
        // ],
    // },
    // "Intersect": {
        // kind:    Kind.Callable,
        // call:    Intersect,
        // version: [
            // {
                // input:  [Kind.Line, Kind.Circle],
                // output: Kind.List,
            // },
        // ],
    // },
    // "C": {
        // kind:    Kind.Callable,
        // call:    C,
        // version: [
            // {
                // input:  [Kind.Number, Kind.Number, Kind.Number],
                // output: Kind.Circle,
            // },
            // {
                // input:  [Kind.Point, Kind.Point],
                // output: Kind.Circle,
            // },
        // ],
    // },
    // "E": {
        // kind:    Kind.Callable,
        // call:    E,
        // version: [
            // {
                // input:  [Kind.Number, Kind.Number, Kind.Number, Kind.Number],
                // output: Kind.Ellipse,
            // },
            // {
                // input:  [Kind.Point, Kind.Point, Kind.Point],
                // output: Kind.Ellipse,
            // },
        // ],
    // },
    // "R": {
        // kind:    Kind.Callable,
        // call:    R,
        // version: [
            // {
                // input:  [Kind.Number, Kind.Number, Kind.Number, Kind.Number],
                // output: Kind.Rect,
            // },
            // {
                // input:  [Kind.Point, Kind.Point],
                // output: Kind.Rect,
            // },
        // ],
    // },
};
