'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const web = require('solid-js/web');
const css = require('@emotion/css');
const awaitRes = require('await-res');
const solidJs = require('solid-js');

function delaySignal(readOnlySignal, delay) {
  const [deferred, setDeferred] = solidJs.createSignal(readOnlySignal());
  let timer;
  solidJs.createComputed(
    solidJs.on(
      readOnlySignal,
      () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          setDeferred(solidJs.untrack(readOnlySignal));
        }, delay);
      },
      { defer: true }
    )
  );
  solidJs.onCleanup(() => {
    clearTimeout(timer);
  });
  return deferred;
}

function useTimeout() {
  let timers = [];
  let timersTicked = [];
  const clear = () => {
    timers.forEach((id) => clearTimeout(id));
    timers = [];
    timersTicked = [];
  };
  solidJs.onCleanup(clear);
  const set = (handler, timeout) => {
    const timer = setTimeout(
      () => {
        handler();
        if (timers.length === timersTicked.length + 1) {
          clear();
        } else {
          timersTicked.push(timer);
        }
      },
      timeout
    );
    timers.push(timer);
  };
  return [set, clear];
}

const _tmpl$$1 = /*#__PURE__*/web.template(`<div></div>`, 2);
const styleModal = css.css({
  /*CSS contributor 
  作者：heibaimeng
  链接：https://juejin.im/post/5cf3d3ba5188257c6b5171fd
  来源：掘金
  著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。 */
  position: "fixed",
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  width: "100%",
  zIndex: 9999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backdropFilter: 'unset',
  backgroundColor: "#0000",
  transition: "all 500ms ease-in",
  "& > div": {
    margin: "0.8rem",
    overflow: "auto",
    maxHeight: "98vh"
  }
});
const styleOpenned = css.css({
  backdropFilter: 'blur(5px)',
  backgroundColor: "rgba(0, 0, 0, 0.50)"
});
function Modal(props) {
  const [localProp, forwardProp] = solidJs.splitProps(props, ['open', 'onClose', 'delay', 'style']);
  const [setTimeout] = useTimeout();
  const [visibility, setVisibility] = solidJs.createSignal(localProp.open);
  solidJs.createEffect(solidJs.on(() => localProp.open, () => {
    if (visibility() !== localProp.open) {
      if (localProp.open) {
        setVisibility(true);
      } else {
        setTimeout(() => setVisibility(false), localProp.delay ?? 500);
      }
    }
  }, {
    defer: true
  }));
  return (() => {
    const _el$ = _tmpl$$1.cloneNode(true);
    web.spread(_el$, web.mergeProps({
      get onClick() {
        return localProp.onClose;
      },
      get style() {
        return {
          visibility: visibility() ? 'visible' : 'hidden',
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

const _tmpl$ = /*#__PURE__*/web.template(`<img>`, 1);
const modalPadding = 10;
const styleBase = css.css({
  position: 'absolute',
  top: 0,
  left: 0,
  userSelect: 'none',
  "&::after": {
    background: 'red',
    width: '100vw',
    height: '100vh',
    position: 'absolute',
    top: 0,
    left: 0,
    content: '""'
  }
});
function FullscreenImage(props) {
  const [fullscreen, setFullscreen] = solidJs.createSignal(false);
  const [rect, setRect] = solidJs.createSignal();
  const [targetSize, setTargetSize] = solidJs.createSignal();
  const [localProp, propForward] = solidJs.splitProps(props, ['img']);
  /**
   * 图片原始纵横比下的宽度
   */
  const [width, setWidth] = solidJs.createSignal(0);
  const refreshPos = () => {
    setRect(localProp.img?.getBoundingClientRect());
  };
  const resize = () => {
    const height = rect().height; //要求与stillStyle一致
    const {
      naturalWidth,
      naturalHeight
    } = localProp.img;
    let targetHeight;
    let targetWidth;
    targetHeight = document.documentElement.clientHeight - modalPadding * 4;
    targetWidth = targetHeight * naturalWidth / naturalHeight;
    const availWidth = document.documentElement.clientWidth;
    if (targetWidth > availWidth) {
      targetWidth = availWidth - modalPadding * 4;
      targetHeight = targetWidth / naturalWidth * naturalHeight;
    }
    solidJs.batch(() => {
      setWidth(height * naturalWidth / naturalHeight);
      setTargetSize([targetWidth, targetHeight]);
    });
  };
  const refresh = () => {
    if (!localProp.img) return;
    solidJs.batch(() => {
      refreshPos();
      resize();
    });
  };
  const open = () => {
    //if (!isImageReady()) return
    refresh();
    window.setTimeout(() => {
      // 等待style提交到浏览器并生效
      setEnableTransition(true);
      setFullscreen(true);
    });
  };
  const [enableTransition, setEnableTransition] = solidJs.createSignal(false);
  const showImage = delaySignal(fullscreen, 100);
  solidJs.createComputed(solidJs.on(() => localProp.img, () => {
    localProp.img && awaitRes.awaitImage(localProp.img).then(open);
  }, {
    defer: true
  }));
  solidJs.onMount(() => {
    window.addEventListener('scroll', refreshPos);
    window.addEventListener('resize', refresh);
  });
  solidJs.onCleanup(() => {
    window.removeEventListener('scroll', refreshPos);
    window.removeEventListener('resize', refresh);
  });
  const style = solidJs.createMemo(() => {
    if (!rect() || !targetSize()) {
      return undefined;
    }
    const height = rect().height;
    const targetWidth = targetSize()[0];
    const targetHeight = targetSize()[1];
    const scaleX = width() / targetWidth;
    const scaleY = height / targetHeight;
    return {
      transform: showImage() ? `translate(${(document.documentElement.clientWidth - targetWidth) / 2}px,${(document.documentElement.clientHeight - targetHeight) / 2}px)` : `translate(${rect().x}px,${rect().y}px) scale(${scaleX},${scaleY})`,
      width: `${targetWidth}px`,
      height: `${targetHeight}px`,
      'transform-origin': 'left top',
      transition: enableTransition() && 'all 0.3s ease-in-out'
    };
  });

  // observable(style).subscribe(console.log)
  return web.createComponent(Modal, {
    get open() {
      return fullscreen();
    },
    onClose: () => {
      setFullscreen(false);
    },
    get children() {
      const _el$ = _tmpl$.cloneNode(true);
      web.className(_el$, styleBase);
      web.spread(_el$, web.mergeProps({
        get style() {
          return style();
        },
        get onTransitionEnd() {
          return !fullscreen() ? () => {
            setEnableTransition(false);
          } : undefined;
        }
      }, propForward), false, false);
      return _el$;
    }
  });
}

function renderLightbox(img, container) {
  return web.render(() => web.createComponent(FullscreenImage, {
    get src() {
      return img()?.src;
    },
    get img() {
      return img();
    }
  }), container);
}

exports.FullscreenImage = FullscreenImage;
exports.renderLightbox = renderLightbox;
//# sourceMappingURL=index.js.map
