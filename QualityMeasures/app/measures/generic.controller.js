(function() {
    'use strict';

    angular
        .module("app")
        .controller("genericController", ['$scope', 'measuresService', genericController]);

    function genericController($scope, measuresService) {
        measuresService.updateMeasureType($scope);
    }

})();