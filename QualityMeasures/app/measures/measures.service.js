(function(){
    'use strict';

    angular
        .module('app')
        .factory('measuresService', ['$location', measuresService]);

    function measuresService($location) {
        var service = {
            updateMeasuresType: updateMeasuresType
        };

        function updateMeasuresType($scope) {
            // Retrieve referral type from URL
            var measuresType = $location.path().split('/');
            measuresType = measuresType[measuresType.length - 1].split('-').join(' ');

            // Parent scope
            var ref = $scope.$parent.ref;

            // Update Measure Type selection drop-down
            var selectedMeasuresType = ref.measuresOptions.filter(function (ele) {
                return ele.department == measuresType;
            })[0];
            ref.measure.options = selectedmeasuresType;

            // Auto-select Preferred Provider drop-down if exists
            if (ref.measure.options != null)
                ref.measure.preferredProvider = ref.referral.options.showProviderList ? 'Soonest Available' : '';
        }

        return service;
    }
})();