// Drag now uses pointer events, which work on every input device (mouse,
// trackpad, stylus, touch). This hook exists only so existing imports keep
// compiling; it is always true.
export const useCanDrag = () => true;
