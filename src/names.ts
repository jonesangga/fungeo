// @jonesangga, 12-04-2025, MIT License.
//
// TODO: Clean up this.

import { Kind, type Value } from "./value.js"
import { Print, Printf, Show, Padl, Type, Draw, Paint,
         C, E, P, Pic, R, Seg, Midpoint,
         Cw, Ccw, FlipH, FlipV, Beside, Above, Quartet, Cycle,
         MapPic, Help, Clear,
         Ccurv } from "./vmfunction.js"
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

    "Help":   { kind:  Kind.CallNative, value: Help },
    "Print":  { kind:  Kind.CallNative, value: Print },
    "Printf": { kind:  Kind.CallNative, value: Printf },
    "Show":   { kind:  Kind.CallNative, value: Show },
    "Padl":   { kind:  Kind.CallNative, value: Padl },
    "Type":   { kind:  Kind.CallNative, value: Type },
    "Draw":   { kind:  Kind.CallNative, value: Draw },
    "Clear":  { kind:  Kind.CallNative, value: Clear },
    "Paint":  { kind:  Kind.CallNative, value: Paint },
    "C":      { kind:  Kind.CallNative, value: C },
    "Ccurv":  { kind:  Kind.CallNative, value: Ccurv },
    "E":      { kind:  Kind.CallNative, value: E },
    "P":      { kind:  Kind.CallNative, value: P },
    "Pic":    { kind:  Kind.CallNative, value: Pic },
    "Cw":     { kind:  Kind.CallNative, value: Cw },
    "Ccw":    { kind:  Kind.CallNative, value: Ccw },
    "FlipH":  { kind:  Kind.CallNative, value: FlipH },
    "FlipV":  { kind:  Kind.CallNative, value: FlipV },
    "Above":  { kind:  Kind.CallNative, value: Above },
    "Beside": { kind:  Kind.CallNative, value: Beside },
    "Quartet": { kind:  Kind.CallNative, value: Quartet },
    "Cycle":  { kind:  Kind.CallNative, value: Cycle },
    "MapPic": { kind:  Kind.CallNative, value: MapPic },
    "R":      { kind:  Kind.CallNative, value: R },
    "Seg":    { kind:  Kind.CallNative, value: Seg },
    "Midpoint": { kind:  Kind.CallNative, value: Midpoint },

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
