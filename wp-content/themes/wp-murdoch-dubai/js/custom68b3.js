var $ = jQuery.noConflict();

// Open Navigation Menu by click on mobile
// disabled for UPA
(function($){
    /*$('.dropdown-menu .dropdown-toggle').on('click', function(e) {
        if (!$(this).next().hasClass('show')) {
            $(this).parents('.dropdown-menu').first().find('.show').removeClass("show");
        }
        var $subMenu = $(this).next(".dropdown-menu");
        if ( $subMenu.hasClass( 'show') ) {
            $subMenu.removeClass('show');
        } else {
            $subMenu.addClass('show');
        }
        //$subMenu.toggleClass('show');

        $(this).parents('li.nav-item.dropdown.show').on('hidden.bs.dropdown', function(e) {
            $('.dropdown-submenu .show').removeClass("show");
        });

        return false;
    });*/
})(jQuery);

// Open background search panel on mobile
/***
$('#mobile_site_search_container').on('show.bs.dropdown', function () {
    $('.mobile-search-overlay').addClass('active');
    $('body').addClass('no-scroll');
});


// Close background search panel on mobile
$('#mobile_site_search_container').on('hide.bs.dropdown', function () {
    $('.mobile-search-overlay').removeClass('active');
    $('body').removeClass('no-scroll');
});
***/

// Toggle up/down arrows on mobile menu
$('.mobile_nav_item_toggler').on('click', function(event) {
    var target_element = event.target;
    var target_element_node = event.target.nodeName;
    console.log(target_element);

    if(target_element_node == 'SPAN') {
        var top_level_icons = $('.mobile_nav_item_toggler_icon.level-0').not($(target_element));
        $(target_element).toggleClass("fa-chevron-down fa-chevron-up");
    } else if(target_element_node == 'DIV') {
        var top_level_icons = $('.mobile_nav_item_toggler_icon.level-0').not($(target_element.querySelector('span')));
        $(target_element.querySelector('span')).toggleClass("fa-chevron-down fa-chevron-up");
    }
    if(top_level_icons.hasClass('fa-chevron-up')) {
        top_level_icons.removeClass('fa-chevron-up');
        top_level_icons.addClass('fa-chevron-down');
    }
});

$(document).ready(function(){

    $('.close-mega-menu').click(function() {
        $('.navlink.dropdown-toggle').removeClass('show');
        $('.dropdown-menu.megamenu').removeClass('show');
    });

    // Change hamburger menu icon
    $('#ChangeToggle').click(function() {
        $('#navbar-hamburger').toggleClass('d-none');
        if($('#navbar-close').hasClass('d-none')) {
            $('#navbar-close').removeClass('d-none');
            $('#main_navigation_toggle').addClass('show');
        } else {
            $('#navbar-close').addClass('d-none');
            $('#main_navigation_toggle').removeClass('show');
        }
    });

    // Site Search Validation
    $('.dropdown-menu.dropdown-menu-right').on('click', function(e) {
        e.stopPropagation();
    });
    $('.site-search-form-nav').submit(function(e){
        $('.site-search-err-nav').addClass('d-none');
        if($('.site-search-input-nav').val() == '') {
            e.preventDefault();
            $('.site-search-err-nav').removeClass('d-none');
        }
    });
    $('.site-search-form').submit(function(e){
        $('.site-search-err').addClass('d-none');
        if($('.site-search-input').val() == '') {
            e.preventDefault();
            $('.site-search-err').removeClass('d-none');
        }
    });


    $delayClass = '';
    $(document).on('mouseenter', '.submenu-button', function () {
    //$('.nav-item-desktop.dropdown').hover(function() {
        //$(this).addClass("nav-arrow-active");


        var parentclass = $(this).parent();

        $delayClass = setTimeout(function(){

            $(parentclass).find('.dropdown-menu').fadeIn();
            $(this).addClass("nav-arrow-active");
        }, 1000);

        //$(parentclass).find('.dropdown-menu').delay(800).fadeIn();




        $this = $(this);

    });

    $(document).on('mouseleave', '.submenu-button', function () {
    //$('.nav-item-desktop.dropdown').hover(function() {

        $(this).removeClass("nav-arrow-active");

        var parentclass = $(this).parent();

        clearTimeout($delayClass);

        $delayClass = setTimeout(function(){
            $(parentclass).find('.dropdown-menu').fadeOut();
        }, 1000);

        //$(parentclass).find('button').removeClass('nav-arrow-active');
    });

    $('#menu-main-nav > .menu-item').hover(function() {
        clearTimeout($delayClass);
        $('#menu-main-nav .menu-item .dropdown-menu').hide();

            $(this).find('.sub-menu').show();
            $(this).find('.dropdown-menu').addClass("nav-arrow-active");

    },
    function() { // leave hover

        clearTimeout($delayClass);
        $('#menu-main-nav .menu-item .dropdown-menu').hide();
        $delayClass = setTimeout(function(){

            $(this).find('.sub-menu').hide();
            $(this).find('.dropdown-menu').addClass("nav-arrow-active");
        }, 1000);
    });

    $('.sub-menu .menu-item').hover(function() {
        clearTimeout($delayClass);

        $(this).parent().siblings(".submenu-button").addClass("nav-arrow-active");
        $(this).parent().show();
    },
    function () { // leave hover

        $(this).parent().hide();
        $(this).parent().siblings(".submenu-button").removeClass("nav-arrow-active");
    });

    // Add smooth scrolling to all links
    $(".a-z-content a").on('click', function(event) {
        if (this.hash !== "") {
            // Prevent default anchor click behavior
            event.preventDefault();
            // Store hash
            var hash = this.hash;
            // The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area
            $('html, body').animate({
                scrollTop: $(hash).offset().top
            }, 800, function(){
                // Add hash (#) to URL when done scrolling (default click behavior)
                window.location.hash = hash;
            });
        } // End if
    });


    // Add card shadow on hover
    $( '.news-events-social-feeds .media' ).hover(function(){
        $(this).addClass( 'shadow' );

    }, function(){
        $(this).removeClass( 'shadow' );
    });

    //Scroll to top
    var $window = $(window);
    var $buttonTop = $('.scroll-top')
    var scrollTimer;
    $('.scroll-top').on('click', function () {
        $('html, body').animate({
            scrollTop: 0,
        }, 400);
    });

    $window.on('scroll', function () {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(function() {
            if ($window.scrollTop() > 100) {
                $buttonTop.addClass('scroll-top-visible');
            } else {
                $buttonTop.removeClass('scroll-top-visible');
            }
        }, 250);
    });

    // Navigation accessibility
    var menuItems = document.querySelectorAll('#menu-main-nav li.dropdown');
    Array.prototype.forEach.call(menuItems, function (el, i) {
        var activatingA = el.querySelector('a');
        var customClass = $(activatingA).attr('id');

        var btn = '<button class="btn-'+customClass+' submenu-button"><span><span class="visuallyhidden">show submenu for ' + activatingA.text + '</span></span></button>';
        activatingA.insertAdjacentHTML('afterend', btn);

        el.querySelector('button').addEventListener("click", function (event) {
            var thisElement = (this.className);

            //console.log( $(this).parents().hasClass('active'));

            var parent_active = false;
            if ( $(this).parents().hasClass('active') ) {
                parent_active = true;
            }


            //console.log($('.'+thisElement).next().next());
            //if (this.parentNode.className == "dropdown") {

            var findclassname = "dropdown open";

            if(this.parentNode.className.indexOf('dropdown') != -1 &&
                this.parentNode.className.indexOf('open') != -1) {

                this.parentNode.className = "dropdown";
                this.parentNode.querySelector('a').setAttribute('aria-expanded', "true");
                this.parentNode.querySelector('button').setAttribute('aria-expanded', "true");
                //this.parentNode.querySelector('ul').setAttribute('class', "dropdown-menu open");
                this.parentNode.querySelector('ul').setAttribute('aria-expanded', "true");
                //$('.dropdown ul.dropdown-menu').hide();
                $('.' + thisElement).next().next().hide();

            } else if (this.parentNode.className.indexOf('dropdown') != -1) {
                this.parentNode.className = "dropdown  open";
                this.parentNode.querySelector('a').setAttribute('aria-expanded', "true");
                this.parentNode.querySelector('button').setAttribute('aria-expanded', "true");
                //this.parentNode.querySelector('ul').setAttribute('class', "dropdown-menu open");
                this.parentNode.querySelector('ul').setAttribute('aria-expanded', "true");
                //$('.dropdown ul.dropdown-menu').show();
                $('.' + thisElement).next().next().show();

            } else {
                this.parentNode.className = "dropdown";
                this.parentNode.querySelector('a').setAttribute('aria-expanded', "false");
                this.parentNode.querySelector('button').setAttribute('aria-expanded', "false");
                //this.parentNode.querySelector('ul').setAttribute('class', "dropdown-menu");
                this.parentNode.querySelector('ul').setAttribute('aria-expanded', "false");
                //$('.dropdown ul.dropdown-menu').hide();
                $('.' + thisElement).next().next().hide();

            }

            if (parent_active == true) {
                $(this).parent().addClass('active');
            }
            event.preventDefault();
        });
    });

    $(document).on('click', '.submenu-button', function () {
    //$('.submenu-button').click(function() {

        if ( $(this).hasClass("nav-arrow-active") ) {
            $(this).removeClass('nav-arrow-active');
            $(this).siblings('.sub-menu').hide();

        } else {
            $('.submenu-button').removeClass('nav-arrow-active');
            $('.sub-menu').hide();

            $(this).addClass('nav-arrow-active');
            $(this).siblings('.sub-menu').show();
        }
    });


    var singleMenuItems = document.querySelectorAll('#menu-main-nav li');
    Array.prototype.forEach.call(singleMenuItems, function (el, i) {

        el.querySelector('a').addEventListener("focus", function (event) {

            //if (this.parentNode.className == "dropdown") {
            if (this.className.indexOf('dropdown-toggle') == -1 &&
                this.className.indexOf('dropdown-item') == -1) {
                $('.dropdown ul.dropdown-menu').hide();

                var listItems = $("#menu-main-nav li");
                listItems.each(function (i) {
                    //console.log(idx);
                    var classname = $(this).attr('class');
                    var attributeId = $(this).attr('id');
                    if (classname.indexOf('open') != -1 ) {

                        $('#'+attributeId).removeClass("open");
                    }

                });
            }

            event.preventDefault();
        });
    });

    var searchMenu = document.querySelectorAll('.header__navbar div.header__menu-global-search-desktop');
    Array.prototype.forEach.call(searchMenu, function (el, i) {
        //console.log(el);
        el.querySelector('button').addEventListener("focus", function (event) {

            $('.dropdown ul.dropdown-menu').hide();

            var listItems = $("#menu-main-nav li");
            listItems.each(function (i) {
                //console.log(idx);
                var classname = $(this).attr('class');
                var attributeId = $(this).attr('id');
                if (classname.indexOf('open') != -1) {

                    $('#' + attributeId).removeClass("open");
                }

            });

            event.preventDefault();
        });
    });

    /***
    // reduced header size (height on scroll)
    $(document).on("scroll", function(){

        if ($(document).scrollTop() > 80){
            $(".header__navbar .header-contact .contact-item").addClass("shrink");
            $(".header__logo.desktop").addClass("shrink");
        } else {
            $(".header__navbar .header-contact .contact-item").removeClass("shrink");
            $(".header__logo.desktop").removeClass("shrink");
        }

    });***/
});

$(window).on('load', function(){
    // Remove Table inline style attribute
    $('th,tr,td').css('font-family','');
});

$(".event-select-widget").on('change', function(){
    var param_value = $(this).val();
    var param_name = $(this).prop('name');
    var page_url = $(this).data('page-url');
    window.location.href = page_url + '?' + param_name + '=' + param_value;
});

$(".news-select-widget").on('change', function(){
    var param_value = $(this).val();
    var param_name = $(this).prop('name');
    var page_url = $(this).data('page-url');
    window.location.href = page_url + '?' + param_name + '=' + param_value;
});

$(".future-event-select-widget").on('change', function(){
    var param_value = $(this).val();
    var param_name = $(this).prop('name');
    var page_url = $(this).data('page-url');
    window.location.href = page_url + '?' + param_name + '=' + param_value;
});

$(".events-by-month-select-widget").on('change', function(){
    var param_value = $(this).val();
    var param_name = $(this).prop('name');
    var page_url = $(this).data('page-url');
    window.location.href = page_url + '?' + param_name + '=' + param_value;
});

$(".news-by-month-select-widget").on('change', function(){
    var param_value = $(this).val();
    var param_name = $(this).prop('name');
    var page_url = $(this).data('page-url');
    window.location.href = page_url + '?' + param_name + '=' + param_value;
});

$(".blog-select-widget").on('change', function(){
    var param_value = $(this).val();
    var param_name = $(this).prop('name');
    var page_url = $(this).data('page-url');
    console.log(page_url + '?' + param_name + '=' + param_value);
    window.location.href = page_url + '?' + param_name + '=' + param_value;
});

/***** Entry Requirements */
$(".entry-requirements-select").on('change', function(e){
    e.preventDefault();
    var component_id = $(this).data('entry-req-id');
    var option_value = $(this).val();

    $(".entry-requirements-content-item-"+component_id).hide();
    $("."+component_id+'-'+option_value).show();

});
/***** End Entry Requirements */

/*** Staff Team ***/
$(".staff-more").on('click', function(e) {

    var expanded = $(this).text().trim();
    var btn_id = $(this).attr('more-btn-id');
    var group_id = $(this).attr('staff-team-group-id');

    if (expanded == 'Show More...') {
        $('.staff-team-group-' + group_id + ' .staff-more').text('Show More...');
        $('.' + btn_id).text('Show Less');

    } else {
        $('.' + btn_id).text('Show More...');
    }

});
/*** End Staff Team ***/

/*** Bootstrap Mega Menu ***/
document.addEventListener("DOMContentLoaded", function(){
    /////// Prevent closing from click inside dropdown
    document.querySelectorAll('.dropdown-menu').forEach(function(element){
        element.addEventListener('click', function (e) {
            e.stopPropagation();
        });
    })
});
/*** End Bootstrap Mega Menu ***/

jQuery('.accordion  .card a').on('click', function() {
    // Reference https://wordpress.org/support/topic/header-column-width/
    var table_wrap = $(this).parent().siblings().find('.supsystic-tables-wrap');

    table_wrap.each(function() {
        //var fields = table_wrap.attr('id').split('-');
        var fields = $(this).attr('id').split('-');

        var table_id_fields = fields[2].split('_');

        var table_id = table_id_fields[0];

        window.supsystic.Tables.getTableInstanceById(table_id).fnAdjustColumnSizing();
    });
});

/***** Video Iframe load */
$('.youtube-video').on('click', function () {
    var wrapper = $(this);
    var thumbnail = wrapper.children('img');
    var video_id = wrapper.data('videoId');
    var video_source = wrapper.data('videoSource');
    var video_source_url = '';
    if ( video_source == 'vimeo' ) {
        video_source_url = 'https://player.vimeo.com/video/' + video_id + '?autoplay=1&rel=0';
    } else {
        video_source_url = 'https://www.youtube.com/embed/' + video_id + '?autoplay=1';
    }

    var embed = document.createElement('iframe');
    embed.src = video_source_url;
    embed.title = thumbnail.attr('alt');
    embed.allow = 'autoplay; fullscreen; picture-in-picture';
    embed.allowFullscreen = true;
    embed.width = '100%';
    embed.height = '100%';
    embed.rel = 0;
    wrapper.html('');
    wrapper.append(embed);
});
/***** End Video Iframe load */

/***
 el.querySelector('button').addEventListener("click", function (event) {*/