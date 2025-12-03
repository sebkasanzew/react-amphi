// Unicode block characters created at runtime to survive Bun bundling
const FULL = String.fromCodePoint(0x2588) // █ Full Block
const LIGHT = String.fromCodePoint(0x2591) // ░ Light Shade

// Visual template using placeholder characters
// # = Full Block (█), . = Light Shade (░), space = space
// This keeps the art readable and maintainable
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

// Replace placeholders with actual Unicode characters
export const ASCII_ART = TEMPLATE.replace(/#/g, FULL).replace(/\./g, LIGHT)
