#!/usr/bin/env bun
/**
 * Generates ascii.ts from ascii.source.ts
 *
 * This script converts the human-readable ASCII art (with actual Unicode chars)
 * into a template format that survives Bun's bundler without getting escaped.
 *
 * Run with: bun run generate:ascii
 */

const scriptsDir = import.meta.dirname
const constantsDir = `${scriptsDir}/../src/constants`

// Read the source file
const sourcePath = `${constantsDir}/ascii.source.ts`
const sourceContent = await Bun.file(sourcePath).text()

// Extract the ASCII art from the source
const match = sourceContent.match(/export const ASCII_ART_SOURCE = `([\s\S]*?)`/)
if (!match) {
	console.error('Could not find ASCII_ART_SOURCE in ascii.source.ts')
	process.exit(1)
}

const asciiArt = match[1]

// Convert Unicode characters to placeholders
// █ (U+2588 Full Block) -> #
// ░ (U+2591 Light Shade) -> .
const template = asciiArt.replace(/█/g, '#').replace(/░/g, '.')

// Generate the output file
const output = `/**
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
const TEMPLATE = \`${template}\`

// Replace placeholders with actual Unicode characters at runtime
export const ASCII_ART = TEMPLATE.replace(/#/g, FULL).replace(/\\./g, LIGHT)
`

// Write the generated file
const outputPath = `${constantsDir}/ascii.ts`
await Bun.write(outputPath, output)

console.log('✓ Generated ascii.ts from ascii.source.ts')
