/**
 * AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
 *
 * This file is generated from ascii.source.ts by running:
 *   bun run generate:ascii
 *
 * Edit ascii.source.ts to modify the ASCII art, then regenerate this file.
 */

// Unicode block characters created at runtime to survive Bun bundling
const FULL = String.fromCodePoint(0x25_88) // █ Full Block
const LIGHT = String.fromCodePoint(0x25_91) // ░ Light Shade

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
export const ASCII_ART = TEMPLATE.replaceAll('#', FULL).replaceAll('.', LIGHT)
