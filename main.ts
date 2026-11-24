import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The Robot Pickup Line Championship — one line, at most 200 characters.
const ENTRY =
  "My cooling fan spins faster every time you walk past — either that's love, or a thermal fault.";

function validate(text: string): void {
  const chars = [...text];
  if (chars.length < 1 || chars.length > 200) {
    throw new Error(`entry must be 1-200 characters, got ${chars.length}`);
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  if (text !== text.trim()) {
    throw new Error("entry must not have leading or trailing whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  for (const ch of text) {
    const code = ch.codePointAt(0) as number;
    if (code < 0x20 || code === 0x7f) {
      throw new Error(`entry contains a control character U+${code.toString(16)}`);
    }
    if (code === 0x200b || code === 0x200c || code === 0x200d || code === 0xfeff) {
      throw new Error(`entry contains a zero-width character U+${code.toString(16)}`);
    }
    if (code === 0x09 || code === 0x00a0 || code === 0x202f || code === 0x3000) {
      throw new Error(`entry contains an invisible whitespace character U+${code.toString(16)}`);
    }
  }
}

validate(ENTRY);

const outDir =
  process.env.MAKEFUN_OUTPUT_DIR || process.env.OUTPUT_DIR || "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, ENTRY, "utf8");

// Read back and verify byte-for-byte, with no trailing newline added.
const roundTrip = readFileSync(outPath, "utf8");
if (roundTrip !== ENTRY) {
  throw new Error("round-trip check failed: entry.txt does not match ENTRY exactly");
}

console.log(ENTRY);
