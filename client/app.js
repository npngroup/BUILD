'use strict';

var modules = require('norman-client-tp').modules;

// Require optional modules
require('./requires.js');


// display angular errors using source-maps
angular.module('source-map-exception-handler', [])
.config(function ($provide) {
    $provide.decorator('$exceptionHandler', function ($delegate) {
        return function (exception, cause) {
            $delegate(exception, cause);
            throw exception;
        };
    });
});

angular.module('norman', modules)
    .config(function ($urlRouterProvider, $locationProvider, $httpProvider) {
        $urlRouterProvider.otherwise('/');
        $locationProvider.html5Mode(true);
        $httpProvider.defaults.xsrfCookieName = 'X-CSRF-Token';
        $httpProvider.defaults.xsrfHeaderName  = 'X-CSRF-Token';
    })
    .run(function ($rootScope, $location, NavBarService, AsideFactory, Auth) {
        $rootScope.navbarService = NavBarService;
        $rootScope.asideService = AsideFactory;

        // add state name as a class to the body
        $rootScope.$on('$stateChangeStart', function (ev, toState) {
            // add state name to body class
            $rootScope.pageClass = 'page-' + toState.name.replace(/\./g, '-');

            // redirect (aka deep-link)
            var path = $location.path().substr(1), redirect = $rootScope.redirect;
            Auth.getSecurityConfig()
                .then(function(d){
                    var settings = d.settings;
                    if (path === 'signup' && settings && settings.registration && settings.registration.self === false){
                        $location.path("/");
                    }
                    if (path === 'login' && settings && settings.provider && settings.provider.local === false){
                        $location.path("/");
                    }
                }).then(function(){
                    if (redirect && path !== 'login' && path !== 'signup') {
                        delete $rootScope.redirect;
                        $location.path(redirect);
                    }
                });
        });

    })
    .constant('jQuery', require('norman-client-tp').jquery);
