import { profile } from '../src/data/profile'
import { projects } from '../src/data/projects'

type Target = { source: string; href: string }

/**
 * 'ok'      — 2xx response, link is healthy.
 * 'blocked' — host returned the non-standard 999 status. LinkedIn (and some
 *             other sites) use this to reject any request that doesn't look
 *             like a real browser. It is not a broken link, so it must not
 *             count toward the failure exit code — but it also isn't a
 *             verified-healthy link, so it isn't reported as 'ok' either.
 * 'fail'    — genuinely unreachable (bad status code, network error, timeout).
 */
type Outcome = 'ok' | 'blocked' | 'fail'

type CheckResult = { target: Target; outcome: Outcome; detail: string }

const BOT_BLOCK_STATUS = 999

function collect(): Target[] {
  const targets: Target[] = []

  for (const project of projects) {
    for (const link of project.links) {
      targets.push({ source: `${project.id} → ${link.label}`, href: link.href })
    }
  }

  for (const social of profile.socials) {
    targets.push({ source: `profile → ${social.label}`, href: social.href })
  }

  return targets
}

async function check(target: Target): Promise<CheckResult> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15_000)

  try {
    // Some hosts reject HEAD; fall back to GET before judging a link dead.
    let response = await fetch(target.href, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
    })

    if (response.status === 405 || response.status === 403 || response.status === 404) {
      response = await fetch(target.href, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
      })
    }

    // Generic on the status code, not on any particular host: any server
    // that answers with 999 is doing a bot-block, not reporting a dead link.
    if (response.status === BOT_BLOCK_STATUS) {
      return {
        target,
        outcome: 'blocked',
        detail: `${response.status} bot-block (treated as skipped, not a failure)`,
      }
    }

    return { target, outcome: response.ok ? 'ok' : 'fail', detail: String(response.status) }
  } catch (error) {
    return { target, outcome: 'fail', detail: error instanceof Error ? error.message : 'unknown error' }
  } finally {
    clearTimeout(timer)
  }
}

const results = await Promise.all(collect().map(check))
const failures = results.filter((result) => result.outcome === 'fail')
const blocked = results.filter((result) => result.outcome === 'blocked')
const ok = results.filter((result) => result.outcome === 'ok')

const marks: Record<Outcome, string> = {
  ok: 'ok  ',
  blocked: 'SKIP',
  fail: 'FAIL',
}

for (const result of results) {
  console.log(`${marks[result.outcome]} ${result.detail.padEnd(45)} ${result.target.source} — ${result.target.href}`)
}

if (failures.length > 0) {
  console.error(`\n${failures.length} link(s) unreachable.`)
  process.exit(1)
}

console.log(
  `\n${ok.length} ok, ${blocked.length} skipped (bot-block), 0 failed — ${results.length} link(s) checked.`,
)
