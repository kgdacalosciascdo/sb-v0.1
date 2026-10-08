// Isolated UI regression. All purchase requests are mocked: no live financial writes.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { chromium } from 'playwright'

const url = process.env.PURCHASE_TEST_URL || 'http://127.0.0.1:5188'
const output = await mkdtemp(join(tmpdir(), 'simplebiz-purchases-'))
const server = process.env.PURCHASE_TEST_URL
  ? null
  : spawn(
      process.execPath,
      [
        'node_modules/vite/bin/vite.js',
        '--host',
        '127.0.0.1',
        '--port',
        '5188',
        '--strictPort',
      ],
      { windowsHide: true, stdio: 'pipe' },
    )
const browser = await chromium.launch({ headless: true })
const id = (n) => `00000000-0000-4000-a000-${String(n).padStart(12, '0')}`
const supplier = {
  id: id(1),
  name: 'ABC Trading Company',
  code: 'SUP-001',
  terms_days: 30,
}
const company = { id: id(2), name: 'XYZ Enterprise', currency: 'PHP' }
const products = [
  'Printer - LaserJet Pro',
  'Toner Cartridge - Bk',
  'Toner Cartridge - CMY',
  'Bond Paper - A4',
].map((name, i) => ({
  id: id(10 + i),
  name,
  code: ['PRD-1001', 'PRD-2003', 'PRD-2004', 'PRD-3001'][i],
  unit: ['unit', 'pc', 'pc', 'ream'][i],
  cost: ['8500.00', '2500.00', '3000.00', '300.00'][i],
  tax_id: id(20),
  track_inventory: true,
}))
const accounts = [
  {
    id: id(30),
    name: 'BDO Operating Account',
    payment_methods: ['Bank Transfer', 'Cheque'],
  },
  { id: id(31), name: 'Cash in Vault', payment_methods: ['Cash'] },
]
const bootstrap = {
  company,
  suppliers: [supplier],
  products,
  taxes: [{ id: id(20), name: 'VAT', rate_basis_points: 1200 }],
  accounts,
  next_number: '[Auto-generated]',
}
let record = null
let draft = null
let posts = 0
let failNext = true
let retryKey = ''
let retryBody = ''
let overviewGate = null
let bootstrapGate = null
let overviewRateLimits = 0
let overviewHardFail = false
let overviewReads = 0
let overviewStarted = null
const errors = []
const context = await browser.newContext({
  viewport: { width: 1536, height: 980 },
})
await context.addInitScript(() =>
  localStorage.setItem('simplebiz.one.demo-authenticated', 'true'),
)
await context.route('**/api/v1/demo/purchases**', async (route) => {
  const req = route.request()
  const path = new URL(req.url()).pathname
    .split('/purchases')[1]
    .replace(/^\//, '')
  const send = (data, status = 200, meta) =>
    route.fulfill({ status, json: { data, ...(meta ? { meta } : {}) } })
  if (path === 'bootstrap') {
    if (bootstrapGate) await bootstrapGate
    return send(bootstrap)
  }
  if (path === 'suppliers' && req.method() === 'POST') {
    const added = { ...req.postDataJSON(), id: id(3), code: 'SUP-002' }
    bootstrap.suppliers.push(added)
    return send(added, 201)
  }
  if (path === 'overview') {
    overviewReads++
    overviewStarted?.()
    overviewStarted = null
    if (overviewGate) await overviewGate
    if (overviewHardFail)
      return route.fulfill({ status: 503, json: { message: 'Unavailable' } })
    if (overviewRateLimits > 0) {
      overviewRateLimits--
      return route.fulfill({
        status: 429,
        headers: { 'Retry-After': '1' },
        json: { message: 'Too Many Requests' },
      })
    }
    return send({
      today: '2026-10-08',
      purchases_month_cents: record?.total_cents || 0,
      payments_month_cents: record?.paid_cents || 0,
      outstanding_cents: record?.due_cents || 0,
      overdue_cents: 0,
      due_today_count: 0,
      overdue_count: 0,
      due_soon_count: 0,
      draft_count: draft ? 1 : 0,
      pending_check_count: 0,
      suppliers: [{ ...supplier, outstanding_cents: record?.due_cents || 0 }],
      payables: record?.due_cents
        ? [
            {
              id: id(50),
              purchase_id: record.id,
              supplier_id: supplier.id,
              supplier_name: supplier.name,
              purchase_number: record.purchase_number,
              supplier_invoice_number: record.invoice_number,
              due_date: record.due_date,
              outstanding_cents: record.due_cents,
            },
          ]
        : [],
      recent: record
        ? [
            {
              id: record.id,
              date: record.purchase_date,
              number: record.purchase_number,
              supplier: supplier.name,
              amount_cents: record.total_cents,
            },
          ]
        : [],
    })
  }
  if (path === 'stock')
    return send({
      items: record
        ? [
            {
              ...products[0],
              unit_name: 'unit',
              received_quantity: '1',
              cost_cents: 850000,
            },
          ]
        : [],
      recent: [],
    })
  if (path === 'cash')
    return send({
      accounts: accounts.map((a) => ({
        ...a,
        received_cents: 0,
        paid_cents: record?.paid_cents || 0,
        net_cents: -(record?.paid_cents || 0),
      })),
      payments: [],
    })
  if (path === 'drafts' && req.method() === 'POST') {
    draft = { ...req.postDataJSON(), notes: null }
    return send({ id: id(80) })
  }
  if (path === 'drafts')
    return send(
      draft
        ? [
            {
              id: id(80),
              invoice_number: draft.invoice_number,
              date: draft.purchase_date,
              updated_at: '2026-10-08T04:00:00Z',
            },
          ]
        : [],
    )
  if (path.startsWith('drafts/')) return send({ ...draft, draft_id: id(80) })
  if (!path && req.method() === 'POST') {
    posts++
    const body = req.postDataJSON()
    const key = req.headers()['idempotency-key']
    assert.match(key, /^[0-9a-f-]{36}$/)
    if (failNext) {
      failNext = false
      retryKey = key
      retryBody = req.postData()
      return route.abort('failed')
    }
    assert.equal(key, retryKey)
    assert.equal(req.postData(), retryBody)
    assert.equal(body.items.length, 4)
    const gross = [850000, 500000, 300000, 120000]
    const discounts = [0, 25000, 0, 0]
    const lines = body.items.map((l, i) => ({
      ...l,
      ...products[i],
      product_id: l.product_id,
      gross_cents: gross[i],
      discount_cents: discounts[i],
      net_cents: gross[i] - discounts[i],
      tax_cents: Math.round((gross[i] - discounts[i]) * 0.12),
      tax_name: 'VAT',
    }))
    record = {
      ...body,
      id: id(99),
      purchase_number: 'PUR-000001',
      company,
      supplier,
      paid_cents: 1000000,
      due_cents: 954400,
      total_cents: 1954400,
      totals: {
        lines,
        gross_cents: 1770000,
        discount_cents: 25000,
        subtotal_cents: 1745000,
        tax_cents: 209400,
        total_cents: 1954400,
      },
      payment: {
        mode: body.payment_mode,
        method: body.payment_method,
        reference: body.reference,
        account_id: body.cash_account_id,
        pdc: null,
        check_date: null,
      },
      payments: [
        {
          id: id(90),
          method: body.payment_method,
          payment_date: body.purchase_date,
          amount_cents: 1000000,
          reference: body.reference,
        },
      ],
      attachments: [],
      notes: body.notes || '',
      postdated_check: null,
    }
    draft = null
    return send(record, 201)
  }
  if (!path)
    return send(record ? [record] : [], 200, {
      page: 1,
      last_page: 1,
      total: record ? 1 : 0,
    })
  if (path === id(99)) return send(record)
  if (path === `${id(99)}/payments`) {
    const body = req.postDataJSON()
    assert.equal(body.amount, '9544.00')
    record = {
      ...record,
      paid_cents: 1954400,
      due_cents: 0,
      payments: [
        ...record.payments,
        {
          id: id(91),
          method: body.method,
          reference: body.reference,
          payment_date: body.payment_date,
          amount_cents: 954400,
        },
      ],
    }
    return send(record, 201)
  }
  throw new Error(`Unhandled mock route: ${req.method()} ${path}`)
})
try {
  for (let i = 0; i < 100; i++) {
    if (
      await fetch(url)
        .then((r) => r.ok)
        .catch(() => false)
    )
      break
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  const page = await context.newPage()
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(`${url}/purchases/entry`)
  await page.getByLabel('Supplier', { exact: true }).selectOption(supplier.id)
  await page.getByLabel('Purchase date', { exact: true }).fill('2026-10-08')
  await page.getByLabel('Supplier invoice number').fill('123456890')
  for (const product of products) {
    await page.getByRole('button', { name: 'Add Item', exact: true }).click()
    await page
      .getByRole('button', {
        name: new RegExp(product.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
      })
      .click()
  }
  await page.getByLabel('Quantity for PRD-2003').fill('2')
  await page.getByLabel('Discount for PRD-2003').fill('5')
  await page.getByLabel('Quantity for PRD-3001').fill('4')
  await page.getByLabel('Payment reference', { exact: true }).fill('TRX-123')
  assert.match(await page.locator('.purchase-entry').innerText(), /19,544\.00/)
  await page.getByLabel('Purchase payment status').selectOption('partial')
  await page.getByLabel('Purchase amount paid').fill('10000.00')
  assert.match(await page.locator('.purchase-entry').innerText(), /9,544\.00/)
  await page.screenshot({ path: join(output, 'desktop.png'), fullPage: true })
  await page.getByLabel('Purchase payment status').selectOption('later')
  await page.getByRole('button', { name: 'Add PDC', exact: false }).click()
  assert.equal(await page.getByLabel('PDC check date').count(), 1)
  await page.getByLabel('Purchase payment status').selectOption('full')
  await page.getByLabel('Purchase payment method').selectOption('Check')
  assert.equal(
    await page.getByLabel('Date of check').inputValue(),
    '2026-10-08',
  )
  assert.equal(
    await page.getByLabel('Date of check').getAttribute('readonly'),
    '',
  )
  await page.getByLabel('Purchase payment method').selectOption('Cash')
  await page.getByLabel('Paid from account').selectOption(id(31))
  await page.getByLabel('Purchase payment method').selectOption('Bank Transfer')
  await page.getByLabel('Paid from account').selectOption(id(30))
  await page.getByLabel('Payment reference', { exact: true }).fill('TRX-123')
  await page.getByLabel('Purchase payment status').selectOption('partial')
  await page.getByLabel('Purchase amount paid').fill('10000.00')
  await page.getByRole('button', { name: 'Preview', exact: true }).click()
  await page.getByRole('dialog').waitFor()
  assert.match(await page.getByRole('dialog').innerText(), /19,544\.00/)
  assert.equal(posts, 0)
  await page.getByRole('button', { name: 'Close dialog', exact: true }).click()
  await page.getByRole('button', { name: 'Save as Draft', exact: true }).click()
  await page.getByText('Draft saved.', { exact: false }).waitFor()
  await page.reload()
  await page.getByRole('button', { name: 'Load Draft', exact: true }).click()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: /123456890/ })
    .click()
  await page.getByRole('dialog').waitFor({ state: 'hidden' })
  assert.equal(
    await page.getByLabel('Supplier invoice number').inputValue(),
    '123456890',
  )
  await page.setViewportSize({ width: 375, height: 812 })
  await page.waitForTimeout(400)
  await page.screenshot({ path: join(output, 'mobile.png'), fullPage: true })
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    'Mobile purchase page has no horizontal overflow',
  )
  await page
    .getByRole('button', { name: 'Save Transaction', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Retry Save Transaction', exact: true })
    .waitFor()
  await page
    .getByRole('button', { name: 'Retry Save Transaction', exact: true })
    .click()
  await page.getByRole('dialog').waitFor()
  assert.match(await page.getByRole('dialog').innerText(), /PUR-000001/)
  assert.equal(posts, 2)
  await page.getByRole('button', { name: 'Close dialog', exact: true }).click()
  // A delayed fetch must not imply the successfully posted credit balance is zero.
  let releaseOverview
  overviewGate = new Promise((resolve) => {
    releaseOverview = resolve
  })
  const readsBefore = overviewReads
  const started = new Promise(resolve => { overviewStarted = resolve })
  await page.goto(`${url}/purchases/payables`)
  await started
  await page
    .getByRole('status')
    .filter({ hasText: 'Fetching supplier balances' })
    .waitFor()
  assert.equal(
    await page
      .getByText('No outstanding supplier balances.', { exact: true })
      .count(),
    0,
  )
  assert.equal(await page.getByText('0 purchases', { exact: true }).count(), 0)
  assert.equal(
    overviewReads - readsBefore,
    1,
    'StrictMode concurrent overview reads are deduplicated',
  )
  releaseOverview()
  overviewGate = null
  await page
    .getByRole('cell', { name: 'ABC Trading Company', exact: true })
    .first()
    .waitFor()
  assert.match(
    await page.locator('.purchase-register-table').first().innerText(),
    /9,544\.00/,
  )
  // Form-option latency must not hold back the independently loaded balances.
  let releaseBootstrap
  bootstrapGate = new Promise((resolve) => {
    releaseBootstrap = resolve
  })
  await page.reload()
  await page
    .getByRole('cell', { name: 'ABC Trading Company', exact: true })
    .first()
    .waitFor()
  assert.equal(
    await page
      .getByRole('button', { name: 'Pay Supplier', exact: true })
      .isDisabled(),
    true,
  )
  releaseBootstrap()
  bootstrapGate = null
  overviewRateLimits = 1
  await page.reload()
  await page
    .getByRole('status')
    .filter({ hasText: 'Fetching supplier balances' })
    .waitFor()
  assert.equal(
    await page
      .getByText('No outstanding supplier balances.', { exact: true })
      .count(),
    0,
  )
  await page
    .getByRole('cell', { name: 'ABC Trading Company', exact: true })
    .first()
    .waitFor()
  assert.equal(overviewRateLimits, 0)
  overviewHardFail = true
  await page.reload()
  await page.getByRole('alert').filter({ hasText: 'unavailable' }).waitFor()
  assert.equal(
    await page
      .getByText('No outstanding supplier balances.', { exact: true })
      .count(),
    0,
  )
  overviewHardFail = false
  await page
    .getByRole('button', { name: 'Refresh / Retry', exact: true })
    .click()
  await page
    .getByRole('cell', { name: 'ABC Trading Company', exact: true })
    .first()
    .waitFor()
  await page.goto(`${url}/purchases/history`)
  await page
    .getByRole('button', { name: 'Details / Receipt', exact: true })
    .click()
  assert.match(await page.getByRole('dialog').innerText(), /PUR-000001/)
  await page.getByRole('button', { name: 'Close dialog', exact: true }).click()
  await page.getByRole('button', { name: 'Pay Supplier', exact: true }).click()
  await page.getByLabel('Supplier payment reference').fill('SETTLE-123')
  await page
    .getByRole('button', { name: 'Record Payment', exact: true })
    .click()
  await page
    .getByRole('dialog')
    .getByText('PUR-000001', { exact: true })
    .waitFor()
  assert.equal(record.due_cents, 0)
  await page.getByRole('button', { name: 'Close dialog', exact: true }).click()
  await page.setViewportSize({ width: 1536, height: 980 })
  for (const [path, heading] of [
    ['dashboard', 'Purchases & Supplier Balances'],
    ['inventory', 'Stock Received from Purchases'],
    ['cash-accounts', 'Recorded Cash Movements'],
    ['payments', 'Supplier Payments Due'],
    ['purchases/suppliers', 'Suppliers'],
  ]) {
    await page.goto(`${url}/${path}`)
    await page.getByRole('heading', { name: heading, exact: true }).waitFor()
  }
  await page.getByRole('button', { name: 'Add Supplier', exact: false }).click()
  await page
    .getByLabel('Supplier name', { exact: true })
    .fill('Browser Supplier')
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Add Supplier', exact: true })
    .click()
  await page
    .getByRole('cell', { name: 'Browser Supplier', exact: true })
    .waitFor()
  assert.deepEqual(errors, [])
  console.log(
    JSON.stringify({
      result: 'passed',
      checks: [
        'reference totals',
        'full/partial/later',
        'check date/PDC',
        'preview without writes',
        'database draft reload',
        'mobile no overflow',
        'idempotent retry',
        'history receipt',
        'supplier payment',
        'supplier creation',
        'delayed balances show fetching, not empty',
        'balances independent of bootstrap latency',
        'deduplicated reads and rate-limit retry',
        'fetch failure shows error, not empty',
        'cross-system panels',
      ],
      screenshots: output,
    }),
  )
} finally {
  await browser.close()
  server?.kill()
}
