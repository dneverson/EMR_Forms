(function(){
    'use strict';

    angular
        .module('app')
        .factory('referralsService', ['$location', referralsService]);

    function referralsService($location) {
        var service = {
            updateReferralType: updateReferralType
        };

        function updateReferralType($scope) {
            // Retrieve referral type from URL
            var referralType = $location.path().split('/');
            referralType = referralType[referralType.length - 1].split('-').join(' ');

            // Parent scope
            var ref = $scope.$parent.ref;

            // Update Referral Type selection drop-down
            var selectedReferralType = ref.referralOptions.filter(function (ele) {
                return ele.department == referralType;
            })[0];
            ref.referral.options = selectedReferralType;

            // Auto-select Preferred Provider drop-down if exists
            if (ref.referral.options != null)
                ref.referral.preferredProvider = ref.referral.options.showProviderList ? 'Soonest Available' : '';
        }

        return service;
    }
})();