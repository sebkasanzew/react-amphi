#!/usr/bin/env bun
import React from 'react'
import { render } from 'ink'
import App from './app.js'

// Clear screen on startup
process.stdout.write('\u{1B}[2J\u{1B}[3J\u{1B}[H')

render(<App />)
