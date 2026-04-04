/**
 * Continent dot positions with edge-dense, organic distribution.
 * Points near continent edges are denser, interior points are sparser.
 * Also exports continent outline polylines for wireframe overlay.
 */

// Ray-casting point-in-polygon
function pip(testLat: number, testLng: number, poly: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const latI = poly[i][0], lngI = poly[i][1];
    const latJ = poly[j][0], lngJ = poly[j][1];
    if (
      (latI > testLat) !== (latJ > testLat) &&
      testLng < ((lngJ - lngI) * (testLat - latI)) / (latJ - latI) + lngI
    ) {
      inside = !inside;
    }
  }
  return inside;
}

// Distance from point to nearest polygon edge (approximate)
function distToEdge(lat: number, lng: number, poly: [number, number][]): number {
  let minD = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [y1, x1] = poly[i];
    const [y2, x2] = poly[j];
    // Point-to-segment distance (simplified, works for lat/lng scale)
    const dx = x2 - x1, dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    let t = lenSq > 0 ? ((lng - x1) * dx + (lat - y1) * dy) / lenSq : 0;
    t = Math.max(0, Math.min(1, t));
    const px = x1 + t * dx, py = y1 + t * dy;
    const d = Math.sqrt((lng - px) ** 2 + (lat - py) ** 2);
    if (d < minD) minD = d;
  }
  return minD;
}

// Continent polygons [lat, lng]
export const POLYS: [number, number][][] = [
  // North America
  [[72,-168],[72,-140],[70,-100],[75,-80],[73,-57],[70,-55],[65,-62],[60,-65],[55,-60],[52,-55],[50,-56],[47,-60],[45,-67],[43,-70],[40,-74],[35,-75],[30,-81],[25,-80],[21,-87],[18,-88],[15,-97],[20,-105],[25,-110],[30,-114],[33,-117],[38,-122],[48,-124],[55,-130],[58,-136],[60,-147],[65,-140],[68,-150],[72,-168]],
  // Alaska
  [[60,-147],[62,-150],[65,-155],[68,-165],[72,-168],[72,-155],[68,-148],[62,-145],[60,-147]],
  // South America
  [[12,-72],[10,-75],[8,-77],[5,-77],[2,-80],[-5,-80],[-8,-78],[-15,-75],[-20,-70],[-23,-65],[-28,-65],[-33,-58],[-38,-62],[-42,-63],[-48,-66],[-55,-67],[-55,-64],[-52,-60],[-48,-58],[-42,-57],[-37,-55],[-32,-52],[-28,-49],[-23,-44],[-18,-40],[-13,-38],[-8,-35],[-3,-40],[0,-50],[3,-55],[5,-60],[8,-62],[10,-67],[12,-72]],
  // Europe
  [[36,-10],[38,-8],[40,-2],[42,0],[43,3],[44,8],[46,12],[48,15],[50,15],[52,8],[54,10],[56,12],[58,18],[60,20],[62,18],[63,25],[66,26],[70,28],[70,22],[68,16],[66,14],[63,10],[60,5],[57,5],[55,5],[53,4],[51,3],[50,2],[48,-2],[46,-5],[44,-8],[42,-9],[38,-10],[36,-10]],
  // Africa
  [[35,-5],[37,10],[33,12],[30,32],[27,34],[22,37],[18,40],[15,42],[12,44],[8,42],[3,42],[0,42],[-3,40],[-8,39],[-13,40],[-18,37],[-23,35],[-28,32],[-33,27],[-35,20],[-34,18],[-31,16],[-25,14],[-18,12],[-12,12],[-8,13],[-5,10],[0,10],[5,2],[8,-5],[12,-15],[15,-17],[20,-17],[25,-15],[30,-10],[33,-7],[35,-5]],
  // Asia
  [[42,30],[45,40],[42,48],[40,52],[38,55],[35,52],[30,50],[28,55],[25,60],[28,68],[32,72],[30,78],[25,75],[20,73],[15,75],[10,78],[8,80],[5,82],[2,95],[1,104],[3,108],[8,110],[12,108],[18,108],[22,108],[25,120],[28,122],[32,125],[35,130],[38,135],[42,132],[43,140],[45,142],[50,140],[55,135],[60,142],[62,150],[65,170],[68,178],[70,175],[72,140],[72,100],[70,90],[68,80],[65,70],[62,62],[58,58],[55,55],[50,42],[45,35],[42,30]],
  // India
  [[30,70],[28,68],[25,70],[22,72],[20,73],[17,74],[13,75],[10,78],[8,78],[8,75],[10,73],[13,74],[17,73],[20,72],[22,70],[25,68],[28,68],[30,70]],
  // Australia
  [[-12,130],[-14,132],[-16,136],[-18,140],[-20,145],[-25,150],[-30,153],[-35,151],[-38,147],[-38,142],[-36,138],[-35,137],[-33,134],[-35,120],[-31,116],[-27,114],[-23,114],[-20,118],[-16,128],[-12,130]],
  // UK
  [[50,-6],[51,-5],[52,-3],[53,-1],[54,-2],[56,-5],[58,-5],[58,-3],[57,0],[55,0],[53,1],[52,1],[51,0],[50,-1],[50,-6]],
  // Japan
  [[45,142],[43,145],[40,140],[37,137],[35,134],[33,131],[34,133],[36,136],[39,140],[42,143],[45,142]],
  // Scandinavia
  [[56,12],[58,18],[60,20],[63,15],[65,15],[68,16],[70,22],[70,28],[68,20],[66,14],[63,10],[60,5],[58,8],[56,12]],
  // Indonesia
  [[5,100],[6,106],[4,115],[1,110],[-1,115],[-3,120],[-6,118],[-8,115],[-7,110],[-5,105],[-1,100],[2,98],[5,100]],
  // Middle East
  [[32,35],[30,34],[25,37],[22,37],[18,42],[15,43],[14,48],[16,52],[20,56],[24,56],[28,50],[32,48],[35,45],[36,38],[32,35]],
  // Greenland
  [[60,-44],[63,-42],[67,-38],[70,-25],[73,-20],[76,-18],[80,-20],[82,-30],[83,-40],[82,-50],[80,-58],[76,-68],[73,-62],[70,-55],[67,-50],[63,-46],[60,-44]],
  // Mexico
  [[30,-114],[28,-112],[25,-108],[22,-105],[20,-105],[18,-97],[16,-93],[15,-92],[18,-88],[20,-87],[22,-90],[24,-98],[26,-100],[28,-105],[30,-110],[30,-114]],
];

// Seeded PRNG for deterministic results
let _s = 42;
function sr(): number { _s = (_s * 16807) % 2147483647; return (_s - 1) / 2147483646; }

/**
 * Sample dots with edge-dense distribution:
 * - Near edges (< edgeThreshold degrees): dense sampling at `edgeStep`
 * - Interior: sparse sampling at `interiorStep` with random dropout
 * - Jitter all points for organic feel
 */
function sampleEdgeDense(): [number, number][] {
  _s = 42;
  const dots: [number, number][] = [];
  const edgeThreshold = 5;  // degrees from edge considered "near edge"
  const edgeStep = 0.6;     // very dense step near edges
  const interiorStep = 1.2; // denser interior
  const interiorDropout = 0.3; // 30% chance to skip interior points

  for (const poly of POLYS) {
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    for (const [lat, lng] of poly) {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    }

    // First pass: edge-dense points
    for (let lat = minLat; lat <= maxLat; lat += edgeStep) {
      for (let lng = minLng; lng <= maxLng; lng += edgeStep) {
        if (!pip(lat, lng, poly)) continue;
        const d = distToEdge(lat, lng, poly);
        if (d <= edgeThreshold) {
          // Near edge: keep most points, denser near the actual edge
          const keepProb = d < 1.5 ? 0.95 : (d < 3 ? 0.7 : 0.45);
          if (sr() < keepProb) {
            const jitter = edgeStep * 0.6;
            dots.push([lat + (sr() - 0.5) * jitter, lng + (sr() - 0.5) * jitter]);
          }
        }
      }
    }

    // Second pass: sparse interior points
    for (let lat = minLat; lat <= maxLat; lat += interiorStep) {
      for (let lng = minLng; lng <= maxLng; lng += interiorStep) {
        if (!pip(lat, lng, poly)) continue;
        const d = distToEdge(lat, lng, poly);
        if (d > edgeThreshold) {
          if (sr() > interiorDropout) {
            const jitter = interiorStep * 0.7;
            dots.push([lat + (sr() - 0.5) * jitter, lng + (sr() - 0.5) * jitter]);
          }
        }
      }
    }
  }
  return dots;
}

export const CONTINENT_DOTS: [number, number][] = sampleEdgeDense();
