'use client';

import { useEffect } from 'react';

const HOVER_SELECTOR = 'a, button, [role="button"], [data-cursor-hover]';
const RIPPLE_SELECTOR = 'a, button, [role="button"]';
const NATIVE_SELECTOR = 'input, textarea, select, label, [contenteditable="true"]';
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

    function setHoverState(isHover) {
      if (!cursor) return;
      cursor.classList.toggle('is-hover', isHover);
    }

    function setNativeFieldState(isNativeField) {
      if (!cursor) return;
      cursor.classList.toggle('is-native-field', isNativeField);
      document.documentElement.classList.toggle('custom-cursor-text', isNativeField);
    }

    function onMouseMove(event) {
      if (!cursor) return;
      cursor.style.setProperty('--cursor-x', `${event.clientX}px`);
      cursor.style.setProperty('--cursor-y', `${event.clientY}px`);
      cursor.classList.remove('is-hidden');
      setNativeFieldState(matchesSelector(event.target, NATIVE_SELECTOR));
    }

    function onDocumentLeave() {
      if (!cursor) return;
      cursor.classList.add('is-hidden');
    }

    function onMouseOver(event) {
      if (matchesSelector(event.target, NATIVE_SELECTOR)) {
        setNativeFieldState(true);
        setHoverState(false);
        return;
      }
      setNativeFieldState(false);
      if (matchesSelector(event.target, HOVER_SELECTOR)) setHoverState(true);
    }

    function onMouseOut(event) {
      if (matchesSelector(event.target, NATIVE_SELECTOR)) {
        if (!matchesSelector(event.relatedTarget, NATIVE_SELECTOR)) {
          setNativeFieldState(false);
        }
        return;
      }
      if (!matchesSelector(event.target, HOVER_SELECTOR)) return;
      if (matchesSelector(event.relatedTarget, HOVER_SELECTOR)) return;
      setHoverState(false);
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
      if (matchesSelector(event.target, RIPPLE_SELECTOR)) triggerRipple();
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
      document.addEventListener('mouseout', onMouseOut);
      document.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mouseup', onMouseUp);
      listenersBound = true;
    }

    function unbind() {
      if (!listenersBound) return;
      window.removeEventListener('mousemove', onMouseMove);
      document.documentElement.removeEventListener('mouseleave', onDocumentLeave);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
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
      if (prefersReducedMotion) cursor.classList.add('is-reduced-motion');

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
      if (!finePointerQuery.matches) {
        disable();
        return;
      }
      enable();
      if (!cursor) return;
      cursor.classList.toggle('is-reduced-motion', prefersReducedMotion);
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
