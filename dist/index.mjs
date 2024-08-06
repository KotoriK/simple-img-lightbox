import { spread, mergeProps, template, delegateEvents, createComponent, memo, use, className, render, insert, effect, setAttribute } from 'solid-js/web';
import { css } from '@emotion/css';
import { awaitImage } from 'await-res';
import { onCleanup, splitProps, createSignal, createEffect, on, createMemo, Show, onMount } from 'solid-js';

function useTimeout() {
  let timer;
  const clear = () => {
    clearTimeout(timer);
  };
  const set = (handler, timeout) => {
    clear();
    timer = setTimeout(handler, timeout);
  };
  onCleanup(clear);
  return set;
}

const _tmpl$$2 = /* @__PURE__ */ template(`<div role=dialog>`);
const styleModal = css({
  position: "fixed",
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 9999,
  backgroundColor: "#0000",
  transition: "all 500ms ease-in",
  "&>div": {
    margin: "0.8rem",
    overflow: "auto",
    maxHeight: "98vh"
  }
});
const styleOpenned = css({
  backdropFilter: "blur(2px) saturate(50%) brightness(80%)",
  backgroundColor: "#0001"
});
function Modal(props) {
  const [localProp, forwardProp] = splitProps(props, ["open", "onClose", "delay", "style"]);
  const setTimeout = useTimeout();
  const [visibility, setVisibility] = createSignal(localProp.open);
  const handleEscape = (e) => {
    if (e.key === "Escape") {
      localProp.onClose();
    }
  };
  createEffect(on(() => localProp.open, () => {
    if (visibility() !== localProp.open) {
      if (localProp.open) {
        setVisibility(true);
        window.addEventListener("keydown", handleEscape);
        onCleanup(() => window.removeEventListener("keydown", handleEscape));
      } else {
        setTimeout(() => setVisibility(false), localProp.delay ?? 500);
      }
    }
  }, {
    defer: true
  }));
  return (() => {
    const _el$ = _tmpl$$2();
    spread(_el$, mergeProps({
      get onClick() {
        return localProp.onClose;
      },
      get style() {
        return {
          visibility: visibility() ? "visible" : "hidden",
          ...localProp.style
        };
      },
      get classList() {
        return {
          [styleModal]: true,
          [styleOpenned]: localProp.open
        };
      }
    }, forwardProp), false, false);
    return _el$;
  })();
}

const _tmpl$$1 = /* @__PURE__ */ template(`<canvas>`);
const modalPadding = 10;
const styleBase = css({
  position: "absolute",
  top: 0,
  left: 0,
  userSelect: "none",
  transformOrigin: "left top"
});
function useDocumentClientSize() {
  const [size, setSize] = createSignal([0, 0]);
  const callback = () => {
    setSize([document.documentElement.clientWidth, document.documentElement.clientHeight]);
  };
  onMount(() => {
    callback();
    window.addEventListener("resize", callback);
  });
  onCleanup(() => {
    window.removeEventListener("resize", callback);
  });
  return size;
}
function FullscreenImage(props) {
  const [localProp, propForward] = splitProps(props, ["img", "slotAfter", "slotBefore"]);
  const [fullscreen, setFullscreen] = createSignal(false);
  const [rect, setRect] = createSignal();
  const [enableTransition, setEnableTransition] = createSignal(false);
  const clientSize = useDocumentClientSize();
  const refreshPos = () => {
    setRect(localProp.img?.getBoundingClientRect());
  };
  const targetSize = createMemo(() => {
    if (!localProp.img) return [0, 0];
    const {
      naturalWidth,
      naturalHeight
    } = localProp.img;
    const [clientWidth, clientHeight] = clientSize();
    let targetHeight = clientHeight - modalPadding * 4;
    let targetWidth = targetHeight * naturalWidth / naturalHeight;
    if (targetWidth > clientWidth) {
      targetWidth = clientWidth - modalPadding * 4;
      targetHeight = targetWidth / naturalWidth * naturalHeight;
    }
    return [targetWidth, targetHeight];
  });
  const showSlot = () => !enableTransition() && fullscreen();
  let ref;
  createEffect((prev) => {
    if (localProp.img !== prev && localProp.img) {
      const ctx = ref.getContext("2d");
      setEnableTransition(false);
      awaitImage(localProp.img).then(() => {
        ctx.drawImage(localProp.img, 0, 0, ...targetSize());
        if (!fullscreen()) {
          refreshPos();
          setTimeout(() => {
            setEnableTransition(true);
            setFullscreen(true);
          }, 0);
        }
      });
      ctx.clearRect(0, 0, ref.width, ref.height);
    }
  }, localProp.img);
  createEffect(() => {
    if (!fullscreen()) return;
    const [targetWidth, targetHeight] = targetSize();
    const ctx = ref.getContext("2d");
    ctx.clearRect(0, 0, ref.width, ref.height);
    ref.width = targetWidth;
    ref.height = targetHeight;
    ctx.drawImage(props.img, 0, 0, targetWidth, targetHeight);
  });
  createEffect(() => {
    if (fullscreen()) {
      window.addEventListener("scroll", refreshPos);
      onCleanup(() => {
        window.removeEventListener("scroll", refreshPos);
      });
    }
  });
  return createComponent(Modal, {
    get open() {
      return fullscreen();
    },
    onClose: () => {
      refreshPos();
      setEnableTransition(true);
      setFullscreen(false);
    },
    delay: 200,
    get children() {
      return [createComponent(Show, {
        get when() {
          return showSlot();
        },
        get children() {
          return [" ", memo(() => localProp.slotBefore)];
        }
      }), (() => {
        const _el$ = _tmpl$$1();
        _el$.addEventListener("transitionend", () => {
          setEnableTransition(false);
        });
        _el$.$$click = (e) => e.stopPropagation();
        const _ref$ = ref;
        typeof _ref$ === "function" ? use(_ref$, _el$) : ref = _el$;
        className(_el$, styleBase);
        spread(_el$, mergeProps({
          get style() {
            return {
              transition: enableTransition() ? "transform 0.2s ease-in-out" : void 0,
              get transform() {
                const [targetWidth, targetHeight] = targetSize();
                if (fullscreen()) {
                  const [clientWidth, clientHeight] = clientSize();
                  return `translate(${(clientWidth - targetWidth) / 2}px,${(clientHeight - targetHeight) / 2}px)`;
                } else {
                  if (!rect()) return "";
                  const {
                    x,
                    y,
                    height
                  } = rect();
                  const {
                    naturalWidth,
                    naturalHeight
                  } = localProp.img;
                  const ratio = naturalWidth / naturalHeight;
                  const scaleX = ratio * height / targetWidth;
                  const scaleY = height / targetHeight;
                  return `translate(${x}px,${y}px) scale(${scaleX},${scaleY})`;
                }
              }
            };
          }
        }, propForward), false, false);
        return _el$;
      })(), createComponent(Show, {
        get when() {
          return showSlot();
        },
        get children() {
          return [" ", memo(() => localProp.slotAfter)];
        }
      })];
    }
  });
}
delegateEvents(["click"]);

function renderLightbox(img, container) {
  return render(() => createComponent(FullscreenImage, {
    get img() {
      return img();
    }
  }), container);
}

const _tmpl$ = /* @__PURE__ */ template(`<button>`), _tmpl$2 = /* @__PURE__ */ template(`<div>/`);
const styleButton = css({
  backgroundColor: "rgb(0,0,0,0.6)",
  borderRadius: 8,
  color: "#eee",
  border: "none",
  transitionDuration: ".2s",
  transitionProperty: "background-color,color",
  fontSize: 24,
  fontWeight: "bold",
  aspectRatio: "1/1",
  paddingInline: "0.25em",
  marginInline: "0.25em",
  position: "absolute",
  left: 0,
  top: "45%",
  "&[aria-disabled]": {
    color: "#777"
  },
  "&:hover:not([aria-disabled])": {
    backgroundColor: "rgb(0,0,0,0.7)"
  },
  "&:active:not([aria-disabled])": {
    backgroundColor: "rgb(0,0,0,0.8)",
    color: "#fff"
  },
  "&[data-right]": {
    left: "unset",
    right: 0
  }
});
function GalleryMoveButton(props) {
  return (() => {
    const _el$ = _tmpl$();
    _el$.$$click = (e) => props.disabled ? e.stopPropagation() : props.onClick(e);
    className(_el$, styleButton);
    insert(_el$, () => props.toRight ? "►" : "◄");
    effect((_p$) => {
      const _v$ = props.disabled || void 0, _v$2 = props.toRight || void 0;
      _v$ !== _p$._v$ && setAttribute(_el$, "aria-disabled", _p$._v$ = _v$);
      _v$2 !== _p$._v$2 && setAttribute(_el$, "data-right", _p$._v$2 = _v$2);
      return _p$;
    }, {
      _v$: void 0,
      _v$2: void 0
    });
    return _el$;
  })();
}
const styleIndicator = css({
  position: "absolute",
  bottom: 0,
  right: 0,
  color: "#fff",
  backgroundColor: "#0008",
  padding: "0.5rem",
  borderRadius: "0.5rem",
  opacity: 0.5,
  transition: "all 0.2s",
  "&.moving,&:hoverd": {
    opacity: 1
  }
});
function PositionIndicator(props) {
  const setTimeout = useTimeout();
  const [moving, setMoving] = createSignal(false);
  createEffect(() => {
    if (props.delta) {
      setMoving(true);
      setTimeout(() => setMoving(false), 500);
    }
  });
  return (() => {
    const _el$2 = _tmpl$2(), _el$3 = _el$2.firstChild;
    className(_el$2, styleIndicator);
    insert(_el$2, () => props.curr, _el$3);
    insert(_el$2, () => props.total, null);
    effect(() => _el$2.classList.toggle("moving", !!moving()));
    return _el$2;
  })();
}
function Gallery(props) {
  const [currIndex, setCurrIndex] = createSignal(props.images.findIndex((img) => img === props.curr));
  createEffect(() => {
    if (props.images[currIndex()] !== props.curr) {
      setCurrIndex(props.images.findIndex((img) => img === props.curr));
    }
  });
  const hasNext = () => currIndex() < props.images.length - 1;
  const hasPrev = () => currIndex() > 0;
  const [delta, setDelta] = createSignal(0);
  const move = /* @__PURE__ */ (() => {
    let t;
    const deltaMax = () => props.images.length - 1 - currIndex();
    const deltaMin = () => -currIndex();
    return (direction) => {
      if (t !== void 0) clearTimeout(t);
      setDelta((prev) => {
        const next = prev + direction;
        if (next > deltaMax()) return deltaMax();
        if (next < deltaMin()) return deltaMin();
        return next;
      });
      t = requestAnimationFrame(() => {
        t = void 0;
        if (delta() !== 0) {
          const nextIndex = currIndex() + delta();
          props.onChange(props.images[currIndex() + delta()]);
          setCurrIndex(nextIndex);
          setDelta(0);
        }
      });
    };
  })();
  const handleKeydown = (e) => {
    switch (e.code) {
      case "ArrowRight":
      case "ArrowDown":
      case "KeyD":
        move(1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
      case "KeyA":
        move(-1);
        break;
      default:
        return;
    }
    e.preventDefault();
  };
  onMount(() => {
    window.addEventListener("keydown", handleKeydown);
  });
  onCleanup(() => {
    window.removeEventListener("keydown", handleKeydown);
  });
  return [createComponent(GalleryMoveButton, {
    get disabled() {
      return !hasPrev();
    },
    onClick: (e) => {
      e.stopPropagation();
      move(-1);
    }
  }), createComponent(GalleryMoveButton, {
    get disabled() {
      return !hasNext();
    },
    toRight: true,
    onClick: (e) => {
      e.stopPropagation();
      move(1);
    }
  }), createComponent(PositionIndicator, {
    get total() {
      return props.images.length;
    },
    get curr() {
      return currIndex() + 1;
    },
    get delta() {
      return delta();
    }
  })];
}
delegateEvents(["click"]);

export { FullscreenImage, Gallery, renderLightbox };
//# sourceMappingURL=index.mjs.map
