/* Widgets */

window.Widgets = {

  popupBoxWidth: 450,
  popupBoxHeight: 300,

  popupBoxOpen: function(url, params, name, opts) {
    opts = extend({
      width: this.popupBoxWidth,
      height: this.popupBoxHeight,
      onClose: null
    }, opts);

    params = extend({
      widget: 4
    }, params);

    if (browser.safari) opts.height += 45; /* safari popup window panel height, hardcoded to avoid popup jump */

    var left = Math.max(0, (screen.width - opts.width) / 2) + (screen.availLeft | 0),
        top = Math.max(0, (screen.height - opts.height) / 2) + (screen.availTop | 0);
    if (!/^https?:\/\//i.test(url)) {
      url = location.protocol + '//' + location.host + '/' + url.replace(/^\/+/, '');
    }
    window.activePopup = window.open(url + '?' + ajx2q(params), name, 'width='+opts.width+',height='+opts.height+',left='+left+',top='+top+',menubar=0,toolbar=0,location=0,status=0');
    if (activePopup) {
      activePopup.focus();
      opts.onClose && (function check() {
        !activePopup || activePopup.closed ? opts.onClose() : setTimeout(check, 1000);
      })();
    }
  },

  popupBoxAdjust: function(startWidth, startHeight, opts) {
    opts = extend({
      nocenter: false,
      container: false,
      forceWidth: false,
      forceHeight: false,
      minWidth: 0,
      minHeight: 0,
      attempts: 5,
      interval: 500
    }, opts);

    if (window.panelsHeight == void 0) window.panelsHeight = null;
    if (window.panelsWidth == void 0) window.panelsWidth = null;
    window.popupWidth = null;
    window.popupHeight = null;
    var interruptedCentering = opts.nocenter,
        interruptedResize = false,
        inter = 0,
        lastLeft = null,
        lastTop = null,
        loaded = false,
        resized = false,
        container = opts.container || geByClass1('box_layout') || ge('page_wrap'),
        scrollable = ge('box_layer_wrap') || bodyNode;

    if (!container || !scrollable) return;
    if (!startWidth) startWidth = this.popupBoxWidth;
    if (!startHeight) startHeight = this.popupBoxHeight;
    fixScrolls(true);

    function sL() {return window.screenX !== void 0 ? screenX : window.screenLeft;}
    function sT() {return window.screenY !== void 0 ? screenY : window.screenTop;}

    function adjust() {
      if ((interruptedCentering || opts.nocenter) && interruptedResize) return;
      if (!interruptedCentering && lastLeft !== null && lastTop !== null && (lastLeft !== sL() || lastTop !== sT())) interruptedCentering = true;

      var containerWidth = container.scrollWidth,
          containerHeight = container.scrollHeight,
          width = Math.max(opts.minWidth, (opts.forceWidth ? startWidth : containerWidth)) + panelsWidth,
          height = Math.max(opts.minHeight, (opts.forceHeight ? startHeight : containerHeight)) + panelsHeight;

      if (screen.availWidth && screen.availHeight) {
        width = Math.min(screen.availWidth, width);
        height = Math.min(screen.availHeight, height);
      }

      if (width != popupWidth || height != popupHeight) {
        popupWidth = width + (containerHeight + panelsHeight > height ? sbWidth() + 1 : 0);
        popupHeight = height;
        resized = +new Date();

        interruptedCentering || opts.nocenter || window.moveTo(
          Math.floor((screen.width - popupWidth+ (browser.safari ? -panelsWidth : panelsWidth)) / 2) + (screen.availLeft | 0),
          Math.floor((screen.height - popupHeight + (browser.safari ? -panelsHeight : panelsHeight)) / 2) + (screen.availTop | 0)
        );

        window.resizeTo(popupWidth, popupHeight);
      }

      setTimeout(function() {
        if (!interruptedCentering) {
          lastLeft = sL();
          lastTop = sT();
        }
        onBodyResize();
      }, 0);
    }

    function fixScrolls(partly) {
      scrollable.style.overflow = 'hidden';
      !partly && setTimeout(function() {
        scrollable.style.overflow = '';
      }, 0);
    }

    function startAdjustment(newOpts) {
      if (interruptedCentering && interruptedResize) return;
      clearInterval(inter);
      newOpts && extend(opts, newOpts);

      if (panelsHeight === null) {
        if (window.innerWidth == void 0 || window.outerWidth == void 0) {
          resized = +new Date();
          window.resizeTo(startWidth, startHeight);
          panelsWidth = startWidth - (document.documentElement.clientWidth || document.body.clientWidth);
          panelsHeight = startHeight - (document.documentElement.clientHeight || document.body.clientHeight);
        } else {
          panelsWidth = outerWidth - innerWidth;
          panelsHeight = outerHeight - innerHeight;
        }
      }

      adjust();

      var i = 0;
      inter = setInterval(function() {
        adjust();
        if (++i >= opts.attempts) {
          clearInterval(inter);
        }
      }, opts.interval);
    }

    if (document.readyState === "complete") {
      loaded = true;
      fixScrolls();
    }
    addEvent(window, 'load', function() {
      loaded = true;
      fixScrolls();
    });

    addEvent(window, 'resize', function self() {
      if (!loaded) return;
      if (resized && (+new Date() - resized < 1000)) {
        resized = false;
        fixScrolls();
        return;
      }
      interruptedCentering = interruptedResize = true;
      clearInterval(inter);
      removeEvent(window, 'resize', self);
    });

    setTimeout(startAdjustment, 1);
    return startAdjustment;
  },

  oauth: function(options, params) {
    if (vk.show_external_auth_box) {
      return Widgets.popupBoxOpen(location.origin + '/al_settings.php', extend({
        act: 'external_auth_box',
        widget_hash: cur.widgetHash,
      }, isObject(params) ? params : {}), 'vk_external_auth', extend({
        width: 655,
        height: 171,
        onClose: function() {
          location.reload();
        }
      }, isObject(options) ? options : {}));
    }
    Widgets.popupBoxOpen(location.protocol + '//oauth.vk.com/authorize', extend({
      client_id: -1,
      redirect_uri: 'close.html',
      display: 'widget'
    }, isObject(params) ? params : {}), 'vk_openapi', extend({
      width: 655,
      height: 430,
      onClose: window.gotSession ? window.gotSession.pbind(true) : void 0
    }, isObject(options) ? options : {}));
  },

  showTooltip: (function(showTooltip) {
    return function() {
      var args = [].slice.call(arguments);
      args[1] = extend(args[1] || {}, {
        showIfFit: true
      });
      return showTooltip.apply(this, args);
    }
  })(window.showTooltip),

  showReCaptchaBox: function(key, lang, box, o) {
    showBox('al_apps.php', {
      act: 'show_recaptcha_box',
      box_msg: o.addText,
      widget_width: 352
    });
    cur.Rpc.methods.recaptcha = o.onSubmit || function() {};
    cur.Rpc.methods.recaptchaHide = function() {
      isFunction(cur.recaptchaHide) && cur.recaptchaHide();
      isFunction(o.onHide) && o.onHide();
    }
  },

  showPhoto: function(photo, list) {
    return showBox('al_photos.php', {
      act: 'photo_box',
      photo: photo,
      wall_owner: photo.split('_')[0],
      list: list,
      widget_width: 654
    });
  },

  showVideo: function(video, list) {
    window.revertLastInlineVideo && revertLastInlineVideo();
    return showBox('al_video.php', {
      act: 'video_box',
      video: video,
      list: list,
      wall_owner: video.split('_')[0],
      widget_width: 780,
      module: cur.module || '_alpost'
    });
  },

  showSubscribeBox: function(oid, callback, state, isEvent) {
    window.subscribedCallback = callback ? callback : function() {};
    Widgets.popupBoxOpen('widget_community.php', {
      act: 'a_subscribe_box',
      oid: oid,
      state: state !== void 0 ? state : 1,
      is_event: isEvent ? 1 : void 0
    }, 'vk_subscribe', {
      height: 291
    });
  },

  showUnsubscribeBox: function(oid, callback) {
    window.unsubscribedCallback = callback ? callback : function() {};
    Widgets.popupBoxOpen('widget_community.php', {
      act: 'a_unsubscribe_box',
      oid: oid
    }, 'vk_unsubscribe', {
      height: 291
    });
  },

  showBox: function(allowed, onbefore) {
    var originalShowBox = window.showBox;

    allowed = extend(allowed || {}, {
      'blank.php': true,
      'al_apps.php': {'show_recaptcha_box': true}
    });

    return function(url, params, options, e) {
      if (allowed[url] && (!isObject(allowed[url]) || allowed[url][params.act])) {
        window.tooltips && tooltips.hideAll();
        onbefore && onbefore();

        if (isObject(allowed[url]) && allowed[url][params.act] && isObject(allowed[url][params.act].params)) {
          extend(params, allowed[url][params.act].params);
        }

        if (vk.amp) {
          Widgets.popupBoxOpen(url, extend({
            widget_hash: cur.widgetHash,
          }, params), url+'_'+params.act, {
            width: params.widget_width || void 0,
            height: params.widget_height || void 0,
          });
        } else {
          var stat = params.act && isObject(allowed[url]) && allowed[url][params.act].stat;
          stat && cur.Rpc.callMethod('showLoader', true);

          stManager.add(stat || [], function() {
            params = extend({
              widget_hash: cur.widgetHash,
              widget: 2,
              scrollbar_width: window.sbWidth(),
              widget_width: options && options.params && intval(options.params.width) || void(0)
            }, params);
            cur.Rpc.callMethod('showBox', url+'?' + ajx2q(params), {
              height: window.outerHeight || screen.availHeight || 768,
              width: window.outerWidth || screen.availWidth || 1028,
              base_domain: '//' + location.hostname + '/'
            });
          });
        }
      } else {
        debugLog('Forbidden request: '+params.act+' in '+url);
        return true;
      }
      return false;
    }
  },

  hideBox: function() {
    window.Rpc && Rpc.callMethod('destroy');
  },

  showInlineVideo: function(videoId, listId, options, ev, thumb) {
    if (checkEvent(ev)) return true;

    if (window.mvcur && mvcur.mvShown) {
      return showVideo(videoId, listId, options, ev);
    }

    options = options || {};
    options.params = options.params || {act: 'show_inline', video: videoId, list: listId, autoplay: (options.autoplay) ? 1 : 0, module: options.module || cur.module || ''};
    if (!trim(options.params.module)) {
      extend(options.params, { _nol: JSON.stringify(nav.objLoc) });
    }
    var h = thumb.clientHeight,
        w = thumb.clientWidth,
        btn = geByClass1('video_play_inline', thumb, 'div');

    extend(options.params, {width: w, height: h});
    extend(options.params, options.addParams);

    options.onDone = function (title, html, js, opts) {
      revertLastInlineVideo();
      hide(thumb);
      var videoWrap = ce('div', {id: 'page_video_inline_wrap' + videoId, className: 'page_video_inline_wrap', innerHTML: html}, {width: w, height: h}),
          videoBg = ge('video_background' + videoId);
      _videoLastInlined = [videoWrap, thumb]
      thumb.parentNode.appendChild(videoWrap);
      videoBg && setStyle(geByTag1('img', videoBg), {width: w, height: h});
      cur.mvOpts = opts && opts.mvData ? opts.mvData : false;
      if (opts.player) {
        var container = domByClass(videoWrap, 'video_box_wrap');
        VideoInitializer.initPlayer(container, opts.player.type, opts.player.params);
      }
      try {
        eval('(function () {' + js + '})();');
      } catch (e) {
      }

      if (!options.params.mute) {
        var _n = window.Notifier, _a = window.audioPlayer;
        if (_n) setTimeout(function() { _n.lcSend('video_start'); }, 0);
        if (_a && _a.player && !_a.player.paused()) {
          _a.pauseTrack();
          _a.pausedByVideo = 1;
        }
      }
    };
    options.onFail = function(text) {
      showBox('blank.php', {code: 1901});
      return true;
    }
    options.showProgress = function () {
      addClass(btn, 'video_play_inline_loading');
    };
    options.hideProgress = function () {
      removeClass(btn, 'video_play_inline_loading');
    };
    stManager.add('videoview.js', function() {
      ajax.post('al_video.php', options.params, options);
      vkImage().src = locProtocol + '//vk.com/rtrg?r=w*Z1Flwi3QdbWaoLMc7zOA*7Cr4Nrtojr9otHjsjIhsb2CVqRWalgbvxZw3MzxZa6be3Siu2XY3gvK5fysYtWLWgNwHMpjRTupSGZrcGRNlj7fduqq9*t7ij6CX4aMcBTD5be8mIXJsbTsvP8Zl2RZEd76a4FTuCOFqzMxqGtFc-';
    });
    return false;
  },

  revertLastInlineVideo: function(ancestor) {
    if (!_videoLastInlined) {
      return;
    }
    var current, found = false;
    if ((ancestor = ge(ancestor)) &&
        (current = _videoLastInlined[0])) {
      while (current = current.parentNode) {
        if (current == ancestor) {
          found = true;
          break;
        }
      }
      if (!found) {
        return;
      }
    }
    re(_videoLastInlined[0]);
    show(_videoLastInlined[1]);
    _videoLastInlined = false;
    delete cur.mvOpts;
  },

  pauseLastInlineVideo: function() {
    if (!_videoLastInlined) {
      return;
    }
    var player = ge('video_player') || window.html5video || null;
    if (player && player.playVideo) {
      player.playVideo(false);
    }
  }

};