(function () {

    'use strict';

    /**
     * Application initialization.
     */
    angular
        .module('app', ['ui.bootstrap', 'ui.router', 'checklist-model'])
        .config(function ($locationProvider, $stateProvider, $urlRouterProvider) {

            $locationProvider.html5Mode(false);
            $urlRouterProvider.otherwise('/measures');

            $stateProvider
                .state('measures', {
                    url         : '/measures',
                    templateUrl : 'app/measures/measures.html',
                    controller  : 'measuresController',
                    controllerAs: 'ref'
                })
                .state('Chronic Care Management', {
                    parent: 'measures',
                    url   : '/Chronic-Care-Management',
                    views : {
                        'custom@measures' : {
                            controller  : 'ccmController',
                            controllerAs: 'ccm',
                            templateUrl : 'app/ccm/ccm.html'
                        },
                        'message@measures': {
                            controller  : 'ccmController',
                            controllerAs: 'ccm',
                            templateUrl: 'app/ccm/message.html'
                        }
                    }
                })
                .state('measures.default', {
                    url  : '/{measureType}',
                    views: {
                        'custom@measures' : {
                            templateUrl: 'app/measures/general.html',
                            controller : 'genericController'
                        },
                        'message@measures': {
                            templateUrl: 'app/measures/message.html'
                        }
                    }
                });
        })
        // Work around for an issue wherein ng-view isn't loaded when nested within an ng-include
        // https://github.com/angular-ui/ui-router/issues/679
        .run(function ($state) {});
})();