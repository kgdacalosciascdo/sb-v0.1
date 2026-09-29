// Isolated browser regression: every collection API request is intercepted.
// This test never creates receipts in Supabase.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { chromium } from 'playwright'

const url = process.env.RECEIVE_PAYMENT_TEST_URL || 'http://127.0.0.1:5187'
const output = await mkdtemp(join(tmpdir(), 'simplebiz-receive-payment-'))
const server = process.env.RECEIVE_PAYMENT_TEST_URL
  ? null
  : spawn(
      process.execPath,
      [
        'node_modules/vite/bin/vite.js',
        '--host',
        '127.0.0.1',
        '--port',
        '5187',
        '--strictPort',
      ],
      { windowsHide: true, stdio: 'pipe' },
    )
const browser = await chromium.launch({ headless: true })
const customer = {
  key: 'sale:cust-1',
  name: 'ABC Trading Company',
  code: 'CUST-000123',
  terms: 'Net 30',
  address: '',
  phone: '',
}
const account = {
  id: '00000000-0000-4000-a000-000000000001',
  name: 'BDO Checking',
  payment_methods: ['Bank Transfer'],
}
const company = { name: 'XYZ Enterprise', currency: 'PHP' }
const amounts = [1000000, 800000, 1200000, 745000]
let items = amounts.map((amount, index) => ({
  id: `00000000-0000-4000-a000-00000000000${index + 2}`,
  customer_key: customer.key,
  document_number: ['INV-00124', 'INV-00131', 'INV-00142', 'INV-00147'][index],
  date: ['Aug 15, 2026', 'Aug 28, 2026', 'Sep 01, 2026', 'Sep 05, 2026'][index],
  due_date: ['Sep 05, 2026', 'Sep 10, 2026', 'Sep 25, 2026', 'Oct 05, 2026'][
    index
  ],
  total_cents: amount,
  balance_cents: amount,
}))
let posted = null
let draft = null
let postCount = 0
let lastKey = ''
let failNextPost = false
const context = await browser.newContext({
  viewport: { width: 1536, height: 980 },
})
await context.addInitScript(() =>
  localStorage.setItem('simplebiz.one.demo-authenticated', 'true'),
)
await context.route('**/api/v1/demo/collections/**', async (route) => {
  const request = route.request()
  const path = new URL(request.url()).pathname.split('/collections/')[1]
  const send = (data, status = 200, extra = {}) =>
    route.fulfill({ status, json: { data, ...extra } })
  if (path === 'bootstrap')
    return send({
      company,
      customers: [customer],
      open_items: items,
      accounts: [account],
      payment_methods: ['Bank Transfer', 'Cash'],
    })
  if (path === 'drafts' && request.method() === 'POST') {
    draft = request.postDataJSON()
    return send({ id: '00000000-0000-4000-a000-000000000099' })
  }
  if (path === 'drafts')
    return send(
      draft
        ? [
            {
              id: '00000000-0000-4000-a000-000000000099',
              ...draft,
              updated_at: '2026-09-29T04:00:00Z',
            },
          ]
        : [],
    )
  if (path.startsWith('drafts/'))
    return send({ ...draft, draft_id: '00000000-0000-4000-a000-000000000099' })
  if (path === 'receipts' && request.method() === 'POST') {
    postCount++
    const key = request.headers()['idempotency-key']
    assert.match(key, /^[0-9a-f-]{36}$/)
    if (failNextPost) {
      failNextPost = false
      lastKey = key
      return route.abort('failed')
    }
    if (lastKey)
      assert.equal(
        key,
        lastKey,
        'Network retry must retain its idempotency key',
      )
    const payload = request.postDataJSON()
    const applications = payload.applications.map((a) => {
      const i = items.find((i) => i.id === a.sale_id)
      return {
        ...i,
        amount_cents: Math.round(Number(a.amount) * 100),
        remaining_cents: i.balance_cents - Math.round(Number(a.amount) * 100),
      }
    })
    posted = {
      id: '00000000-0000-4000-a000-000000000088',
      receipt_number: 'PR-000001',
      receipt_date: payload.receipt_date,
      amount_cents: Math.round(Number(payload.amount) * 100),
      applied_cents: applications.reduce((s, a) => s + a.amount_cents, 0),
      unapplied_cents: 0,
      company,
      customer,
      tenders: payload.tenders.map((t) => ({
        ...t,
        account_name: account.name,
        amount_cents: Math.round(Number(t.amount) * 100),
      })),
      applications,
      remarks: payload.remarks,
      attachments: [],
    }
    items = items
      .map((i) => ({
        ...i,
        balance_cents:
          applications.find((a) => a.id === i.id)?.remaining_cents ??
          i.balance_cents,
      }))
      .filter((i) => i.balance_cents > 0)
    return send(posted, 201)
  }
  if (path === 'receipts')
    return send(
      posted ? [{ ...posted, customer_name: customer.name }] : [],
      200,
      { meta: { total: posted ? 1 : 0, last_page: 1 } },
    )
  if (path.startsWith('receipts/')) return send(posted)
  throw new Error(
    `Unexpected collection API request: ${request.method()} ${path}`,
  )
})
const page = await context.newPage()
const pageErrors = []
page.on('pageerror', (e) => pageErrors.push(e.message))
try {
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      const response = await fetch(url)
      if (response.ok) break
    } catch {
      /* Vite is starting. */
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  await page.goto(`${url}/collections/receive-payment`)
  await page
    .getByRole('button', { name: 'Collapse sidebar', exact: true })
    .click()
  await page.getByLabel('Amount received', { exact: true }).fill('25000.00')
  await page
    .getByLabel('Reference number 1', { exact: true })
    .fill('TRX-829104')
  await page.getByRole('button', { name: 'Auto Apply', exact: true }).click()
  assert.equal(
    await page
      .getByLabel('Apply amount for INV-00124', { exact: true })
      .inputValue(),
    '10000.00',
  )
  assert.equal(
    await page
      .getByLabel('Apply amount for INV-00131', { exact: true })
      .inputValue(),
    '8000.00',
  )
  assert.equal(
    await page
      .getByLabel('Apply amount for INV-00142', { exact: true })
      .inputValue(),
    '7000.00',
  )
  await page.screenshot({ path: join(output, 'desktop.png'), fullPage: true })
  await page
    .getByRole('button', { name: 'Preview Receipt', exact: true })
    .click()
  await page.getByRole('dialog').waitFor()
  assert.match(
    await page.getByRole('dialog').innerText(),
    /PREVIEW — NOT POSTED/,
  )
  assert.equal(postCount, 0)
  await page.getByRole('button', { name: 'Close dialog', exact: true }).click()
  await page.getByRole('button', { name: 'Save as Draft', exact: true }).click()
  await page.getByRole('status').filter({ hasText: 'Draft saved' }).waitFor()
  await page.reload()
  await page.getByRole('button', { name: 'Load Draft', exact: true }).click()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: /ABC Trading Company/ })
    .click()
  assert.equal(
    await page.getByLabel('Amount received', { exact: true }).inputValue(),
    '25000.00',
  )
  await page.setViewportSize({ width: 375, height: 812 })
  await page.waitForTimeout(400)
  await page.screenshot({ path: join(output, 'mobile.png'), fullPage: true })
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
    true,
    'Mobile page must not overflow horizontally',
  )
  await page
    .getByRole('button', { name: 'Preview Receipt', exact: true })
    .click()
  await page.screenshot({
    path: join(output, 'receipt-mobile.png'),
    fullPage: true,
  })
  await page.getByRole('button', { name: 'Close dialog', exact: true }).click()
  failNextPost = true
  await page
    .getByRole('button', { name: 'Post & Issue Receipt', exact: true })
    .click()
  await page.getByRole('alert').waitFor()
  await page
    .getByRole('button', { name: 'Post & Issue Receipt', exact: true })
    .click()
  await page.getByRole('dialog').waitFor()
  assert.match(await page.getByRole('dialog').innerText(), /PR-000001/)
  assert.equal(postCount, 2, 'One aborted request and one successful retry')
  await page.getByRole('button', { name: 'Close dialog', exact: true }).click()
  await page
    .getByRole('button', { name: 'View Receipt History', exact: false })
    .click()
  await page
    .getByRole('button', { name: 'View Receipt / Details', exact: true })
    .click()
  await page.getByRole('dialog').waitFor()
  assert.match(await page.getByRole('dialog').innerText(), /PR-000001/)
  assert.deepEqual(pageErrors, [])
  console.log(
    JSON.stringify({
      result: 'passed',
      checks: [
        'desktop reference layout',
        'auto allocation',
        'preview has no writes',
        'draft reload',
        'mobile no overflow',
        'retry idempotency',
        'posting receipt',
        'history receipt',
      ],
      screenshots: output,
    }),
  )
} finally {
  await browser.close()
  server?.kill()
}
