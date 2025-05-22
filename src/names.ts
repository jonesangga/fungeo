// @jonesangga, 12-04-2025, MIT License.
//
// TODO: Clean up this.

import { Kind, type Value } from "./value.js"
import { Print, Printf, Show, Padl, Type, Draw, Paint,
         C, E, P, Pic, R, Seg, Midpoint,
         Cw, Ccw } from "./vmfunction.js"
import canvas from "./ui/canvas.js"
import repl from "./ui/repl.js"
import fish from "./data/fish.js"

export type Info = {
    kind:     Kind,
    value?:   Value,
    listKind?: Kind,
    drawn?:   boolean,
};

export interface Names {
    [name: string]: Info;
}

export let nativeNames: Names = {
    // UI objects.
    "canvas": { kind:  Kind.Canvas, value: canvas },
    "repl":   { kind:  Kind.Repl, value: repl },

    // Build-in fish components from paper "Functional Geometry" by Peter Henderson, 1982.
    "fishp": { kind: Kind.Picture, value: fish.p },
    "fishq": { kind: Kind.Picture, value: fish.q },
    "fishr": { kind: Kind.Picture, value: fish.r },
    "fishs": { kind: Kind.Picture, value: fish.s },

    "Print":  { kind:  Kind.Callable, value: Print },
    "Printf": { kind:  Kind.Callable, value: Printf },
    "Show":   { kind:  Kind.Callable, value: Show },
    "Padl":   { kind:  Kind.Callable, value: Padl },
    "Type":   { kind:  Kind.Callable, value: Type },
    "Draw":   { kind:  Kind.Callable, value: Draw },
    "Paint":  { kind:  Kind.Callable, value: Paint },
    "C":      { kind:  Kind.Callable, value: C },
    "E":      { kind:  Kind.Callable, value: E },
    "P":      { kind:  Kind.Callable, value: P },
    "Pic":    { kind:  Kind.Callable, value: Pic },
    "Cw":     { kind:  Kind.Callable, value: Cw },
    "Ccw":    { kind:  Kind.Callable, value: Ccw },
    "R":      { kind:  Kind.Callable, value: R },
    "Seg":    { kind:  Kind.Callable, value: Seg },
    "Midpoint": { kind:  Kind.Callable, value: Midpoint },

    // // Color names.
    // "WHITE":  { kind: Kind.Color, value: WHITE },
    // "BLACK":  { kind: Kind.Color, value: BLACK },
    // "RED":    { kind: Kind.Color, value: RED },
    // "GREEN":  { kind: Kind.Color, value: GREEN },
    // "BLUE":   { kind: Kind.Color, value: BLUE },
    // "YELLOW": { kind: Kind.Color, value: YELLOW },
    // "PINK":   { kind: Kind.Color, value: PINK },

    // // UI objects.
    // "page": { kind: Kind.Page, value: page },

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
};
