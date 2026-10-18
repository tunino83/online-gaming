import { describe, expect, it } from "vitest";
import { AVATAR, STILI_AVATAR, avatarCasuale, avatarValido, stileAvatar } from "./avatar";

describe("avatar", () => {
  it("i classici sono validi, quelli inventati no", () => {
    for (const a of AVATAR) expect(avatarValido(a.id)).toBe(true);
    for (const x of ["", "<script>", "drago2", 5, null, "pixel:", "pixel:AB12CD", "boh:abcd1234", "pixel:abc"]) expect(avatarValido(x)).toBe(false);
  });

  it("ogni stile dà avatar a caso validi, dello stile giusto", () => {
    for (const s of STILI_AVATAR) {
      for (let i = 0; i < 20; i++) {
        const id = avatarCasuale(s.id);
        expect(avatarValido(id), id).toBe(true);
        expect(stileAvatar(id)).toBe(s.id);
      }
    }
  });

  it("premendo più volte si ottengono avatar diversi", () => {
    const visti = new Set(Array.from({ length: 30 }, () => avatarCasuale("pixel")));
    expect(visti.size).toBeGreaterThan(25);
  });

  it("il robot resta ai giocatori del computer", () => {
    for (let i = 0; i < 200; i++) expect(avatarCasuale("classici")).not.toBe("robot");
  });
});
