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
                name        : EvaluateMel("{PATIENT.FIRSTNAME + ' ' + PATIENT.LASTNAME}"),
                dob         : EvaluateMel("{PATIENT.DATEOFBIRTH}"),
                phone       : []
            };

            var cellPhone = EvaluateMel("{PATIENT.CELLPHONE}");
            var workPhone = EvaluateMel("{PATIENT.WORKPHONE}");
            var altPhone = EvaluateMel("{PATIENT.ALTPHONE}");
            if (cellPhone) {service.patient.phone.push({ type : "Cell", number : cellPhone});}
            if (workPhone) {service.patient.phone.push({ type : "Work", number : workPhone});}
            if (altPhone)  {service.patient.phone.push({ type : "Alt", number : altPhone});}
        }

        return service;
    }
})();
