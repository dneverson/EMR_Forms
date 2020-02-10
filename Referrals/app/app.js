(function () {

    'use strict';

    /**
     * Application initialization.
     */
    angular
        .module('app', ['ui.bootstrap', 'ui.router', 'checklist-model'])
        .config(function ($locationProvider, $stateProvider, $urlRouterProvider) {

            $locationProvider.html5Mode(false);
            $urlRouterProvider.otherwise('/referrals');

            $stateProvider
                .state('referrals', {
                    url         : '/referrals',
                    templateUrl : 'app/referrals/referrals.html',
                    controller  : 'referralsController',
                    controllerAs: 'ref'
                })
                .state('Chronic Care Management', {
                    parent: 'referrals',
                    url   : '/Chronic-Care-Management',
                    views : {
                        'custom@referrals' : {
                            controller  : 'ccmController',
                            controllerAs: 'ccm',
                            templateUrl : 'app/ccm/ccm.html'
                        },
                        'message@referrals': {
                            controller  : 'ccmController',
                            controllerAs: 'ccm',
                            templateUrl: 'app/ccm/message.html'
                        }
                    }
                })
                .state('referrals.default', {
                    url  : '/{referralType}',
                    views: {
                        'custom@referrals' : {
                            templateUrl: 'app/referrals/general.html',
                            controller : 'genericController'
                        },
                        'message@referrals': {
                            templateUrl: 'app/referrals/message.html'
                        },
                        'problems@referrals': {
                            templateUrl: 'app/referrals/problems.html'
                        }
                    }
                });
        })
        // Work around for an issue wherein ng-view isn't loaded when nested within an ng-include
        // https://github.com/angular-ui/ui-router/issues/679
        .run(function ($state) {});
})();