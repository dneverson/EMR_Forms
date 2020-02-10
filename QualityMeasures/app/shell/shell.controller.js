(function() {
    'use strict';

    angular
        .module("app")
        .controller("shellController", ['patientService', ccmController]);

    function ccmController(patientService) {
        var vm = this;

        vm.patient = {};

        initialize();

        function initialize() {
            vm.patient = patientService.patient;
        }
    }

})();