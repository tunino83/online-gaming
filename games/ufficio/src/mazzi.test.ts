import { describe, expect, it } from "vitest";
import { creaMazzoDiamanti, creaMazzoNumeri, creaMazzoPersonaggi } from "./mazzi";

const contaPer = <T, K>(lista: T[], chiave: (x: T) => K) => {
  const m = new Map<K, number>();
  for (const x of lista) m.set(chiave(x), (m.get(chiave(x)) ?? 0) + 1);
  return m;
};

describe("mazzo carte numero", () => {
  const mazzo = creaMazzoNumeri();

  it("ha 56 carte", () => {
    expect(mazzo).toHaveLength(56);
  });

  it("ha 7 copie per ogni valore da 1 a 8", () => {
    const conteggi = contaPer(mazzo, (c) => c.valore);
    expect([...conteggi.keys()].sort()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    for (const n of conteggi.values()) expect(n).toBe(7);
  });

  it("ogni carta ha un id diverso", () => {
    expect(new Set(mazzo.map((c) => c.id)).size).toBe(56);
  });
});

describe("mazzo diamanti", () => {
  const mazzo = creaMazzoDiamanti();

  it("ha 20 carte", () => {
    expect(mazzo).toHaveLength(20);
  });

  it("ha 4 fulmini", () => {
    expect(mazzo.filter((d) => d.tipo === "fulmine")).toHaveLength(4);
  });

  it("ha 2 diamanti per ogni valore da 1 a 8", () => {
    const conValore = mazzo.flatMap((d) => (d.tipo === "valore" ? [d.valore] : []));
    expect(conValore).toHaveLength(16);
    const conteggi = contaPer(conValore, (v) => v);
    expect([...conteggi.keys()].sort()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    for (const n of conteggi.values()) expect(n).toBe(2);
  });

  it("ogni carta ha un id diverso", () => {
    expect(new Set(mazzo.map((d) => d.id)).size).toBe(20);
  });
});

describe("mazzo personaggi", () => {
  const mazzo = creaMazzoPersonaggi();

  it("ha 55 carte", () => {
    expect(mazzo).toHaveLength(55);
  });

  it("ha 42 personaggi diversi", () => {
    expect(new Set(mazzo.map((c) => c.personaggio)).size).toBe(42);
  });

  it("ogni carta ha un id diverso", () => {
    expect(new Set(mazzo.map((c) => c.id)).size).toBe(55);
  });
});
