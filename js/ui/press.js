export function bindPress(button, handler) {
  let lastPointerUpAt = 0;

  button.addEventListener('pointerup', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    lastPointerUpAt = performance.now();
    handler();
  });

  // Keep click for keyboard activation; ignore synthetic click after pointerup.
  button.addEventListener('click', () => {
    if (performance.now() - lastPointerUpAt < 350) return;
    handler();
  });
}
