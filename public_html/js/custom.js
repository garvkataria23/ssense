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


		new WOW().init();


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

	    $('#datetimepicker').datetimepicker();


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
			if (event.type === 'keydown') event.preventDefault();
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

		function ssenseMobileSectionSliders() {
			if (!window.matchMedia || !window.matchMedia('(max-width: 767.98px)').matches) return;
			if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

			$('.ssense-trust-row, .ssense-brands-track, .ssense-service-grid, .ssense-price-grid, .ssense-gallery-grid, .ssense-review-grid, .services-section .sbox-2-wrapper > .row, .gallery-section .row.row-cols-1, .team-section .row.row-cols-1, .cards-row > .row, #reviews-3 .reviews-3-wrapper > .row').each(function() {
				var slider = this;
				var $slider = $(slider);
				var timer;

				function start() {
					if (slider.scrollWidth <= slider.clientWidth) return;
					clearInterval(timer);

					timer = setInterval(function() {
						var item = $slider.children().filter(':visible').first()[0];
						var gap = parseFloat(window.getComputedStyle(slider).columnGap || window.getComputedStyle(slider).gap) || 14;
						var step = item ? item.getBoundingClientRect().width + gap : slider.clientWidth * 0.82;
						var atEnd = slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 8;

						slider.scrollTo({
							left: atEnd ? 0 : slider.scrollLeft + step,
							behavior: 'smooth'
						});
					}, 5600);
				}

				$slider.on('touchstart pointerdown mouseenter focusin', function() { clearInterval(timer); });
				$slider.on('touchend pointerup mouseleave focusout', start);
				start();
			});
		}

		ssenseMobileSectionSliders();


		/*----------------------------------------------------*/
		/*	S.Sense floating quick-access bar: call, WhatsApp,
		/*	Instagram, book. Injected on every page; skips
		/*	reduced-motion users and non-page shells.
		/*----------------------------------------------------*/

		function ssenseQuickAccess() {
			if ($('body').hasClass('ssense-floating-present')) return;

			var bar =
				'<div class="ssense-floating-cta" role="region" aria-label="Quick contact actions">' +
					'<a class="ssense-floating-cta__call" href="' + phoneHref + '" aria-label="Call S.Sense Salon and Spa">' +
						'<svg class="ssense-cta-call-icon call-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M6.62 10.79c1.35 2.65 3.53 4.82 6.18 6.18l2.06-2.06c.34-.34.84-.45 1.28-.3 1.14.38 2.35.59 3.6.59.7 0 1.26.56 1.26 1.26v3.28c0 .7-.56 1.26-1.26 1.26C10.49 21 3 13.51 3 4.26 3 3.56 3.56 3 4.26 3h3.28c.7 0 1.26.56 1.26 1.26 0 1.25.21 2.46.59 3.6.15.45.04.94-.3 1.28l-2.47 1.65Z" fill="currentColor"/><path d="M14.8 3.7a6.7 6.7 0 0 1 5.5 5.5" stroke="currentColor" stroke-width="2.15" stroke-linecap="round"/><path d="M14.7 7.65a3.15 3.15 0 0 1 1.65 1.65" stroke="currentColor" stroke-width="2.15" stroke-linecap="round"/></svg><span class="ssense-floating-cta__label">Call</span>' +
					'</a>' +
					'<a class="ssense-floating-cta__whatsapp" href="' + whatsappHref + '" target="_blank" rel="noopener" aria-label="Message S.Sense Salon and Spa on WhatsApp">' +
						'<span class="flaticon-whatsapp"></span><span class="ssense-floating-cta__label">WhatsApp</span>' +
					'</a>' +
					'<a class="ssense-floating-cta__instagram" href="https://www.instagram.com/S.Sensesalonandspa" target="_blank" rel="noopener" aria-label="Follow S.Sense Salon and Spa on Instagram">' +
						'<span class="flaticon-instagram"></span><span class="ssense-floating-cta__label">Instagram</span>' +
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
						$button.closest('.ssense-load-more-wrap').fadeOut(220);
					}, revealDelay);
				} else {
					setTimeout(function() { $button.prop('disabled', false); }, revealDelay);
				}
			});
		}

		ssenseReviewsPageInteractions();


	});
