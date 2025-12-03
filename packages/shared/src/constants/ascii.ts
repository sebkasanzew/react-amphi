/**
 * AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
 *
 * This file is generated from ascii.source.ts by running:
 *   bun run generate:ascii
 *
 * Edit ascii.source.ts to modify the ASCII art, then regenerate this file.
 */

// Unicode block characters created at runtime to survive Bun bundling
const FULL = String.fromCodePoint(0x2588) // █ Full Block
const LIGHT = String.fromCodePoint(0x2591) // ░ Light Shade

// Template with placeholders: # = Full Block, . = Light Shade
const TEMPLATE = `
   #########   ######   ###### ###########  #####   ##### #####
  ###.....### ..###### ###### ..###.....###..###   ..### ..###
 .###    .###  .###.#####.###  .###    .### .###    .###  .###
 .###########  .###..### .###  .##########  .###########  .###
 .###.....###  .### ...  .###  .###......   .###.....###  .###
 .###    .###  .###      .###  .###         .###    .###  .###
 #####   ##### #####     ##### #####        #####   ##### #####
.....   ..... .....     ..... .....        .....   ..... .....
`

// Replace placeholders with actual Unicode characters at runtime
export const ASCII_ART = TEMPLATE.replace(/#/g, FULL).replace(/\./g, LIGHT)
