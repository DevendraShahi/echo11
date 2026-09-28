#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const ROOT = process.cwd()
const OPENAPI_FILE = path.join(ROOT, 'docs/architecture/openapi-v1.yaml')
const API_ROOT = path.join(ROOT, 'src/app/api/v1')
const MUTATION_METHODS = new Set(['post', 'put', 'patch', 'delete'])

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8')
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walk(fullPath))
      continue
    }
    files.push(fullPath)
  }
  return files
}

function normalizePathFromRouteFile(filePath) {
  const rel = path.relative(API_ROOT, filePath).replaceAll(path.sep, '/')
  const trimmed = rel.replace(/\/route\.ts$/, '')
  const withBraces = trimmed.replace(/\[([^\]]+)\]/g, '{$1}')
  return `/${withBraces}`.replace(/\/+/g, '/')
}

function parseRouteMethods(fileContent) {
  const methods = new Set()
  const methodRegex = /export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\b/g
  let match = methodRegex.exec(fileContent)
  while (match) {
    methods.add(match[1].toLowerCase())
    match = methodRegex.exec(fileContent)
  }
  return methods
}

function parseOpenApiPaths(yaml) {
  const lines = yaml.split(/\r?\n/)
  const paths = new Map()
  let inPaths = false
  let currentPath = null
  let currentMethod = null

  for (const rawLine of lines) {
    const line = rawLine.replace(/\t/g, '    ')

    if (!inPaths) {
      if (/^paths:\s*$/.test(line)) {
        inPaths = true
      }
      continue
    }

    if (/^[A-Za-z_]/.test(line)) {
      break
    }

    const pathMatch = line.match(/^  (\/[^:]+):\s*$/)
    if (pathMatch) {
      currentPath = pathMatch[1]
      currentMethod = null
      if (!paths.has(currentPath)) paths.set(currentPath, new Map())
      continue
    }

    const methodMatch = line.match(/^    (get|post|put|patch|delete):\s*$/)
    if (methodMatch && currentPath) {
      currentMethod = methodMatch[1]
      paths.get(currentPath).set(currentMethod, {
        hasIdempotencyHeader: false,
        hasOutboxSecretHeader: false,
      })
      continue
    }

    if (currentPath && currentMethod) {
      if (line.includes('name: idempotency-key')) {
        paths.get(currentPath).get(currentMethod).hasIdempotencyHeader = true
      }
      if (line.includes('name: x-outbox-dispatch-secret')) {
        paths.get(currentPath).get(currentMethod).hasOutboxSecretHeader = true
      }
    }
  }

  return paths
}

function formatPair(pathname, method) {
  return `${method.toUpperCase()} ${pathname}`
}

function collectRouteContracts() {
  const routeFiles = walk(API_ROOT).filter((file) => file.endsWith('/route.ts'))
  const result = new Map()

  for (const file of routeFiles) {
    const routePath = normalizePathFromRouteFile(file)
    const methods = parseRouteMethods(readFile(file))
    if (!result.has(routePath)) result.set(routePath, new Set())
    for (const method of methods) {
      result.get(routePath).add(method)
    }
  }

  return result
}

function main() {
  if (!fs.existsSync(OPENAPI_FILE)) {
    console.error(`Missing OpenAPI file: ${OPENAPI_FILE}`)
    process.exit(1)
  }

  if (!fs.existsSync(API_ROOT)) {
    console.error(`Missing API root: ${API_ROOT}`)
    process.exit(1)
  }

  const openApiContracts = parseOpenApiPaths(readFile(OPENAPI_FILE))
  const routeContracts = collectRouteContracts()

  const errors = []
  const warnings = []

  for (const [docPath, docMethods] of openApiContracts.entries()) {
    const routeMethods = routeContracts.get(docPath)
    if (!routeMethods) {
      errors.push(`Documented path has no route file: ${docPath}`)
      continue
    }

    for (const [method, meta] of docMethods.entries()) {
      if (!routeMethods.has(method)) {
        errors.push(`Documented method missing in route: ${formatPair(docPath, method)}`)
      }

      if (MUTATION_METHODS.has(method) && !docPath.startsWith('/internal/')) {
        if (!meta.hasIdempotencyHeader) {
          warnings.push(`Mutation missing idempotency header doc: ${formatPair(docPath, method)}`)
        }
      }

      if (docPath.startsWith('/internal/outbox/') && !meta.hasOutboxSecretHeader) {
        warnings.push(`Internal outbox route missing secret header doc: ${formatPair(docPath, method)}`)
      }
    }
  }

  for (const [routePath, routeMethods] of routeContracts.entries()) {
    const docMethods = openApiContracts.get(routePath)
    if (!docMethods) {
      for (const method of routeMethods) {
        errors.push(`Undocumented route method: ${formatPair(routePath, method)}`)
      }
      continue
    }

    for (const method of routeMethods) {
      if (!docMethods.has(method)) {
        errors.push(`Implemented method missing in OpenAPI: ${formatPair(routePath, method)}`)
      }
    }
  }

  if (errors.length > 0) {
    console.error('OpenAPI v1 contract check failed.')
    for (const err of errors) {
      console.error(`- ${err}`)
    }
    if (warnings.length > 0) {
      console.error('Warnings:')
      for (const warning of warnings) {
        console.error(`- ${warning}`)
      }
    }
    process.exit(1)
  }

  console.log(`OpenAPI v1 contract check passed (${openApiContracts.size} documented paths).`)
  if (warnings.length > 0) {
    console.log(`Warnings (${warnings.length}):`)
    for (const warning of warnings) {
      console.log(`- ${warning}`)
    }
  }
}

main()
