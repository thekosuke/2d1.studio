/* Horizontal touch/pen rotation. Vertical gestures remain native page scroll. */
export function bindTouchRotation({ stage, hitTest, getAngle, setAngle, setDragging, limit }) {
  let gesture = null;
  const release = event => {
    if (!gesture || (event?.pointerId != null && event.pointerId !== gesture.id)) return;
    const id = gesture.id;
    gesture = null;
    setDragging(false);
    if (stage.hasPointerCapture(id)) stage.releasePointerCapture(id);
  };
  stage.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' || !event.isPrimary || gesture || !hitTest(event.clientX, event.clientY)) return;
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, angle: getAngle(), horizontal: false };
  });
  stage.addEventListener('pointermove', event => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
    if (!gesture.horizontal) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 8) return;
      if (Math.abs(dy) >= Math.abs(dx)) { release(event); return; }
      gesture.horizontal = true;
      stage.setPointerCapture(event.pointerId);
      setDragging(true);
    }
    // One stage-width sweep spans the same bounded range as mouse movement.
    const radians = dx / Math.max(1, stage.getBoundingClientRect().width) * limit * 2;
    setAngle(Math.max(-limit, Math.min(limit, gesture.angle + radians)));
  }, { passive: true });
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);
  // Ignore the canvas losing its implicit capture when we capture on the stage.
  stage.addEventListener('lostpointercapture', event => { if (event.target === stage) release(event); });
  window.addEventListener('blur', () => release());
  document.addEventListener('visibilitychange', () => { if (document.hidden) release(); });
}
