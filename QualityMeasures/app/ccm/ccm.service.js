(function(){
    'use strict';

    angular
        .module('app')
        .factory('ccmService', [ccmService]);

    function ccmService() {
        var service = {
            opt: ''
        };

        return service;
    }
})();