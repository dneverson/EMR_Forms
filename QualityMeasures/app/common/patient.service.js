(function(){
    'use strict';

    angular
        .module('app')
        .factory('patientService', [patientService]);

    function patientService() {
        var service = {
            patient: {}
        };

        initialize();

        function initialize() {
            service.patient = {
                name        : Mel.eval("{PATIENT.FIRSTNAME + ' ' + PATIENT.LASTNAME}"),
                dob         : Mel.eval("{PATIENT.DATEOFBIRTH}"),
                phone       : []
            };

            var cellPhone = Mel.eval("{PATIENT.CELLPHONE}");
            var workPhone = Mel.eval("{PATIENT.WORKPHONE}");
            var altPhone = Mel.eval("{PATIENT.ALTPHONE}");
            if (cellPhone) {service.patient.phone.push({ type : "Cell", number : cellPhone});}
            if (workPhone) {service.patient.phone.push({ type : "Work", number : workPhone});}
            if (altPhone)  {service.patient.phone.push({ type : "Alt", number : altPhone});}
        }

        return service;
    }
})();