(function() {
    'use strict';

    angular
        .module("app")
        .controller("genericController", ['$scope', 'referralsService', genericController]);

    function genericController($scope, referralsService) {
        referralsService.updateReferralType($scope);
    }

})();