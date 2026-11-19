import { useCallback, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';

export const SIDEBAR_DEFAULT_WIDTH = 320;
export const SIDEBAR_MIN_WIDTH = 264;
export const SIDEBAR_MAX_WIDTH = 480;

const STORAGE_KEY = 'sidebar-width';
const KEYBOARD_STEP = 16;

const clampWidth = (width: number): number =>
  Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, Math.round(width)));

const readStoredWidth = (): number => {
  try {
    const stored = Number(window.localStorage.getItem(STORAGE_KEY));
    return Number.isFinite(stored) && stored > 0 ? clampWidth(stored) : SIDEBAR_DEFAULT_WIDTH;
  } catch {
    return SIDEBAR_DEFAULT_WIDTH;
  }
};

const storeWidth = (width: number): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(width));
  } catch {
    // Storage can be blocked (private mode); the width still applies for this page.
  }
};

type DragState = { pointerId: number; startX: number; startWidth: number; currentWidth: number };

/**
 * Drag-to-resize width for the desktop sidebar, clamped between
 * SIDEBAR_MIN_WIDTH and SIDEBAR_MAX_WIDTH and remembered per browser.
 *
 * While dragging, the width is written straight to the container's style so
 * the session list does not re-render on every pointer move; React state is
 * updated once, when the drag ends.
 */
export function useSidebarWidth() {
  const [width, setWidth] = useState<number>(readStoredWidth);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState | null>(null);

  const commitWidth = useCallback((nextWidth: number) => {
    const clamped = clampWidth(nextWidth);
    setWidth(clamped);
    storeWidth(clamped);
  }, []);

  const endDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) {
        return;
      }

      dragRef.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      commitWidth(drag.currentWidth);
    },
    [commitWidth],
  );

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) {
        return;
      }

      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startWidth: width, currentWidth: width };
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    },
    [width],
  );

  const onPointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    drag.currentWidth = clampWidth(drag.startWidth + event.clientX - drag.startX);
    if (containerRef.current) {
      containerRef.current.style.width = `${drag.currentWidth}px`;
    }
  }, []);

  const onKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      const keyToWidth: Record<string, number> = {
        ArrowLeft: width - KEYBOARD_STEP,
        ArrowRight: width + KEYBOARD_STEP,
        Home: SIDEBAR_MIN_WIDTH,
        End: SIDEBAR_MAX_WIDTH,
      };
      const nextWidth = keyToWidth[event.key];
      if (nextWidth === undefined) {
        return;
      }

      event.preventDefault();
      commitWidth(nextWidth);
    },
    [commitWidth, width],
  );

  const onDoubleClick = useCallback(() => commitWidth(SIDEBAR_DEFAULT_WIDTH), [commitWidth]);

  return {
    width,
    containerRef,
    handleProps: {
      role: 'separator',
      'aria-orientation': 'vertical' as const,
      'aria-valuenow': width,
      'aria-valuemin': SIDEBAR_MIN_WIDTH,
      'aria-valuemax': SIDEBAR_MAX_WIDTH,
      tabIndex: 0,
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onKeyDown,
      onDoubleClick,
    },
  };
}
