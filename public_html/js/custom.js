// JavaScript Document


	$(window).on('load', function() {
	
		"use strict";

		/*----------------------------------------------------*/
		/*	Modal Window
		/*----------------------------------------------------*/
			
		// Keep promotional modals manual. Auto-popups block the hero, hurt mobile UX, and interrupt booking intent.
		$(".modal").addClass("auto-off");
				
	});


	$(window).on('scroll', function() {
		
		"use strict";
					
		/*----------------------------------------------------*/
		/*	Navigtion Menu Scroll
		/*----------------------------------------------------*/	
		
		var b = $(window).scrollTop();
		
		if( b > 80 ){		
			$(".wsmainfull").addClass("scroll");
		} else {
			$(".wsmainfull").removeClass("scroll");
		}				

	});


	$(document).ready(function() {
			
		"use strict";

		$('#loading').hide();


		if ( typeof WOW !== 'undefined' ) { new WOW().init(); }


		/*----------------------------------------------------*/
		/*	Mobile Menu Toggle
		/*----------------------------------------------------*/

		if ( $(window).outerWidth() < 992 ) {
			$('.wsmenu-list li.nl-simple, .wsmegamenu li, .sub-menu li').on('click', function() {				
				 $('body').removeClass("wsactive");	
				 $('.sub-menu').slideUp('slow');
     			 $('.wsmegamenu').slideUp('slow');	
     			 $('.wsmenu-click').removeClass("ws-activearrow");
        		 $('.wsmenu-click02 > i').removeClass("wsmenu-rotate");
			});
		}

		if ( $(window).outerWidth() < 992 ) {
			$('.wsanimated-arrow').on('click', function() {				
				 $('.sub-menu').slideUp('slow');
     			 $('.wsmegamenu').slideUp('slow');	
     			 $('.wsmenu-click').removeClass("ws-activearrow");
        		 $('.wsmenu-click02 > i').removeClass("wsmenu-rotate");
			});
		}


		/*----------------------------------------------------*/
		/*	ScrollTo
		/*----------------------------------------------------*/

		$.scrollTo = $.fn.scrollTo = function(x, y, options){
		    if (!(this instanceof $)) return $.fn.scrollTo.apply($('html, body'), arguments);

		    options = $.extend({}, {
		        gap: {
		            x: 0,
		            y: 0
		        },
		        animation: {
		            easing: 'easeInSine',
		            duration: 'slow',
		            complete: $.noop,
		            step: $.noop
		        }
		    }, options);

		    return this.each(function(){
		        var elem = $(this);
		        elem.stop().animate({
		            scrollLeft: !isNaN(Number(x)) ? x : $(y).offset().left + options.gap.x,
		            scrollTop: !isNaN(Number(y)) ? y : $(y).offset().top + options.gap.y - 69 // *edited
		        }, options.animation);
		    });
		};


	    /*----------------------------------------------------*/
		/*	ScrollUp
		/*----------------------------------------------------*/
		
		$.scrollUp = function (options) {

			// Defaults
			var defaults = {
				scrollName: 'scrollUp', // Element ID
				topDistance: 600, // Distance from top before showing element (px)
				topSpeed: 800, // Speed back to top (ms)
				animation: 'fade', // Fade, slide, none
				animationInSpeed: 200, // Animation in speed (ms)
				animationOutSpeed: 200, // Animation out speed (ms)
				scrollText: '', // Text for element
				scrollImg: false, // Set true to use image
				activeOverlay: false // Set CSS color to display scrollUp active point, e.g '#00FFFF'
			};

			var o = $.extend({}, defaults, options),
				scrollId = '#' + o.scrollName;

			// Create element
			$('<a/>', {
				id: o.scrollName,
				href: '#top',
				title: o.scrollText
			}).appendTo('body');
			
			// If not using an image display text
			if (!o.scrollImg) {
				$(scrollId).text(o.scrollText);
			}

			// Minium CSS to make the magic happen
			$(scrollId).css({'display':'none','position': 'fixed','z-index': '99999'});

			// Active point overlay
			if (o.activeOverlay) {
				$("body").append("<div id='"+ o.scrollName +"-active'></div>");
				$(scrollId+"-active").css({ 'position': 'absolute', 'top': o.topDistance+'px', 'width': '100%', 'border-top': '1px dotted '+o.activeOverlay, 'z-index': '99999' });
			}

			// Scroll function
			$(window).on('scroll', function(){	
				switch (o.animation) {
					case "fade":
						$( ($(window).scrollTop() > o.topDistance) ? $(scrollId).fadeIn(o.animationInSpeed) : $(scrollId).fadeOut(o.animationOutSpeed) );
						break;
					case "slide":
						$( ($(window).scrollTop() > o.topDistance) ? $(scrollId).slideDown(o.animationInSpeed) : $(scrollId).slideUp(o.animationOutSpeed) );
						break;
					default:
						$( ($(window).scrollTop() > o.topDistance) ? $(scrollId).show(0) : $(scrollId).hide(0) );
				}
			});

		};
		
		$.scrollUp();


		/*----------------------------------------------------*/
		/*	Homepage Blog Cards
		/*----------------------------------------------------*/

		$(document).on("click", "body.ssense-home-refined #blog-1 .ssense-blog-card", function(e) {
			if ($(e.target).closest("a, button, input, textarea, select, label").length) return;

			var href = $(this).find("a.stretched-link").attr("href");
			if (href) window.location.href = href;
		});


		/*----------------------------------------------------*/
		/*	Accordion
		/*----------------------------------------------------*/

		function syncAccordionAria(item) {
			var isActive = item.hasClass("is-active");
			item.children(".accordion-thumb").attr("aria-expanded", isActive ? "true" : "false");
			item.children(".accordion-panel").attr("aria-hidden", isActive ? "false" : "true");
		}

		function isWhyAccordion(item) {
			return item.closest("#why-ssense").length > 0;
		}

		function setWhyPanel(item, open, immediate) {
			var panel = item.children(".accordion-panel")[0];
			if (!panel) return;

			var $panel = $(panel);
			$panel.off("transitionend.ssenseWhyAccordion");

			if (immediate) {
				panel.style.transition = "none";
				panel.style.overflow = open ? "visible" : "hidden";
				panel.style.display = open ? "block" : "none";
				panel.style.height = open ? "auto" : "0px";
				panel.style.opacity = open ? "1" : "0";
				panel.offsetHeight;
				panel.style.transition = "";
				return;
			}

			panel.style.display = "block";
			panel.style.overflow = "hidden";
			panel.style.transition = "none";

			if (open) {
				panel.style.height = "0px";
				panel.style.opacity = "0";
				panel.offsetHeight;
				panel.style.transition = "";
				requestAnimationFrame(function() {
					panel.style.height = panel.scrollHeight + "px";
					panel.style.opacity = "1";
				});
				$panel.on("transitionend.ssenseWhyAccordion", function(e) {
					if (e.originalEvent.propertyName !== "height" || !item.hasClass("is-active")) return;
					panel.style.height = "auto";
					panel.style.overflow = "visible";
					$panel.off("transitionend.ssenseWhyAccordion");
				});
			} else {
				panel.style.height = panel.getBoundingClientRect().height + "px";
				panel.style.opacity = getComputedStyle(panel).opacity;
				panel.offsetHeight;
				panel.style.transition = "";
				requestAnimationFrame(function() {
					panel.style.height = "0px";
					panel.style.opacity = "0";
				});
				$panel.on("transitionend.ssenseWhyAccordion", function(e) {
					if (e.originalEvent.propertyName !== "height" || item.hasClass("is-active")) return;
					panel.style.display = "none";
					$panel.off("transitionend.ssenseWhyAccordion");
				});
			}
		}

		$("ul.accordion > .accordion-item").each(function() {
			var $item = $(this);
			syncAccordionAria($item);
			if (isWhyAccordion($item)) {
				setWhyPanel($item, $item.hasClass("is-active"), true);
			} else if ($item.hasClass("is-active")) {
				$item.children(".accordion-panel").slideDown(0);
			}
		});

		$("ul.accordion").on("click", ".accordion-item", function() {
			var $item = $(this);
			var $panel = $item.children(".accordion-panel");
			var wasActive = $item.hasClass("is-active");

			if (isWhyAccordion($item)) {
				$item.siblings(".accordion-item.is-active").each(function() {
					var $sibling = $(this).removeClass("is-active");
					syncAccordionAria($sibling);
					setWhyPanel($sibling, false, false);
				});

				$item.toggleClass("is-active", !wasActive);
				syncAccordionAria($item);
				setWhyPanel($item, !wasActive, false);
				return;
			}

			$item.siblings(".accordion-item").removeClass("is-active").each(function() {
				syncAccordionAria($(this));
				$(this).children(".accordion-panel").stop(true, true).slideUp();
			});

			$item.toggleClass("is-active");
			syncAccordionAria($item);

			if (wasActive) {
				$panel.stop(true, true).slideUp();
			} else {
				$panel.stop(true, true).slideDown();
			}
		});

		$("ul.accordion").on("keydown", ".accordion-thumb", function(e) {
			if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
				e.preventDefault();
				$(this).closest(".accordion-item").trigger("click");
			}
		});


		/*----------------------------------------------------*/
		/*	DateTimePicker
		/*----------------------------------------------------*/

	    if ($.fn.datetimepicker) {
			$('#datetimepicker').datetimepicker();
		}


		/*----------------------------------------------------*/
		/*	Single Image Lightbox
		/*----------------------------------------------------*/
				
		$('.image-link').magnificPopup({
		  type: 'image'
		});	


		/*----------------------------------------------------*/
		/*	Video Link #1 Lightbox
		/*----------------------------------------------------*/
		
		$('.video-popup1').magnificPopup({
		    type: 'iframe',		  	  
				iframe: {
					patterns: {
						youtube: {			   
							index: 'youtube.com',
							src: 'https://www.youtube.com/embed/SZEflIVnhH8'				
								}
							}
						}		  		  
		});


		/*----------------------------------------------------*/
		/*	Video Link #2 Lightbox
		/*----------------------------------------------------*/
		
		$('.video-popup2').magnificPopup({
		    type: 'iframe',		  	  
				iframe: {
					patterns: {
						youtube: {			   
							index: 'youtube.com',
							src: 'https://www.youtube.com/embed/7e90gBu4pas'				
								}
							}
						}		  		  
		});


		/*----------------------------------------------------*/
		/*	Video Link #3 Lightbox
		/*----------------------------------------------------*/
		
		$('.video-popup3').magnificPopup({
		    type: 'iframe',		  	  
				iframe: {
					patterns: {
						youtube: {			   
							index: 'youtube.com',
							src: 'https://www.youtube.com/embed/0gv7OC9L2s8'					
								}
							}
						}		  		  
		});

		$(document).on('click', 'body.ssense-gallery-page #gallery-1 .gallery-image', function(e) {
			if ($(e.target).closest('a').length) return;

			var link = $(this).find('a.image-link, a.video-popup1, a.video-popup2, a.video-popup3').first();
			if (link.length) link.trigger('click');
		});


		/*----------------------------------------------------*/
		/*	Testimonials Rotator
		/*----------------------------------------------------*/
	
		var owl = $('.reviews-1-wrapper, .reviews-2-wrapper');
			owl.owlCarousel({
				items: 3,
				loop:true,
				autoplay:true,
				navBy: 1,
				autoplayTimeout: 4500,
				autoplayHoverPause: true,
				smartSpeed: 1500,
				responsive:{
					0:{
						items:1
					},
					767:{
						items:1
					},
					768:{
						items:2
					},
					991:{
						items:3
					},
					1000:{
						items:3
					}
				}
		});


		/*----------------------------------------------------*/
		/*	Brands Logo Rotator
		/*----------------------------------------------------*/
	
		var owl = $('.brands-carousel-5');
			owl.owlCarousel({
				items: 5,
				loop:true,
				autoplay:true,
				navBy: 1,
				nav:false,
				autoplayTimeout: 4000,
				autoplayHoverPause: false,
				smartSpeed: 2000,
				responsive:{
					0:{
						items:2
					},
					550:{
						items:3
					},
					767:{
						items:3
					},
					768:{
						items:5
					},
					991:{
						items:6
					},				
					1000:{
						items:5
					}
				}
		});


		/*----------------------------------------------------*/
		/*	Brands Logo Rotator
		/*----------------------------------------------------*/
	
		var owl = $('.brands-carousel-6');
			owl.owlCarousel({
				items: 5,
				loop:true,
				autoplay:true,
				navBy: 1,
				nav:false,
				autoplayTimeout: 4000,
				autoplayHoverPause: false,
				smartSpeed: 2000,
				responsive:{
					0:{
						items:2
					},
					550:{
						items:3
					},
					767:{
						items:3
					},
					768:{
						items:5
					},
					991:{
						items:6
					},				
					1000:{
						items:6
					}
				}
		});


		/*----------------------------------------------------*/
		/*	Newsletter Subscribe Form
		/*----------------------------------------------------*/
	
		if ($.fn.ajaxChimp) {
		$('.newsletter-form').ajaxChimp({
        language: 'cm',
        url: 'https://dsathemes.us3.list-manage.com/subscribe/post?u=af1a6c0b23340d7b339c085b4&id=344a494a6e'
            //http://xxx.xxx.list-manage.com/subscribe/post?u=xxx&id=xxx
		});

		$.ajaxChimp.translations.cm = {
			'submit': 'Submitting...',
			0: 'We have sent you a confirmation email',
			1: 'Please enter your email address',
			2: 'An email address must contain a single @',
			3: 'The domain portion of the email address is invalid (the portion after the @: )',
			4: 'The username portion of the email address is invalid (the portion before the @: )',
			5: 'This email address looks fake or invalid. Please enter a real email address'
		};
		}


		/*----------------------------------------------------*/
		/*	S.Sense contact normalization
		/*----------------------------------------------------*/

		var salonName = 'S.Sense Salon & Spa';
		var phoneDisplay = '+91 8054 777 888';
		var phoneHref = 'tel:+918054777888';
		var whatsappHref = 'https://wa.me/918054777888';
		var email = 'info@ssensesalon.com';

		$('img[alt="logo"], img[alt="mobile-logo"]').attr('alt', salonName + ' logo');
		$('a[href="info@ssensesalon.com"], a[href="mailto:nfo@ssensesalon.com"]').attr('href', 'mailto:' + email).text(email);
		$('a[href^="tel:8054777888"], a[href="tel:+8054777888"]').attr('href', phoneHref);
		$('.footer-phone a').attr('href', phoneHref).text('Phone: ' + phoneDisplay);
		$('.footer-email a').attr('href', 'mailto:' + email).text(email);
		$('.wsmenu').attr('aria-label', 'Primary navigation');
		$('#wsnavtoggle').attr({
			'aria-label': 'Open main menu',
			'aria-controls': 'site-navigation',
			'aria-expanded': 'false',
			'role': 'button',
			'tabindex': '0'
		});
		$('.wsmenu-list').attr('id', 'site-navigation');
		$('.wsmenu-list a').filter(function () { return $(this).text().trim() === 'Home'; }).attr('aria-label', 'S.Sense Salon and Spa homepage');
		$('a[target="_blank"]').attr('rel', 'noopener');

		$('#wsnavtoggle').on('click keydown', function (event) {
			if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
			if (event.type === 'keydown') {
				event.preventDefault();
				if (window.matchMedia('(max-width: 767.98px)').matches) this.click();
			}
			var toggle = this;
			setTimeout(function () {
				var isOpen = $('body').hasClass('wsactive');
				$(toggle).attr({
					'aria-expanded': isOpen ? 'true' : 'false',
					'aria-label': isOpen ? 'Close main menu' : 'Open main menu'
				});
			}, 0);
		});


		/*----------------------------------------------------*/
		/*	S.Sense premium home - gentle hero collage parallax
		/*	Defensive: only on homepage visual, desktop, no reduced motion
		/*----------------------------------------------------*/

		function ssenseHeroParallax() {
			var $visual = $('.ssense-home .ssense-hero-visual');
			if (!$visual.length) return;
			if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
			if ($(window).outerWidth() < 992) return;

			var $main  = $visual.find('.ssense-hero-card-main');
			var $small = $visual.find('.ssense-hero-card-small');
			if (!$main.length || !$small.length) return;

			var raf = null;

			$visual.on('mousemove', function (e) {
				if (raf) return;
				raf = requestAnimationFrame(function () {
					var r = $visual[0].getBoundingClientRect();
					var dx = ((e.clientX - r.left) / r.width) - 0.5;
					var dy = ((e.clientY - r.top) / r.height) - 0.5;
					$main.css('transform', 'translate(' + (dx * -10) + 'px, ' + (dy * -10) + 'px)');
					$small.css('transform', 'translate(' + (dx * 12) + 'px, ' + (dy * 12) + 'px)');
					raf = null;
				});
			});

			$visual.on('mouseleave', function () {
				if (raf) { cancelAnimationFrame(raf); raf = null; }
				$main.css('transform', '');
				$small.css('transform', '');
			});
		}

		ssenseHeroParallax();


		/*----------------------------------------------------*/
		/*	S.Sense mobile section sliders
		/*----------------------------------------------------*/

		// Mobile browsing rows are native, user-controlled scrollers. Their
		// accessible setup and desktop teardown live below, outside plugin init.


		/*----------------------------------------------------*/
		/*	S.Sense floating quick-access bar: call, WhatsApp,
		/*	Instagram, book. Injected on every page; skips
		/*	reduced-motion users and non-page shells.
		/*----------------------------------------------------*/

		function ssenseQuickAccess() {
			if ($('body').hasClass('ssense-floating-present') || $('.ssense-floating-cta').length) {
				$('body').addClass('ssense-floating-present');
				return;
			}

			var bar =
				'<div class="ssense-floating-cta" role="region" aria-label="Quick contact actions">' +
					'<a class="ssense-floating-cta__call" href="' + phoneHref + '" aria-label="Call S.Sense Salon and Spa">' +
						'<svg class="ssense-cta-call-icon call-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M6.62 10.79c1.35 2.65 3.53 4.82 6.18 6.18l2.06-2.06c.34-.34.84-.45 1.28-.3 1.14.38 2.35.59 3.6.59.7 0 1.26.56 1.26 1.26v3.28c0 .7-.56 1.26-1.26 1.26C10.49 21 3 13.51 3 4.26 3 3.56 3.56 3 4.26 3h3.28c.7 0 1.26.56 1.26 1.26 0 1.25.21 2.46.59 3.6.15.45.04.94-.3 1.28l-2.47 1.65Z" fill="currentColor"/><path d="M14.8 3.7a6.7 6.7 0 0 1 5.5 5.5" stroke="currentColor" stroke-width="2.15" stroke-linecap="round"/><path d="M14.7 7.65a3.15 3.15 0 0 1 1.65 1.65" stroke="currentColor" stroke-width="2.15" stroke-linecap="round"/></svg><span class="ssense-floating-cta__label">Call</span>' +
					'</a>' +
					'<a class="ssense-floating-cta__whatsapp" href="' + whatsappHref + '" target="_blank" rel="noopener" aria-label="Message S.Sense Salon and Spa on WhatsApp">' +
						'<svg class="ssense-cta-social-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M20.52 3.48A11.84 11.84 0 0 0 12.08 0C5.52 0 .19 5.33.19 11.9c0 2.1.55 4.14 1.6 5.95L0 24l6.3-1.65a11.9 11.9 0 0 0 5.78 1.47h.01c6.56 0 11.9-5.33 11.91-11.9 0-3.18-1.24-6.17-3.48-8.44Z" fill="#25D366"/><path d="M12.1 21.78h-.01a9.86 9.86 0 0 1-5.02-1.37l-.36-.22-3.74.98 1-3.65-.24-.38a9.82 9.82 0 1 1 8.37 4.64Zm5.39-7.36c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.04-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.48 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z" fill="#fff"/></svg><span class="ssense-floating-cta__label">WhatsApp</span>' +
					'</a>' +
					'<a class="ssense-floating-cta__facebook" href="https://www.facebook.com/share/17BiWq4miC/" target="_blank" rel="noopener" aria-label="Visit S.Sense Salon and Spa on Facebook">' +
						'<span class="flaticon-facebook" aria-hidden="true"></span><span class="ssense-floating-cta__label">Facebook</span>' +
					'</a>' +
					'<a class="ssense-floating-cta__instagram" href="https://www.instagram.com/S.Sensesalonandspa" target="_blank" rel="noopener" aria-label="Follow S.Sense Salon and Spa on Instagram">' +
						'<svg class="ssense-cta-social-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="#E1306C" stroke-width="2"/><circle cx="12" cy="12" r="4.2" stroke="#E1306C" stroke-width="2"/><circle cx="17.3" cy="6.7" r="1.25" fill="#E1306C"/></svg><span class="ssense-floating-cta__label">Instagram</span>' +
					'</a>' +
					'<a class="ssense-floating-cta__book" href="booking.html" aria-label="Book an appointment at S.Sense Salon and Spa">' +
						'Book Now' +
					'</a>' +
				'</div>';

			$('body').addClass('ssense-floating-present').append(bar);
		}

		ssenseQuickAccess();


		/*----------------------------------------------------*/
		/*	Reviews page: readable long cards + progressive reveal
		/*----------------------------------------------------*/

		function ssenseReviewsPageInteractions() {
			var $page = $('body.ssense-reviews-page');
			if (!$page.length) return;
			var resizeTimer;
			var reviewMarqueeFrame = null;
			var reviewMarqueeLastTime = 0;
			var reviewMarqueeOffset = 0;
			var reviewMarqueePaused = false;
			var reviewMarqueeBuilt = false;
			var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

			function balanceReviewRows() {
				var $grid = $page.find('[data-review-grid]');
				var $visible = $grid.find('.ssense-review-card').not('[hidden]');

				$visible.removeClass('ssense-review-card--orphan');
			}

			function setupReviewCard(card, index) {
				var $card = $(card);
				var copy = $card.find('.ssense-review-copy')[0];
				if (!copy || $card.is('[hidden]')) return;

				var button = $card.find('.ssense-read-more');
				var buttonId = 'ssense-review-toggle-' + index;
				copy.id = copy.id || 'ssense-review-copy-' + index;
				var computed = window.getComputedStyle(copy);
				var lineHeight = parseFloat(computed.lineHeight) || 24;
				var clamp = $card.hasClass('ssense-review-card--feature') ? 5 : 4;
				var collapsedHeight = lineHeight * clamp;
				var clone = copy.cloneNode(true);
				clone.removeAttribute('id');
				clone.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;display:block;overflow:visible;-webkit-line-clamp:unset;-webkit-box-orient:unset;max-height:none;width:' + copy.getBoundingClientRect().width + 'px;';
				copy.parentNode.appendChild(clone);
				var fullHeight = clone.scrollHeight;
				clone.parentNode.removeChild(clone);
				copy.style.setProperty('--ssense-review-expanded-height', fullHeight + 2 + 'px');
				if (!button.length) {
					button = $('<button/>', {
						'class': 'ssense-read-more',
						'id': buttonId,
						'type': 'button',
						'aria-expanded': 'false',
						'aria-controls': copy.id,
						'text': 'Read More'
					});
					button.insertAfter(copy);
				}

				if (!$card.hasClass('is-expanded') && fullHeight <= collapsedHeight + 6) {
					button.remove();
				}
			}

			function refreshReviewCards() {
				$page.find('.ssense-review-card').each(function(index) {
					setupReviewCard(this, index);
				});
				balanceReviewRows();
				setupMobileReviewMarquee();
			}

			function stopMobileReviewMarquee() {
				if (reviewMarqueeFrame) window.cancelAnimationFrame(reviewMarqueeFrame);
				reviewMarqueeFrame = null;
				reviewMarqueeLastTime = 0;
				var grid = $page.find('[data-review-grid]')[0];
				reviewMarqueeOffset = grid ? grid.scrollLeft : reviewMarqueeOffset;
			}

			function teardownMobileReviewMarquee() {
				var $grid = $page.find('[data-review-grid]');
				stopMobileReviewMarquee();
				$grid.removeClass('ssense-review-marquee').find('.ssense-review-card--marquee-clone').remove();
				reviewMarqueeBuilt = false;
			}

			function tickMobileReviewMarquee(time) {
				var grid = $page.find('[data-review-grid]')[0];
				if (!grid) return;
				if (!reviewMarqueeLastTime) reviewMarqueeLastTime = time;
				if (!reviewMarqueePaused && !prefersReducedMotion.matches) {
					var delta = time - reviewMarqueeLastTime;
					var loopWidth = grid.scrollWidth / 2;
					reviewMarqueeOffset += delta * 0.045;
					if (loopWidth > 0 && reviewMarqueeOffset >= loopWidth) reviewMarqueeOffset -= loopWidth;
					grid.scrollLeft = reviewMarqueeOffset;
				}
				reviewMarqueeLastTime = time;
				reviewMarqueeFrame = window.requestAnimationFrame(tickMobileReviewMarquee);
			}

			function startMobileReviewMarquee() {
				if (reviewMarqueeFrame || prefersReducedMotion.matches) return;
				reviewMarqueeFrame = window.requestAnimationFrame(tickMobileReviewMarquee);
			}

			function setupMobileReviewMarquee() {
				var $grid = $page.find('[data-review-grid]');
				if (!$grid.length) return;
				if (!window.matchMedia('(max-width: 767.98px)').matches) {
					teardownMobileReviewMarquee();
					return;
				}

				if (!reviewMarqueeBuilt) {
					$grid.find('.ssense-review-card--marquee-clone').remove();
					$grid.find('.ssense-review-card').not('[hidden], .ssense-review-card--marquee-clone').each(function() {
						var $clone = $(this).clone(false, false).addClass('ssense-review-card--marquee-clone').attr('aria-hidden', 'true').removeAttr('id');
						$clone.find('[id]').removeAttr('id');
						$clone.find('[aria-controls]').removeAttr('aria-controls');
						$grid.append($clone);
					});
					$grid.addClass('ssense-review-marquee').attr('aria-label', 'Guest reviews auto scrolling list');
					reviewMarqueeBuilt = true;
					reviewMarqueeOffset = $grid[0].scrollLeft;
				}

				startMobileReviewMarquee();
			}

			refreshReviewCards();
			$(window).on('resize.ssenseReviewsBalance', function() {
				clearTimeout(resizeTimer);
				resizeTimer = setTimeout(refreshReviewCards, 120);
			});

			$page.on('click', '.ssense-read-more', function() {
				var $button = $(this);
				var $card = $button.closest('.ssense-review-card');
				var copy = $card.find('.ssense-review-copy')[0];
				if (copy) {
					copy.style.setProperty('--ssense-review-expanded-height', copy.scrollHeight + 2 + 'px');
				}
				var isExpanded = $card.toggleClass('is-expanded').hasClass('is-expanded');
				$button.attr('aria-expanded', isExpanded ? 'true' : 'false').text(isExpanded ? 'Show Less' : 'Read More');
			});

			$page.on('click', '[data-load-reviews]', function() {
				var $button = $(this);
				if ($button.prop('disabled')) return;
				teardownMobileReviewMarquee();
				$button.prop('disabled', true);
				var $hidden = $page.find('[data-review-grid] .ssense-review-card[hidden]');
				var $next = $hidden.slice(0, 4);
				var revealDelay = Math.max(0, ($next.length - 1) * 45 + 180);
				$next.each(function(i) {
					var $card = $(this);
					setTimeout(function() {
						$card.addClass('ssense-reveal').removeAttr('hidden');
						requestAnimationFrame(function() {
							setupReviewCard($card[0], $page.find('.ssense-review-card').index($card));
							balanceReviewRows();
						});
					}, i * 45);
				});

				if ($hidden.length <= $next.length) {
					setTimeout(function() {
						balanceReviewRows();
						setupMobileReviewMarquee();
						$button.closest('.ssense-load-more-wrap').fadeOut(220);
					}, revealDelay);
				} else {
					setTimeout(function() {
						setupMobileReviewMarquee();
						$button.prop('disabled', false);
					}, revealDelay);
				}
			});

			$page.find('[data-review-grid]').on('mouseenter focusin touchstart pointerdown', function() {
				reviewMarqueePaused = true;
				$(this).addClass('is-auto-paused');
			});
			$page.find('[data-review-grid]').on('mouseleave focusout touchend touchcancel pointerup pointercancel', function() {
				reviewMarqueePaused = false;
				$(this).removeClass('is-auto-paused');
			});
			prefersReducedMotion.addEventListener('change', function() {
				if (prefersReducedMotion.matches) stopMobileReviewMarquee();
				else setupMobileReviewMarquee();
			});
		}

		ssenseReviewsPageInteractions();

		/* Mobile floating CTA: collapse into one tappable circle. */
		(function ssenseFloatingCtaToggle() {
			var $ctas = $('.ssense-floating-cta').filter(function() {
				return !$(this).closest('.ssense-review-card').length;
			});
			if (!$ctas.length) return;
			$ctas.each(function() {
				if (this.parentNode !== document.body) document.body.appendChild(this);
			});
			$('body').addClass('ssense-floating-present');
			var mobileQuery = window.matchMedia('(max-width: 767.98px)');

			function applyMobilePosition() {
				$ctas.each(function() {
					var cta = this;
					if (!mobileQuery.matches) {
						['position', 'left', 'right', 'top', 'bottom', 'width', 'max-width', 'transform'].forEach(function(prop) {
							cta.style.removeProperty(prop);
						});
						return;
					}
					cta.style.setProperty('position', 'fixed', 'important');
					cta.style.setProperty('top', 'auto', 'important');
					cta.style.setProperty('bottom', '14px', 'important');
					cta.style.setProperty('transform', 'none', 'important');
					cta.style.setProperty('z-index', '2147483000', 'important');
					if ($(cta).hasClass('is-open')) {
						cta.style.setProperty('left', '18px', 'important');
						cta.style.setProperty('right', '18px', 'important');
						cta.style.setProperty('width', 'auto', 'important');
						cta.style.setProperty('max-width', 'none', 'important');
					} else {
						cta.style.setProperty('left', 'auto', 'important');
						cta.style.setProperty('right', '14px', 'important');
						cta.style.setProperty('width', '44px', 'important');
						cta.style.setProperty('max-width', '44px', 'important');
					}
				});
			}

			$ctas.each(function() {
				var $cta = $(this);
				if ($cta.find('.ssense-floating-cta__toggle').length) return;
				var $toggle = $('<button/>', {
					'class': 'ssense-floating-cta__toggle',
					'type': 'button',
					'aria-label': 'Open quick contact options',
					'aria-expanded': 'false'
				}).append($('<span/>', {'aria-hidden': 'true', 'text': 'S'}));
				$cta.prepend($toggle);
			});

			$(document).on('click', '.ssense-floating-cta__toggle', function(event) {
				event.preventDefault();
				var $toggle = $(this);
				var $cta = $toggle.closest('.ssense-floating-cta');
				var isOpen = $cta.toggleClass('is-open').hasClass('is-open');
				$toggle.attr({
					'aria-expanded': isOpen ? 'true' : 'false',
					'aria-label': isOpen ? 'Close quick contact options' : 'Open quick contact options'
				});
				applyMobilePosition();
			});

			$(document).on('click', function(event) {
				if ($(event.target).closest('.ssense-floating-cta').length) return;
				$('.ssense-floating-cta.is-open').removeClass('is-open').find('.ssense-floating-cta__toggle').attr({
					'aria-expanded': 'false',
					'aria-label': 'Open quick contact options'
				});
				applyMobilePosition();
			});

			applyMobilePosition();
			$(window).on('resize.ssenseFloatingCtaPosition orientationchange.ssenseFloatingCtaPosition', applyMobilePosition);
			if (mobileQuery.addEventListener) mobileQuery.addEventListener('change', applyMobilePosition);
		})();

		/* Homepage: rotate the authentic reviews pasted from Google Maps. */
		(function ssenseHomepageReviewRotation() {
			var $section = $('#ssense-home-testimonials');
			if (!$section.length) return;
			var reviews = [
				{name:"Janhavi Bidye",date:"2 years ago",text:"Absolutely love this salon! The vibe is fantastic, and they always nail the service with perfection. Been coming here with my family for two years now, and we're always impressed. The staff is experienced, and their suggestions are spot-on.",rating:'★★★★★'},
				{name:"Sara Samuel",date:"11 months ago",text:"Fresh nails, fresh mood 💖💅 Loved how perfect and neat my nails turned out—exactly what I want! #NailGoals #SelfCare thanks to Jignasha.",rating:'★★★★★'},
				{name:"RAMESH SHWETA",date:"11 months ago",text:"S.sense is my go to salon whenever I want to groom myself, feel relaxed or in a mood to pamper myself. They have excellent staff who understand your needs and give the best service.",rating:'★★★★★'},
				{name:"Resource Eureka",date:"11 months ago",text:"This is the only salon which has been my go to since years. They make sure you are absolutely and completely happy with the service. I have never had a bad experience with them.",rating:'★★★★★'},
				{name:"Aakash Sawant",date:"11 months ago",text:"I had a really great experience at S.SENSE Salon & Spa. The team combines luxury, comfort and thoughtful service beautifully.",rating:'★★★★★'},
				{name:"Akanksha Maru",date:"11 months ago",text:"Noori did my haircut and it was really good! She gave me good advice regarding my haircut and didn't reduce my length as I requested. The staff is polite and listens to you!",rating:'★★★★★'},
				{name:"Serena Samuel",date:"11 months ago",text:"The only place I trust with getting my hair and nails done. Been coming here for ages. Would 10/10 recommend! Special shoutout to Aftaab, Jignasha and Venessa! ❤️",rating:'★★★★★'},
				{name:"Parveen Shaik",date:"11 months ago",text:"I had a wonderful experience getting my nails done. The technician was very skilled, paid attention to every detail, and made sure I was comfortable throughout. The quality was excellent.",rating:'★★★★★'},
				{name:"rohit mane",date:"11 months ago",text:"I had a wonderful experience at SS Salon! The services were relaxing and rejuvenating, and the results were fantastic. The haircut was styled perfectly and the staff was professional and friendly.",rating:'★★★★★'},
				{name:"Sandhyaa A Dhole",date:"11 months ago",text:"I had an amazing experience with Venessa. She is extremely professional, polite, and very skilled. She understood what I wanted, gave helpful suggestions, and delivered great results.",rating:'★★★★★'},
				{name:"Eshita Chandna",date:"10 months ago",text:"Great service, wonderful staff. Noorie did an amazing job with my hair cut. Great experience!",rating:'★★★★★'},
				{name:"Nehat Eastak",date:"11 months ago",text:"Sam and Agustin did our pedicure today and we had a wonderful experience. They were professional, friendly, and attentive to detail. Highly recommended S Sense!",rating:'★★★★★'},
				{name:"Stuti Beohar",date:"11 months ago",text:"Ssense is our go-to family salon! Can't imagine trusting anyone else with our hair except Aftab. He truly cares about what's best for your hair.",rating:'★★★★★'},
				{name:"Vijeta Lakra",date:"11 months ago",text:"Shruti did my facial and it was very relaxing. From cleanup to back massage it was soothing as heaven. I choose her every time.",rating:'★★★★★'},
				{name:"Shraddha Kirve",date:"11 months ago",text:"I have been a regular customer and they never disappoint. From haircuts to facials, every service is done with perfection and care. Love the clean and cozy atmosphere too!",rating:'★★★★★'},
				{name:"Yash Jambhekar",date:"11 months ago",text:"I've been visiting Aftab at S.Sense Salon & Spa for 4 years and the experience has always been excellent. His skill and consistency are unmatched. Truly a 5-star salon!",rating:'★★★★★'},
				{name:"Supriya Arora",date:"11 months ago",text:"5 stars isn't enough! Amazing salon in Thakur Village. Friendly staff, top-quality services, and exceptional service. Highly recommend!",rating:'★★★★★'},
				{name:"Nidhi Pandey",date:"11 months ago",text:"5 stars isn't enough! Amazing salon in Thakur Village. Friendly staff, top-quality services, and exceptional service. Highly recommend!",rating:'★★★★★'},
				{name:"Vidhi",date:"11 months ago",text:"Had a super experience, the staff is quite polite and talented, really happy with the hair results and highly recommended ❤️",rating:'★★★★★'},
				{name:"Anita Jatav",date:"11 months ago",text:"Aftab understands my hair and gives me the right treatment every time. He really knows his work and the results make me very happy.",rating:'★★★★★'},
				{name:"roopa pednekar",date:"11 months ago",text:"Aftab understands my hair and gives me the right treatment every time. He really knows his work and the results make me very happy.",rating:'★★★★★'},
				{name:"Khushbu Doshi",date:"4 months ago",text:"I got a haircut from Sohil, loved his work and patience. Highly recommend this salon.",rating:'★★★★★'},
				{name:"Vira Trivedi",date:"11 months ago",text:"A very nice haircut done by Aftab. A nice and up-to-date salon experience with cooperative and polite staff. Excellent pedicure and nail work too.",rating:'★★★★★'},
				{name:"Prithvi Patel",date:"11 months ago",text:"Got nail extensions done for the first time. The staff was very nice, gave good suggestions and helped me choose what I wanted. Loved their service.",rating:'★★★★★'},
				{name:"SHUCHISMITA RAI",date:"11 months ago",text:"Amazing experience on every visit. Professional top-notch services for every need. Haircuts, hair colour, pedicures and facials were all 10/10.",rating:'★★★★★'},
				{name:"Kedar Borwankar",date:"11 months ago",text:"I had a wonderful experience at S. Salon & Spa. The team is professional, skilled, and very welcoming. Special thanks to Aftab and Suhail.",rating:'★★★★★'},
				{name:"Jigar Shah",date:"11 months ago",text:"I have been visiting S. Sense for all my salon needs for many years. The service, ambience, staff and products are all simply amazing. Aftab bhai is a real magician.",rating:'★★★★★'},
				{name:"Naseem Khan",date:"11 months ago",text:"Wonderful experience! The staff was professional, friendly, and made me feel comfortable. The place was clean and well-maintained. Definitely recommend this salon.",rating:'★★★★★'},
				{name:"Noopur Tailor",date:"2 years ago",text:"S.Sense Salon is fantastic! I recently had a haircut there and couldn't be happier. The staff were professional and friendly, creating a welcoming atmosphere.",rating:'★★★★★'},
				{name:"Naitik Shah",date:"2 years ago",text:"S.Sense Salon is fantastic! I recently had a haircut there and couldn't be happier. The staff were professional and friendly, creating a welcoming atmosphere.",rating:'★★★★★'},
				{name:"Dakshita Shah",date:"10 months ago",text:"Vanessa is extremely professional. I went to this salon with doubts and fear but she assured me and did a fabulous job. Would 100% recommend her.",rating:'★★★★★'},
				{name:"Megha Dhade",date:"11 months ago",text:"This is my favourite place for self pampering. My daughter and I are frequent customers. This place takes care of hair, skin and nails beautifully.",rating:'★★★★★'},
				{name:"Manjima Dutta",date:"11 months ago",text:"I am a regular customer of Ssense since its opening and have received awesome services for years. Today I got a great hair colour service from Aftab and am truly satisfied.",rating:'★★★★★'},
				{name:"Sakshi Pawar",date:"11 months ago",text:"I absolutely love this salon! The staff is polite, hygiene is top-notch, and services are excellent. Special thanks to Noori for a perfect result.",rating:'★★★★★'},
				{name:"Sanjivani Kawthalkar",date:"11 months ago",text:"Inayat Khan gave me a quick, efficient and caring haircut. I am completely satisfied with my experience.",rating:'★★★★★'},
				{name:"sonil chaddha",date:"11 months ago",text:"Love going to SSense. Vanessa is very good at beauty services, Augustine is excellent at pedicure, Jigna is too good for nail art and Aftab is excellent with hair.",rating:'★★★★★'},
				{name:"priyanka kanojia",date:"2 years ago",text:"Absolutely love this salon! It's my go-to spot for hair cuts, colours and facials. The staff are incredibly talented and always make sure I leave feeling great.",rating:'★★★★★'},
				{name:"Sahil Bangera",date:"10 months ago",text:"Amazing service. Staff is very professional and overall it is always a great experience.",rating:'★★★★★'},
				{name:"swati sathe",date:"2 years ago",text:"The best pedicure experience I have had. They are professional, use quality products and suggest the right treatment for my needs.",rating:'★★★★★'},
				{name:"Junaid Khan",date:"2 years ago",text:"The best pedicure experience I have had. They are professional, use quality products and suggest the right treatment for my needs.",rating:'★★★★★'},
				{name:"Madhura Kumbhar",date:"11 months ago",text:"It's my relaxation point. I always feel rejuvenated when I visit S Sense. Aftab for hair and Jigna for nails are my rocks.",rating:'★★★★★'},
				{name:"Sonal Bhalerao",date:"11 months ago",text:"I have been coming here for 4 years and am so happy with the services from S. Sense salon. Recommended to visit and enjoy.",rating:'★★★★★'},
				{name:"Rajshri Amin",date:"11 months ago",text:"I'm a regular client and absolutely adore this salon! The staff is friendly, the place is clean and the service is fast. Highly recommend!",rating:'★★★★★'},
				{name:"Zaisha Lakhani",date:"11 months ago",text:"I'm a regular client and absolutely adore this salon! The staff is friendly, the place is clean and the service is fast. Highly recommend!",rating:'★★★★★'},
				{name:"rashi chandna",date:"10 months ago",text:"Got a haircut from here, great service. Hairwash was relaxing and everyone at the salon is very nice.",rating:'★★★★★'},
				{name:"Abhinaya Sunku",date:"10 months ago",text:"Absolutely love my new haircut! The stylist nailed the look I had in mind. The attention to detail and overall vibe made the experience great!",rating:'★★★★★'},
				{name:"Erica Almeida",date:"11 months ago",text:"Excellent service from S.Sense salon. Parveen managed my last-minute appointment very well. Recommend visiting.",rating:'★★★★★'},
				{name:"Urmil Rathod",date:"2 years ago",text:"I have been coming here for years and have always received very good service. The atmosphere is relaxing and positive, and the staff are experts.",rating:'★★★★★'},
				{name:"pragati patel",date:"11 months ago",text:"Aftab did a great job with my Botox, highlights and global colour. He changed my look so well. Highly recommend.",rating:'★★★★★'},
				{name:"Priti Panchal",date:"11 months ago",text:"Excellent service, very polite and friendly staff. Parveen manages appointments very well. Recommended to visit.",rating:'★★★★★'}
			];
			var $grid = $section.find('.ssense-testimonial-grid');
			var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
			var frame = null;
			var lastTime = 0;
			var marqueeOffset = 0;
			var paused = false;

			function makeCard(item, index, clone) {
				var $card = $('<article class="ssense-testimonial-card"></article>');
				if (clone) $card.attr('aria-hidden', 'true');
				$card.append($('<div class="ssense-quote-mark"></div>').text('“'));
				$card.append($('<div class="ssense-stars"></div>').text(item.rating));
				$card.append($('<p></p>').text(item.text));
				var $author = $('<div class="ssense-testimonial-author"></div>');
				$author.append($('<span class="ssense-avatar"></span>').addClass('ssense-avatar-' + ((index % 3) + 1)).text(item.name.charAt(0).toUpperCase()));
				$author.append($('<div></div>').append($('<strong></strong>').text(item.name)).append($('<small></small>').text(item.date)));
				$author.append($('<b></b>').text('♥'));
				$card.append($author);
				return $card;
			}

			function buildMarquee() {
				$grid.empty().addClass('ssense-review-marquee').attr('aria-label', 'Guest reviews auto scrolling list');
				reviews.forEach(function(item, index) { $grid.append(makeCard(item, index, false)); });
				reviews.forEach(function(item, index) { $grid.append(makeCard(item, index, true)); });
			}

			function stopMarquee() {
				if (!frame) return;
				window.cancelAnimationFrame(frame);
				frame = null;
				lastTime = 0;
				marqueeOffset = $grid[0] ? $grid[0].scrollLeft : marqueeOffset;
			}

			function tick(time) {
				var node = $grid[0];
				if (!node) return;
				if (!lastTime) lastTime = time;
				if (!paused && !prefersReducedMotion.matches) {
					var delta = time - lastTime;
					var loopWidth = node.scrollWidth / 2;
					marqueeOffset += delta * 0.045;
					if (loopWidth > 0 && marqueeOffset >= loopWidth) marqueeOffset -= loopWidth;
					node.scrollLeft = marqueeOffset;
				}
				lastTime = time;
				frame = window.requestAnimationFrame(tick);
			}

			function startMarquee() {
				if (frame || prefersReducedMotion.matches) return;
				frame = window.requestAnimationFrame(tick);
			}

			buildMarquee();
			$grid.on('mouseenter focusin touchstart pointerdown', function() {
				paused = true;
				$grid.addClass('is-auto-paused');
			});
			$grid.on('mouseleave focusout touchend touchcancel pointerup pointercancel', function() {
				paused = false;
				$grid.removeClass('is-auto-paused');
			});
			prefersReducedMotion.addEventListener('change', function() {
				if (prefersReducedMotion.matches) stopMarquee();
				else startMarquee();
			});
			startMarquee();
		})();

		/* Make the all-services overview more useful and conversion-focused. */
		(function ssenseServicesOverviewCopy() {
			var $page = $('body.ssense-services-index');
			if (!$page.length) return;
			$page.find('.ssense-services-hero-copy h1 + p').text('From precision haircuts and rich colour to glow-boosting facials, smooth waxing and detailed nail care, every S.Sense appointment is tailored to your style, comfort and occasion.');
			$page.find('.ssense-quick-info .ssense-quick-grid > div:nth-child(2) strong').text('From ₹200');
			$page.find('.ssense-quick-info .ssense-quick-grid > div:nth-child(4) strong').text('Book 1–2 days ahead');
			$page.find('.ssense-service-design-copy h2 + p').text('Choose a complete look or book one focused treatment. Our stylists and therapists take time to understand your hair, skin, nails and personal routine before recommending the right service.');
			$page.find('.ssense-service-design-copy h3').text('Why guests choose us');
			$page.find('.ssense-service-design-copy .ssense-check-list').html('<li>Personal consultation before every treatment</li><li>Experienced stylists and beauty specialists</li><li>Premium, skin-safe products and clean tools</li>');
			$page.find('.ssense-process-card ol').html('<li>Tell us the look, concern or occasion you have in mind.</li><li>Your specialist suggests the right service, finish and timing.</li><li>Relax while we work with professional products and careful technique.</li><li>Leave with aftercare tips and an easy plan for your next visit.</li>');
			$page.find('.ssense-services-related-showcase .ssense-section-heading > p:not(.ssense-related-script)').text('Build a self-care session around your schedule. Pair a haircut with colour, add a facial to your grooming visit, or finish your look with manicure and pedicure care.');
			$page.find('.ssense-local-copy > p').text('Our calm, welcoming salon serves guests from Thakur Village, Lokhandwala Township, Evershine Millennium Paradise and nearby Kandivali East neighbourhoods. Walk-ins are welcome when availability allows; appointments are recommended for colour, nails and longer treatments.');
			$page.find('.ssense-booking-panel h2').text('Book your next visit at S.Sense.');
			$page.find('.ssense-booking-panel p:not(.ssense-eyebrow)').text('Choose your service and book a time that works for you. We are open daily from 11:00 AM to 9:00 PM in Kandivali East, Mumbai.');
		})();


	});

/* Mobile-only progressive disclosure. Keep independent of optional jQuery
   plugins so basic navigation works even on the lean error-page templates.
   No content is copied, removed, or hidden unless its button is installed.
   On desktop, original nodes/attributes are restored (including existing IDs). */
(function ssenseCompactMobile() {
    'use strict';
    var media = window.matchMedia('(max-width: 767.98px)');
    var undo = [];
    var nextId = 0;

    function attribute(element, name, value) {
        var previous = element.getAttribute(name);
        element.setAttribute(name, value);
        undo.push(function() {
            if (previous === null) element.removeAttribute(name);
            else element.setAttribute(name, previous);
        });
    }

    function mark(element, name) {
        if (element.classList.contains(name)) return;
        var hadClass = element.hasAttribute('class');
        element.classList.add(name);
        undo.push(function() {
            element.classList.remove(name);
            if (!hadClass && !element.className) element.removeAttribute('class');
        });
    }

    function disclosure(heading, panel, copy) {
        if (!panel.id) attribute(panel, 'id', 'ssense-compact-panel-' + (++nextId));
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'ssense-compact-toggle';
        button.setAttribute('aria-controls', panel.id);
        button.setAttribute('aria-expanded', 'false');
        if (copy) {
            button.textContent = 'Read More';
            panel.insertAdjacentElement('afterend', button);
            mark(panel, 'ssense-compact-copy');
        } else {
            // Move the original heading nodes, keeping semantic heading levels.
            var label = document.createElement('span');
            while (heading.firstChild) label.appendChild(heading.firstChild);
            button.appendChild(label);
            heading.appendChild(button);
            mark(panel, 'ssense-compact-panel');
            attribute(panel, 'hidden', '');
        }
        button.addEventListener('click', function() {
            var open = button.getAttribute('aria-expanded') !== 'true';
            button.setAttribute('aria-expanded', String(open));
            if (copy) {
                panel.classList.toggle('ssense-compact-open', open);
                button.textContent = open ? 'Show Less' : 'Read More';
            } else panel.hidden = !open;
        });
        undo.push(function() {
            panel.classList.remove('ssense-compact-open');
            if (!copy) while (label.firstChild) heading.insertBefore(label.firstChild, button);
            button.remove();
        });
    }

    // Move, never clone, existing content. Restore its exact position on resize.
    function moveInto(node, parent) {
        var anchor = document.createComment('mobile content position');
        node.before(anchor);
        parent.appendChild(node);
        undo.push(function() { anchor.replaceWith(node); });
    }

    function foldStory(panel) {
        var heading = panel.querySelector('h2, h3');
        if (!heading || !panel.getClientRects().length) return;
        var summary = document.createElement('div');
        summary.className = 'container ssense-compact-summary';
        panel.before(summary);
        undo.push(function() { summary.remove(); });
        moveInto(heading, summary);
        mark(panel.parentElement, 'ssense-compact-story');
        disclosure(heading, panel, false);
    }

    function refresh() {
        // Teardown in reverse order before restoring desktop, without touching
        // existing accordions, review controls, forms, or their event handlers.
        while (undo.length) undo.pop()();
        if (!media.matches) return;

        function closeMenu(event) {
            if (event.key !== 'Escape' || !document.body.classList.contains('wsactive')) return;
            var toggle = document.getElementById('wsnavtoggle');
            if (toggle) { toggle.click(); toggle.focus(); }
        }
        document.addEventListener('keydown', closeMenu);
        undo.push(function() { document.removeEventListener('keydown', closeMenu); });

        document.querySelectorAll('.ssense-detailed-menu').forEach(function(category) {
            var heading = category.querySelector('.category-title h2');
            var panel = category.querySelector('.pricing-1-wrapper, .pricing-5-wrapper');
            if (!heading || !panel) return;
            mark(category, 'ssense-compact-category');
            // Category descriptions and their booking action belong with the
            // prices, not as three repeated advertising blocks when closed.
            var description = category.querySelector('.category-title p');
            var action = category.querySelector('.more-btn');
            if (description) moveInto(description, panel);
            if (action) moveInto(action, panel);
            disclosure(heading, panel, false);
        });
        document.querySelectorAll('.ssense-menu-section').forEach(function(category) {
            var heading = category.querySelector('.section-title h2');
            var panel = category.querySelector('.pricing-1-wrapper');
            if (heading && panel) disclosure(heading, panel, false);
        });
        document.querySelectorAll('.ssense-general-footer__brand').forEach(function(brand) {
            var logo = brand.querySelector(':scope > a');
            var tagline = brand.querySelector(':scope > .ssense-general-footer__tagline');
            var details = Array.from(brand.children).filter(function(child) {
                return child !== logo && child !== tagline;
            });
            if (!details.length) return;
            var anchor = document.createComment('mobile footer contact details');
            var heading = document.createElement('h3');
            var panel = document.createElement('div');
            heading.textContent = 'Contact S.Sense';
            details[0].before(anchor);
            (tagline || logo).after(heading);
            heading.after(panel);
            details.forEach(function(node) { panel.appendChild(node); });
            undo.push(function() {
                details.forEach(function(node) { brand.insertBefore(node, anchor); });
                anchor.remove();
                heading.remove();
                panel.remove();
            });
            disclosure(heading, panel, false);
        });
        document.querySelectorAll('.ssense-general-footer__links, .ssense-general-footer__hours').forEach(function(group) {
            var heading = group.querySelector('h3, h4, h5, h6');
            var panel = null;
            if (heading && !panel) {
                panel = document.createElement('div');
                heading.after(panel);
                while (panel.nextSibling) panel.appendChild(panel.nextSibling);
                undo.push(function() {
                    while (panel.firstChild) group.insertBefore(panel.firstChild, panel);
                    panel.remove();
                });
            }
            if (heading && panel) disclosure(heading, panel, false);
            if (group.classList.contains('ssense-general-footer__hours')) {
                var times = Array.from(group.querySelectorAll('time'));
                if (times.length === 7 && times.every(function(time) { return time.textContent === times[0].textContent; })) {
                    var hours = document.createElement('p');
                    hours.className = 'ssense-compact-hours';
                    hours.textContent = 'Every day · ' + times[0].textContent;
                    heading.after(hours);
                    undo.push(function() { hours.remove(); });
                }
            }
        });
        document.querySelectorAll('.ssense-general-footer__newsletter').forEach(function(group) {
            var heading = group.querySelector(':scope > h3');
            var form = group.querySelector(':scope > form');
            if (!heading || !form) return;
            var panel = document.createElement('div');
            heading.after(panel);
            // Leave social/contact links visible; keep the existing form nodes
            // and plugin handlers intact inside an optional newsletter group.
            while (panel.nextSibling) {
                var node = panel.nextSibling;
                panel.appendChild(node);
                if (node === form) break;
            }
            undo.push(function() {
                while (panel.firstChild) group.insertBefore(panel.firstChild, panel);
                panel.remove();
            });
            disclosure(heading, panel, false);
        });
        document.querySelectorAll('.pricing-5-category, .pricing-7-title').forEach(function(category) {
            var heading = category.querySelector('h2, h3, h4, h5');
            var panel = category.nextElementSibling;
            if (heading && panel && panel.matches('.pricing-list')) disclosure(heading, panel, false);
        });

        // Optional brand stories keep a clear heading and all original content.
        document.querySelectorAll('.ssense-luxury-hero > .container, .ssense-home-peace-section > .container, .ssense-best-section > .container, .ssense-offers-visit > .container, .ssense-about-experience-panel, .ssense-process-card, .ssense-detailed-menu-page .about-5 > .container-fluid').forEach(foldStory);
        document.querySelectorAll('.ssense-offers-card, .ssense-offers-visit__card, .ssense-about-approach-step__body, .ssense-home-secret-services .sbox-txt').forEach(function(card) {
            var heading = card.querySelector('h3, h5');
            var copy = card.querySelector('p');
            if (heading && copy) disclosure(heading, copy, false);
        });

        // Only supporting descriptions, never article bodies, prices, forms,
        // linked paragraphs, or content owned by the existing review expander.
        document.querySelectorAll('.ssense-ia-hero-grid > div > p, .ssense-ia-content > div > p, .ssense-services-hero-copy > p, .ssense-local-copy > p, .ssense-luxury-intro, .ssense-about-lede, .ssense-about-approach-lede, .ssense-about-experience-lede, .content-section .txt-block > p, .ssense-home-secret-head .txt-block > p').forEach(function(copy) {
            var lineHeight = parseFloat(getComputedStyle(copy).lineHeight);
            if (copy.textContent.trim().length < 120 || copy.querySelector('a, button') || !copy.getClientRects().length || copy.clientHeight <= lineHeight * 3 + 2) return;
            disclosure(null, copy, true);
        });

        document.querySelectorAll('.ssense-testimonial-grid, .ssense-featured-grid, .ssense-reviews-grid, .ssense-blog-listing-grid, .ssense-blog-main > .row, .ssense-blog-row, .blog-section .row:has(> [class*="col"] > .blog-post), #related-posts .ssense-related-grid, .gallery-section:not(#gallery-1) .row.row-cols-1').forEach(function(row) {
            if (!row.getClientRects().length || row.children.length < 2) return;
            mark(row, 'ssense-compact-row');
            attribute(row, 'tabindex', '0');
            attribute(row, 'role', 'region');
            var section = row.closest('section, .gallery-section');
            var heading = section && section.querySelector('h2, h3');
            attribute(row, 'aria-label', (heading ? heading.textContent.trim() : 'Browse more') + ' — scroll horizontally');
            var hint = document.createElement('p');
            hint.className = 'ssense-swipe-hint';
            hint.textContent = 'Swipe to explore →';
            row.before(hint);
            undo.push(function() { hint.remove(); row.scrollLeft = 0; });
        });
        var gallery = document.querySelector('#gallery-1 .ssense-gallery-row');
        if (gallery && gallery.children.length > 6) {
            var more = document.createElement('button');
            more.className = 'ssense-compact-toggle ssense-compact-gallery-more';
            more.type = 'button';
            more.textContent = 'View all ' + gallery.children.length + ' photos & videos';
            if (!gallery.id) attribute(gallery, 'id', 'ssense-compact-gallery');
            more.setAttribute('aria-controls', gallery.id);
            more.setAttribute('aria-expanded', 'false');
            var extras = Array.from(gallery.children).slice(6);
            extras.forEach(function(card) { attribute(card, 'hidden', ''); });
            more.addEventListener('click', function() {
                var open = more.getAttribute('aria-expanded') !== 'true';
                more.setAttribute('aria-expanded', String(open));
                extras.forEach(function(card) { card.hidden = !open; });
                more.textContent = open ? 'Show fewer photos' : 'View all ' + gallery.children.length + ' photos & videos';
            });
            gallery.after(more);
            undo.push(function() { more.remove(); });
        }
        revealFragment();
    }

    function revealFragment() {
        if (!media.matches || !location.hash) return;
        var target;
        try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); }
        catch (error) { return; }
        if (!target) return;
        document.querySelectorAll('.ssense-compact-toggle[aria-expanded="false"]').forEach(function(button) {
            var panel = document.getElementById(button.getAttribute('aria-controls'));
            if (panel && (panel.contains(target) || target.contains(panel))) button.click();
        });
        target.scrollIntoView({block: 'start', behavior: 'instant'});
    }

    // Wait for fonts/styles and the theme's ready-time copy updates before
    // measuring paragraphs. Without JS every original paragraph stays visible.
    if (document.readyState === 'complete') refresh();
    else window.addEventListener('load', function() { setTimeout(refresh, 0); }, {once: true});
    media.addEventListener('change', refresh);
    window.addEventListener('hashchange', revealFragment);
})();
