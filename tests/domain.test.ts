import assert from 'node:assert/strict'
import { test } from 'node:test'
import { hasPermission } from '../src/lib/domain'
import { parseCsv, toCsv } from '../src/lib/csv'

test('read-only permissions cannot mutate or export', () => { assert.equal(hasPermission('read_only', 'read'), true); assert.equal(hasPermission('read_only', 'write'), false); assert.equal(hasPermission('read_only', 'export'), false) })
test('CSV round trips quoted content', () => { const csv = toCsv([{ name: 'Acme, Inc.', notes: 'A "great" partner' }]); assert.deepEqual(parseCsv(csv), [['name', 'notes'], ['Acme, Inc.', 'A "great" partner']]) })
