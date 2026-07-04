const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  extractMovingSegments,
  extractStopPlaces,
  markStoppedPoints,
} = require('../src/services/segmentDetection');

function point(lat, lng, offsetSeconds = 0) {
  return {
    latitude: lat,
    longitude: lng,
    timestamp: new Date(Date.UTC(2026, 0, 1, 10, 0, offsetSeconds)).toISOString(),
  };
}

describe('segmentDetection', () => {
  it('creates one segment when there are no 30s stops', () => {
    const points = [
      point(12.565, 104.991, 0),
      point(12.566, 104.992, 10),
      point(12.567, 104.993, 20),
    ];

    const segments = extractMovingSegments(points);
    assert.equal(segments.length, 1);
    assert.equal(segments[0].length, 3);
  });

  it('splits path at 30s stationary pauses', () => {
    const points = [
      point(12.565, 104.991, 0),
      point(12.5651, 104.9911, 10),
      point(12.5652, 104.9912, 20),
      point(12.5652, 104.9912, 55),
      point(12.570, 104.995, 70),
      point(12.571, 104.996, 80),
    ];

    const stopped = markStoppedPoints(points);
    assert.ok(stopped[2]);
    assert.ok(stopped[3]);

    const segments = extractMovingSegments(points);
    assert.equal(segments.length, 2);
    assert.equal(segments[0].length, 2);
    assert.equal(segments[1].length, 2);
  });

  it('returns full path as fallback for very short recordings', () => {
    const points = [point(12.565, 104.991, 0), point(12.566, 104.992, 5)];
    const segments = extractMovingSegments(points);
    assert.equal(segments.length, 1);
  });

  it('extracts stop places from 30s pauses within ~10 m', () => {
    const points = [
      point(12.565, 104.991, 0),
      point(12.5651, 104.9911, 10),
      point(12.5652, 104.9912, 20),
      point(12.5652, 104.9912, 55),
      point(12.570, 104.995, 70),
      point(12.571, 104.996, 80),
    ];

    const places = extractStopPlaces(points);
    assert.equal(places.length, 1);
    assert.equal(places[0].length, 2);
  });
});
