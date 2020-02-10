(function(){
    'use strict';

    angular
        .module('app')
        .factory('emailService', ['$http', '$log', emailService]);

    function emailService($http, $log){
        var service = {
            send: send
        };

        return service;

        function send(referral, onSuccess, onComplete){
            $http.post("http://websvr:90/api/referrals", referral)
                .success(function (data) {
                    onSuccess();
                })
                .error(function (data) {
                    $log.error(data);
                    toastr.error("An error occurred submitting your referral. Please alert I.S. @ Ext. 6990.");
                })
                .then(onComplete, onComplete);
        }
    }
})();
