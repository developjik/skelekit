/**
 * src/data/index.ts — data loader and utilities for OppBoard.
 *
 * loadOpportunities() — validates and returns all well-formed entries sorted by deadline.
 * dday(deadline, now?) — KST-aware D-day integer (0 = today, negative = past).
 */
import rawData from './opportunities.json';

// ── Types ─────────────────────────────────────────────────────────────────

export type OppType = 'hackathon' | 'contest' | 'job';

export interface Opportunity {
  id: string;
  title: string;
  host: string;
  type: OppType;
  url: string;
  prize: string;
  deadline: string; // ISO 8601 date string (YYYY-MM-DD or full ISO)
  regions: string[];
}

export interface OpportunitiesData {
  updatedAt: string;
  items: unknown[];
}

// ── Validation ────────────────────────────────────────────────────────────

const VALID_TYPES: ReadonlySet<string> = new Set(['hackathon', 'contest', 'job']);

function isValidOpportunity(row: unknown): row is Opportunity {
  if (typeof row !== 'object' || row === null) return false;
  const r = row as Record<string, unknown>;

  return (
    typeof r['id'] === 'string' && r['id'].length > 0 &&
    typeof r['title'] === 'string' && r['title'].length > 0 &&
    typeof r['host'] === 'string' && r['host'].length > 0 &&
    typeof r['type'] === 'string' && VALID_TYPES.has(r['type']) &&
    typeof r['url'] === 'string' && r['url'].startsWith('https://') &&
    typeof r['prize'] === 'string' &&
    typeof r['deadline'] === 'string' && r['deadline'].length >= 10 &&
    !isNaN(Date.parse(r['deadline'] as string)) &&
    Array.isArray(r['regions'])
  );
}

// ── Loader ────────────────────────────────────────────────────────────────

/**
 * Returns all valid Opportunity entries sorted by deadline ascending.
 * Malformed rows are silently dropped (validated at module load, not runtime).
 */
export function loadOpportunities(): Opportunity[] {
  const data = rawData as OpportunitiesData;
  const items: unknown[] = Array.isArray(data.items) ? data.items : [];

  return items
    .filter(isValidOpportunity)
    .sort((a, b) => a.deadline.localeCompare(b.deadline));
}

/**
 * Compute the D-day integer relative to KST (Asia/Seoul).
 *
 * Returns the number of calendar days until the deadline as seen in Seoul:
 *   D = deadlineDate_KST - todayDate_KST
 *   D > 0 → still open (D-N)
 *   D = 0 → today (D-0)
 *   D < 0 → past
 *
 * @param deadline ISO 8601 string (date-only or full datetime)
 * @param now      timestamp in ms (default: Date.now())
 */
export function dday(deadline: string, now: number = Date.now()): number {
  // Convert both timestamps to their YYYY-MM-DD in KST using the
  // 'en-CA' locale which produces ISO-style "YYYY-MM-DD" output.
  const tz = 'Asia/Seoul';
  const opts: Intl.DateTimeFormatOptions = { timeZone: tz };

  const deadlineMs = Date.parse(deadline);
  if (isNaN(deadlineMs)) return NaN;

  const todayKST = new Date(now).toLocaleDateString('en-CA', opts);     // "YYYY-MM-DD"
  const deadlineKST = new Date(deadlineMs).toLocaleDateString('en-CA', opts); // "YYYY-MM-DD"

  // Diff in calendar days (safe integer arithmetic via UTC midnight)
  const todayUtcMidnight = new Date(todayKST + 'T00:00:00Z').getTime();
  const deadlineUtcMidnight = new Date(deadlineKST + 'T00:00:00Z').getTime();

  return Math.round((deadlineUtcMidnight - todayUtcMidnight) / 86_400_000);
}

/**
 * Returns the CSS modifier class for a D-day value.
 * calm = D≥7, warn = 3≤D<7, danger = 0≤D<3, closed = D<0
 */
export function ddayClass(d: number): 'calm' | 'warn' | 'danger' | 'closed' {
  if (d < 0) return 'closed';
  if (d < 3) return 'danger';
  if (d < 7) return 'warn';
  return 'calm';
}

/**
 * Human-readable D-day label: "D-9", "D-2", "D-0", "마감"
 */
export function ddayLabel(d: number): string {
  if (d < 0) return '마감';
  return `D-${d}`;
}
