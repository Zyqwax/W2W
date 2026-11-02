import { test } from "node:test";
import assert from "node:assert/strict";
import { isAired, progressFor } from "../src/lib/tv.ts";
const ep = (season, number, date = "2020-01-01") => ({
  season_number: season,
  episode_number: number,
  air_date: date,
  name: `Episode ${number}`,
});
test("air dates exclude future and unknown episodes", () => {
  assert.equal(isAired(ep(1, 1, "2099-01-01")), false);
  assert.equal(isAired(ep(1, 1, null)), false);
  assert.equal(isAired(ep(1, 1, "2020-01-01"), "2020-01-01"), true);
  assert.equal(isAired(ep(1, 0)), false);
});
test("progress excludes specials and unaired episodes, orders next chronologically", () => {
  const catalog = [
    ep(2, 1),
    ep(1, 2),
    ep(0, 1),
    ep(1, 1),
    ep(2, 2, "2099-01-01"),
    ep(2, 3, null),
  ];
  const progress = progressFor(catalog, [
    { seasonNumber: 1, episodeNumber: 1 },
    { seasonNumber: 0, episodeNumber: 1 },
  ]);
  assert.equal(progress.total, 3);
  assert.equal(progress.watched, 1);
  assert.equal(progress.next.episode_number, 2);
  assert.equal(progress.next.season_number, 1);
});
test("undo restores the earliest unwatched episode; duplicate marks do not inflate progress", () => {
  const catalog = [ep(1, 1), ep(1, 2)];
  const complete = progressFor(catalog, [
    { seasonNumber: 1, episodeNumber: 1 },
    { seasonNumber: 1, episodeNumber: 1 },
    { seasonNumber: 1, episodeNumber: 2 },
  ]);
  assert.equal(complete.watched, 2);
  assert.equal(complete.next, null);
  const undone = progressFor(catalog, [{ seasonNumber: 1, episodeNumber: 2 }]);
  assert.equal(undone.next.episode_number, 1);
  assert.equal(undone.watched, 1);
});
test("empty catalog is valid", () =>
  assert.deepEqual(progressFor([], []), { total: 0, watched: 0, next: null }));
