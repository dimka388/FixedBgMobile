// page init
jQuery(window).load(function(){
	initBackgroundFixed();
});

// background attachment fixed emulation
function initBackgroundFixed() {
	jQuery('.wrapper').backgroundFixed({
		contentBlocks: 'section'
	});
}

/*
 * jQuery background fixed plugin
 */
 ;(function($, window) {
	function BackgroundFixed(options) {
		this.options = $.extend({
			disablePageScroll: 'scroll-disabled',
			clearBackground: 'no-background-image',
			contentBlocks: 'section',
			contentWrapperName: '.js-content-wrapper',
			contentWrapper: '<div class="js-content-wrapper"/>',
			page: 'html',
			bgHolder: 'body',
			bgWrapper: '<div class="js-background-wrapper"/>',
			bgSlide: '<div class="js-background-slide"/>',
			bgSlideImage: '<div/>'
		}, options);
		this.init();
	}
	BackgroundFixed.prototype = {
		init: function() {
			this.findElements();
			this.attachEvents();
			this.makeCallback('onInit', this);
		},
		findElements: function() {
			this.obj = $(this.options.holder);
			this.page = $(this.options.page);
			this.bgHolder = $(this.options.bgHolder);
			this.bgWrapper = null;
			this.scrollHelper = null;
			this.blocks = [];
			this.contentBlocks = this.obj.find(this.options.contentBlocks);
		},
		attachEvents: function() {
			var self = this;
			this.contentBlocks.each(function() {
				var block = jQuery(this);
				var bgUrl = block.css('background-image');
				if (bgUrl === 'none' || block.is(':hidden')) {
					return;
				}
				var scrollHandler = function() {
					self.refreshSlide(blockObj);
				};
				var resizeHandler = function() {
					blockObj.height = block.outerHeight();
					blockObj.offset = block.position().top;
					slide.css({
						height: blockObj.height
					});
					scrollHandler();
				};
				var refreshHandler = function() {
					bgUrl = block.css('background-image');
					image.css({ backgroundImage: bgUrl !== 'none' ? bgUrl : '' });
				};
				// create background wrapper
				if (self.bgWrapper === null) {
					self.bgWrapper = $(self.options.bgWrapper).prependTo(self.bgHolder);
				}
				// create slide
				var slide = $(self.options.bgSlide).appendTo(self.bgWrapper);
				var image = $(self.options.bgSlideImage).css({ backgroundImage: bgUrl }).appendTo(slide);
				var blockObj = {
					slide: slide,
					image: image,
					blockHeight: block.outerHeight(),
					blockOffset: block.position().top
				};
				// init scroll helper
				if (self.scrollHelper === null) {
					self.initScrollHelper();
				}
				// window handlers
				$(window).on({
					resize: resizeHandler,
					orientationchange: resizeHandler
				});
				resizeHandler();
				self.blocks.push(block);
				block.on({
					refresh:scrollHandler,
					refreshBg:refreshHandler
				}).addClass(self.options.clearBackground);
			});
		},
		refreshSectionBg: function() {
			var self = this;
			this.fireScrollEvent = function() {
				for (var i in self.blocks) {
					self.blocks[i].trigger('refreshBg');
				}
			};
		},
		initScrollHelper: function() {
			var self = this;
			// lock page scroll
			this.page.addClass(this.options.disablePageScroll);
			// create content wrapper
			this.contentWrapper = $(this.options.contentWrapper);
			this.obj.wrap(this.contentWrapper);
			this.fireScrollEvent = function() {
				for (var i in self.blocks) {
					self.blocks[i].trigger('refresh');
				}
			};
			// init helper
			this.scrollHelper = new IScroll(self.options.contentWrapperName, {
				click: true,
				probeType: 3
			});
			this.scrollHelper.on('scroll', self.fireScrollEvent);
			this.scrollHelper.on('scrollEnd', self.fireScrollEvent);
		},
		destroyScrollHalper: function() {
			this.page.removeClass(this.options.disablePageScroll);
			this.obj.unwrap(this.contentWrapper).removeAttr('style');
		},
		refreshSlide: function(blockObj) {
			var positionY = blockObj.offset + this.scrollHelper.y;
			blockObj.slide.css({
				webkitTransform: 'translate3d(0,' + positionY + 'px, 0)',
				MozTransform: 'translate3d(0,' + positionY + 'px, 0)',
				msTransform: 'translate3d(0,' + positionY + 'px, 0)',
				OTransform: 'translate3d(0,' + positionY + 'px, 0)',
				transform: 'translate3d(0,' + positionY + 'px, 0)'
			});
			blockObj.image.css({
				webkitTransform: 'translate3d(0, ' + (-positionY) + 'px, 0)',
				MozTransform: 'translate3d(0, ' + (-positionY) + 'px, 0)',
				msTransform: 'translate3d(0, ' + (-positionY) + 'px, 0)',
				OTransform: 'translate3d(0, ' + (-positionY) + 'px, 0)',
				transform: 'translate3d(0, ' + (-positionY) + 'px, 0)'
			});
		},
		makeCallback: function(name) {
			if (typeof this.options[name] === 'function') {
				var args = Array.prototype.slice.call(arguments);
				args.shift();
				this.options[name].apply(this, args);
			}
		},
		destroy: function() {
			var self = this;
			this.contentBlocks.each(function() {
				$(this).removeClass(self.options.clearBackground);
			});
			if (this.bgWrapper !== null) {
				this.bgWrapper.remove();
			}
			if (this.scrollHelper !== null) {
				this.destroyScrollHalper();
			}
			this.obj.removeData('BackgroundFixed');
		}
	};
	$.fn.backgroundFixed = function(options) {
		return this.each(function() {
			$(this).data('BackgroundFixed', new BackgroundFixed($.extend(options, {holder: this})));
		});
	};
}(jQuery, window));
