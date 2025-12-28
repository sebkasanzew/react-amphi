#!/usr/bin/env bun
import React from 'react'
import { render } from 'ink'
import App from './app.js'

// Clear screen on startup
process.stdout.write('\u001B[2J\u001B[3J\u001B[H')

render(<App />)
