//main.JS
//--------------------------------------------------------------------------------------------------------------------------------
//This is JS file that contains principal fuctions of theme */
// -------------------------------------------------------------------------------------------------------------------------------
// Template Name: Sports Cup- Responsive HTML5  soccer and sports Template.
// Author: Iwthemes.
// Name File: main.js
// Version 1.0 - Created on 20 May 2014
// Last Update 3.0 -  on 20 Oct 2017
// Website: http://www.iwthemes.com
// Email: support@iwthemes.com
// Copyright: (C) 2017



$(document).ready(function($) {

    'use strict';


    //=========== Sticky nav ===========//
    $(".mainmenu").sticky({ topSpacing: 0 });

    //======== Nav Superfish ===========//
    $('ul.sf-menu').superfish();

    $(document).ready(function() {
        $('#mobile-nav').mmenu();
    });

    //======== Single Carousel ===========//
    $(".single-carousel").slick({
        lazyLoad: 'ondemand', // ondemand progressive anticipated
        infinite: true
    });



    //=================================== Counter  ==============================//

    $('#event-one').countdown('2018/06/14', function(event) {
        var $this = $(this).html(event.strftime('' +
            '<span>%D <br> <small>days</small></span>  ' +
            '<span>%H <br> <small>hr</small> </span>  ' +
            '<span>%M <br> <small>min</small> </span>  ' +
            '<span>%S <br> <small>sec</small></span> '));
    });


    //=================================== Subtmit Form  ===================================//

    $('.form-theme').submit(function(event) {
        event.preventDefault();
        var url = $(this).attr('action');
        var datos = $(this).serialize();
        $.get(url, datos, function(resultado) {
            $('.result').html(resultado);
        });
    });

    //=================================== Form Newslleter  =================================//

    $('#newsletterForm').submit(function(event) {
        event.preventDefault();
        var url = $(this).attr('action');
        var datos = $(this).serialize();
        $.get(url, datos, function(resultado) {
            $('#result-newsletter').html(resultado);
        });
    });


    $(document).ready(function() {
        /*var feed = new Instafeed({
            get: 'user',
            userId: '',
            limit: 6,
            resolution: 'standard_resolution',
            template: '<div class="insta-items"><a href="{{link}}" target="_blank" id="{{id}}"><img src="{{image}}" /></a></div>',
            accessToken: '',
        });

        feed.run();*/
    });

    //=====Ligbox=====//
    $('.swipebox-ligbox').swipebox({
        useCSS: true, // false will force the use of jQuery for animations
        useSVG: true, // false to force the use of png for buttons
        initialIndexOnArray: 0, // which image index to init when a array is passed
        hideCloseButtonOnMobile: false, // true will hide the close button on mobile devices
        removeBarsOnMobile: true, // false will show top bar on mobile devices
        hideBarsDelay: 3000, // delay before hiding bars on desktop
        videoMaxWidth: 1140, // videos max width
        beforeOpen: function() {}, // called before opening
        afterOpen: null, // called after opening
        afterClose: function() {}, // called after closing
        loopAtEnd: false // true will return to the first image after the last image is reached
    });


    //=================================== Portfolio Filters  ==============================//

    $(window).load(function() {
        var $container = $('.portfolioContainer');
        $container.isotope({
            filter: '*',
            animationOptions: {
                duration: 750,
                easing: 'linear',
                queue: false
            }
        });

        $('.portfolioFilter a').click(function() {
            $('.portfolioFilter .current').removeClass('current');
            $(this).addClass('current');
            var selector = $(this).attr('data-filter');
            $container.isotope({
                filter: selector,
                animationOptions: {
                    duration: 750,
                    easing: 'linear',
                    queue: false
                }
            });
            return false;
        });
    });


    $('[data-toggle="popover"]').popover();

    //=================================== Totop  ============================================//

    $().UItoTop({
        scrollSpeed: 500,
        easingType: 'linear'
    });

    //=================================== Hover Efects =====================================//
    $('.item-boxed-img').hover(function() {
        $(this).toggleClass('animated pulse');
    });


    //================================== Grid Gallery ====================================//

    $('#ri-grid').gridrotator({

        // number of rows
        rows: 2,

        // number of columns
        columns: 8,

        // rows/columns for different screen widths
        // i.e. w768 is for screens smaller than 768 pixels
        w1024: {
            rows: 2,
            columns: 6
        },

        w768: {
            rows: 2,
            columns: 5
        },

        w480: {
            rows: 2,
            columns: 4
        },

        w320: {
            rows: 2,
            columns: 3
        },

        w240: {
            rows: 2,
            columns: 3
        },

        // step: number of items that are replaced at the same time
        // random || [some number]
        // note: for performance issues, the number should not be > options.maxStep
        step: 'random',
        maxStep: 3,

        // prevent user to click the items
        preventClick: true,

        // animation type
        // showHide || fadeInOut || slideLeft ||
        // slideRight || slideTop || slideBottom ||
        // rotateLeft || rotateRight || rotateTop ||
        // rotateBottom || scale || rotate3d ||
        // rotateLeftScale || rotateRightScale ||
        // rotateTopScale || rotateBottomScale || random
        animType: 'random',

        // animation speed
        animSpeed: 600,

        // animation easings
        animEasingOut: 'linear',
        animEasingIn: 'linear',

        // the item(s) will be replaced every 3 seconds
        // note: for performance issues, the time "can't" be < 300 ms
        interval: 2500,
        // if false the animations will not start
        // use false if onhover is true for example
        slideshow: true,
        // if true the items will switch when hovered
        onhover: false,
        // ids of elements that shouldn't change
        nochange: []

    });

});