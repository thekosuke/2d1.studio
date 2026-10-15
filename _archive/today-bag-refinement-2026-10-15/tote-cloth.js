// Damped fabric response. Fixed substeps keep fast cursor reversals stable,
// including the first frame after a hidden tab or an offscreen preview.
export function stepCloth(state, velocity, dt, reduced = false) {
  if (reduced) { state.bend = state.bendVelocity = state.swing = state.swingVelocity = 0; return state; }
  const elapsed = Math.min(.05, Math.max(0, dt));
  const steps = Math.max(1, Math.ceil(elapsed / (1 / 120))), h = elapsed / steps;
  const bendTarget = Math.max(-4.2, Math.min(4.2, -velocity * 1.4));
  const swingTarget = Math.max(-6, Math.min(6, -velocity * 2.4));
  for (let i = 0; i < steps; i++) {
    state.bendVelocity += ((bendTarget - state.bend) * 48 - state.bendVelocity * 9) * h;
    state.bend += state.bendVelocity * h;
    state.swingVelocity += ((swingTarget - state.swing) * 28 - state.swingVelocity * 6.8) * h;
    state.swing += state.swingVelocity * h;
  }
  return state;
}

// Rim stays attached to the handles; the lower fabric lags behind it.
// Exact inverse-transpose normals keep the changing folds softly lit.
export function flexVertex(x, y, z, bend, out, height = 36) {
  const q = Math.max(0, Math.min(1, 1 - y / height));
  const twist = bend * .026 * q;
  out[0] = x + bend * q * q + twist * z;
  out[1] = y;
  out[2] = z - twist * x;
  return out;
}
export function flexNormal(x, y, z, nx, ny, nz, bend, out, height = 36) {
  const q = Math.max(0, Math.min(1, 1 - y / height));
  const dq = y > 0 && y < height ? -1 / height : 0;
  const t = bend * .026 * q;
  const b = 2 * bend * q * dq + bend * .026 * z * dq;
  const h = -bend * .026 * x * dq;
  const a = nx + t * nz, c = nz - t * nx;
  const v = ny * (1 + t * t) - b * a - h * c;
  const length = Math.hypot(a, v, c) || 1;
  out[0] = a / length; out[1] = v / length; out[2] = c / length;
  return out;
}
