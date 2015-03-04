'use strict';
var app = angular.module('FullstackGeneratedApp', ['ui.router', 'fsaPreBuilt', 'ngCookies']);

app.controller('MainController', function ($scope, $cookies, $cookieStore) {


    console.log($window);
    
    console.log($cookieStore, 'this is cookie store');
    $cookieStore.put('cart', 'temp');
    console.log($cookies, 'this is cookie');


    // Given to the <navbar> directive to show the menu.
    $scope.menuItems = [
        { label: 'Home', state: 'home' },
        { label: 'About', state: 'about' },
        { label: 'Tutorial', state: 'tutorial'},
        { label: 'SignUp', state: 'signup'},
        { label: 'Coffee', state: 'coffee' },
        { label: 'Mint', state: 'mint' },
        { label: 'Sign In', state: 'signIn' },
        { label: 'Cart', state: 'cart' }
    ];

});


app.config(function ($urlRouterProvider, $locationProvider) {
    // This turns off hashbang urls (/#about) and changes it to something normal (/about)
    $locationProvider.html5Mode(true);
    // If we go to a URL that ui-router doesn't have registered, go to the "/" url.
    $urlRouterProvider.otherwise('/');
});