/**
 * Prepara le voci delle carte: prende i file in games/famiglia/audio/_originali (anche vocali di WhatsApp .opus/.ogg,
 * Memo vocali .m4a, .mp3, .wav…), controlla i nomi e li trasforma in .mp3 in games/famiglia/audio/:
 * una voce sola (mono), silenzi tolti all'inizio e alla fine, volume uguale per tutti, al massimo 8 secondi.
 * Serve ffmpeg (installato con: winget install Gyan.FFmpeg).
 *
 * Uso: pnpm vocali:famiglia            (rifà solo i file nuovi o cambiati)
 *      pnpm vocali:famiglia --tutti    (rifà tutto)
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { CARTE } from "../src/carte";

const CARTELLA = fileURLToPath(new URL("../audio/", import.meta.url));
const ORIGINALI = join(CARTELLA, "_originali");
const FORMATI = /\.(opus|ogg|oga|m4a|mp3|wav|aac|amr|webm|mp4|3gp)$/i;
const DURATA_MASSIMA_S = 8;
const tutti = process.argv.includes("--tutti");

/** ffmpeg: dal PATH, oppure dove lo mette winget. */
function trovaFfmpeg(): string {
  const candidati = [process.env.FFMPEG, "ffmpeg", join(homedir(), "AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe")].filter(Boolean) as string[];
  for (const c of candidati) {
    try {
      execFileSync(c, ["-version"], { stdio: "ignore" });
      return c;
    } catch {
      // si prova il prossimo
    }
  }
  throw new Error("ffmpeg non trovato: installalo con «winget install Gyan.FFmpeg»");
}

/** Nomi validi: carta o persona, con eventualmente _ATT, _DIF, _AIU (solo se la carta ha quel tipo di potere). */
function controllaNome(nome: string): string | null {
  const [base, suffisso, ...resto] = nome.split("_");
  if (resto.length > 0) return "troppi «_» nel nome";
  const carte = CARTE.filter((c) => c.id === base || c.persona === base);
  if (carte.length === 0) return `«${base}» non è una carta né una persona`;
  if (suffisso === undefined) return null;
  const tipo = { ATT: "attacco", DIF: "difesa", AIU: "aiuto" }[suffisso];
  if (!tipo) return `«_${suffisso}» non va bene: usa _ATT, _DIF o _AIU (o niente per l'attivazione)`;
  if (!carte.some((c) => c.poteri.some((p) => p.tipo === tipo))) return `«${base}» non ha un potere di ${tipo}`;
  return null;
}

mkdirSync(ORIGINALI, { recursive: true });
const ffmpeg = trovaFfmpeg();
const file = readdirSync(ORIGINALI).filter((f) => FORMATI.test(f));
if (file.length === 0) console.log(`Nessun vocale in ${ORIGINALI}`);
let fatti = 0;
let errori = 0;
for (const f of file) {
  // nome della carta in minuscolo, suffisso in maiuscolo (es. "Antonio-2_att.opus" → "antonio-2_ATT")
  const [base = "", ...altro] = f.replace(FORMATI, "").trim().split("_");
  const nome = [base.toLowerCase(), ...altro.map((x) => x.toUpperCase())].join("_");
  const problema = controllaNome(nome);
  if (problema) {
    console.log(`❌ ${f}: ${problema}`);
    errori++;
    continue;
  }
  const da = join(ORIGINALI, f);
  const a = join(CARTELLA, `${nome}.mp3`);
  if (!tutti && existsSync(a) && statSync(a).mtimeMs >= statSync(da).mtimeMs) continue;
  try {
    execFileSync(
      ffmpeg,
      [
        "-y",
        "-loglevel",
        "error",
        "-i",
        da,
        // silenzi tolti all'inizio e alla fine (girando l'audio per la fine), volume uniforme
        "-af",
        "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.15,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.25,areverse,loudnorm=I=-16:TP=-1.5:LRA=11",
        "-t",
        String(DURATA_MASSIMA_S),
        "-ac",
        "1",
        "-ar",
        "44100",
        "-b:a",
        "96k",
        a,
      ],
      { stdio: "inherit" },
    );
    console.log(`✅ ${f} → audio/${nome}.mp3`);
    fatti++;
  } catch {
    console.log(`❌ ${f}: ffmpeg non è riuscito a leggerlo`);
    errori++;
  }
}
console.log(`\nFatti: ${fatti} · con problemi: ${errori}`);
process.exit(errori > 0 ? 1 : 0);
