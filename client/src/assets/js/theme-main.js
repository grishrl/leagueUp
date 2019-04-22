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

    $().UItoTop({
        scrollSpeed: 500,
        easingType: 'linear'
    });


});
