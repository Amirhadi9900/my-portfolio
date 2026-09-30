'use client';

import { useEffect } from 'react';

const HOVER_SELECTOR = 'a, button, [role="button"], [data-cursor-hover]';
const RIPPLE_SELECTOR = 'a, button, [role="button"]';
const FIELD_SELECTOR = 'input, textarea, select, label, [contenteditable="true"]';
// Input types you click rather than type into. They take the button treatment:
// the custom cursor stays visible over them. Everything else an <input> can be
// wants a caret, so it keeps the native text cursor and hides ours.
const POINTER_INPUT_TYPES = new Set([
  'button',
  'checkbox',
  'color',
  'file',
  'image',
  'radio',
  'range',
  'reset',
  'submit',
]);
const FINE_POINTER_QUERY = '(pointer: fine)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const SVG_NS = 'http://www.w3.org/2000/svg';

function createChevron(className, points) {
  const line = document.createElementNS(SVG_NS, 'polyline');
  line.setAttribute('class', className);
  line.setAttribute('points', points);
  line.setAttribute('fill', 'none');
  return line;
}

export default function PromptCursor() {
  useEffect(() => {
    const finePointerQuery = window.matchMedia(FINE_POINTER_QUERY);
    const reducedMotionQuery = window.matchMedia(REDUCED_MOTION_QUERY);

    let cursor = null;
    let ripple = null;
    let prefersReducedMotion = reducedMotionQuery.matches;
    let listenersBound = false;

    function closestElement(node) {
      if (!node) return null;
      if (node.nodeType === Node.ELEMENT_NODE) return node;
      return node.parentElement;
    }

    function matchesSelector(node, selector) {
      const element = closestElement(node);
      return Boolean(element && element.closest(selector));
    }

    function isPointerInput(field) {
      return (
        field.tagName === 'INPUT' &&
        POINTER_INPUT_TYPES.has((field.getAttribute('type') || 'text').toLowerCase())
      );
    }

    // A label is not a field in its own right: it belongs to whichever control it
    // names, so hovering either the box or its caption gives that control's cursor.
    function fieldElementFor(element) {
      const field = element.closest(FIELD_SELECTOR);
      if (!field) return null;
      if (field.tagName !== 'LABEL') return field;
      const forId = field.getAttribute('for');
      const target = forId && document.getElementById(forId);
      return target || field.querySelector('input, select, textarea') || field;
    }

    // 'text'   -> you type in it: native caret, custom cursor hidden
    // 'action' -> you click it: custom cursor visible and lit up
    // null     -> ordinary page content
    function classify(node) {
      const element = closestElement(node);
      if (!element) return null;
      const field = fieldElementFor(element);
      if (field) return isPointerInput(field) ? 'action' : 'text';
      if (matchesSelector(element, HOVER_SELECTOR)) return 'action';
      return null;
    }

    // data-cursor-hover lights the cursor up but does not ripple, so a plain
    // stretch of text in the hero reads as interactive without shouting about it.
    function isRipplable(node) {
      const element = closestElement(node);
      if (!element) return false;
      const field = fieldElementFor(element);
      if (field) return isPointerInput(field);
      return matchesSelector(element, RIPPLE_SELECTOR);
    }

    function setHoverState(isHover) {
      if (!cursor) return;
      cursor.classList.toggle('is-hover', isHover);
    }

    function setNativeFieldState(isNativeField) {
      if (!cursor) return;
      cursor.classList.toggle('is-native-field', isNativeField);
      document.documentElement.classList.toggle('custom-cursor-text', isNativeField);
    }

    // Recomputed from the element under the pointer on both mouseover and mousemove,
    // rather than undoing the previous element's state on mouseout: derived state
    // cannot go stale, and mousemove covers the page scrolling under a still pointer.
    function applyState(target) {
      const kind = classify(target);
      setNativeFieldState(kind === 'text');
      setHoverState(kind === 'action');
    }

    function onMouseMove(event) {
      if (!cursor) return;
      cursor.style.setProperty('--cursor-x', `${event.clientX}px`);
      cursor.style.setProperty('--cursor-y', `${event.clientY}px`);
      cursor.classList.remove('is-hidden');
      applyState(event.target);
    }

    function onDocumentLeave() {
      if (!cursor) return;
      cursor.classList.add('is-hidden');
    }

    function onMouseOver(event) {
      applyState(event.target);
    }

    function triggerRipple() {
      if (!ripple || prefersReducedMotion) return;
      ripple.classList.remove('is-rippling');
      void ripple.offsetWidth;
      ripple.classList.add('is-rippling');
    }

    function onRippleEnd() {
      if (ripple) ripple.classList.remove('is-rippling');
    }

    function onMouseDown(event) {
      if (!cursor || cursor.classList.contains('is-native-field')) return;
      cursor.classList.add('is-active');
      if (isRipplable(event.target)) triggerRipple();
    }

    function onMouseUp() {
      if (!cursor) return;
      cursor.classList.remove('is-active');
    }

    function bind() {
      if (listenersBound || !cursor) return;
      window.addEventListener('mousemove', onMouseMove);
      document.documentElement.addEventListener('mouseleave', onDocumentLeave);
      document.addEventListener('mouseover', onMouseOver);
      document.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mouseup', onMouseUp);
      listenersBound = true;
    }

    function unbind() {
      if (!listenersBound) return;
      window.removeEventListener('mousemove', onMouseMove);
      document.documentElement.removeEventListener('mouseleave', onDocumentLeave);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      if (ripple) ripple.removeEventListener('animationend', onRippleEnd);
      listenersBound = false;
    }

    function enable() {
      if (cursor) return;
      cursor = document.createElement('div');
      cursor.className = 'prompt-cursor is-hidden';
      cursor.setAttribute('aria-hidden', 'true');

      const mark = document.createElementNS(SVG_NS, 'svg');
      mark.setAttribute('class', 'prompt-cursor-mark');
      mark.setAttribute('viewBox', '0 0 18 16');
      mark.setAttribute('aria-hidden', 'true');
      mark.appendChild(createChevron('prompt-cursor-lead', '2,2 10,8 2,14'));
      mark.appendChild(createChevron('prompt-cursor-next', '8,2 16,8 8,14'));

      ripple = document.createElement('span');
      ripple.className = 'prompt-cursor-ripple';
      ripple.addEventListener('animationend', onRippleEnd);

      cursor.appendChild(ripple);
      cursor.appendChild(mark);

      document.body.appendChild(cursor);
      document.documentElement.classList.add('custom-cursor-active');
      document.body.classList.add('custom-cursor-active');
      bind();
    }

    function disable() {
      unbind();
      document.documentElement.classList.remove('custom-cursor-active', 'custom-cursor-text');
      document.body.classList.remove('custom-cursor-active');
      if (cursor) {
        cursor.remove();
        cursor = null;
        ripple = null;
      }
    }

    function sync() {
      prefersReducedMotion = reducedMotionQuery.matches;
      if (finePointerQuery.matches) {
        enable();
      } else {
        disable();
      }
    }

    sync();
    finePointerQuery.addEventListener('change', sync);
    reducedMotionQuery.addEventListener('change', sync);

    return () => {
      finePointerQuery.removeEventListener('change', sync);
      reducedMotionQuery.removeEventListener('change', sync);
      disable();
    };
  }, []);

  return null;
}
