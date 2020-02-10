(function() {
    'use strict';

    angular
        .module("app")
        .controller("ccmController", ['$scope', 'ccmService', 'emailService', 'patientService', 'referralsService', ccmController]);

    function ccmController($scope, ccmService, emailService, patientService, referralsService) {
        referralsService.updateReferralType($scope);

        $scope.message = '';
        $scope.progressBar = false;
        $scope.service = {};
        var referral = {};
        this.sendReferral = sendReferral;

        initialize();

        function initialize() {
            $scope.service = ccmService;

            var userFullName = Mel.eval("{USER.REALNAME}");
            var EMAIL_TO = "bhoffman@valleymedicalcenter.com";
            var EMAIL_FROM = Mel.eval("{USER.LOGINNAME}") + "@valleymedicalcenter.com";
            referral = {
                options             : {email: {to: EMAIL_TO, from: EMAIL_FROM, subject: "CCM Referral Request from " + userFullName }},
                patient             : patientService.patient,
                preferredProvider   : "",
                referringProvider   : "",
                message             : "A flag was sent to the CCM Generic Nurse account for this patient."
            };
        }

        function sendReferral(form) {
            if (form.$valid) {
                switch ($scope.service.opt) {
                    case 'in':
                        $scope.progressBar = true;
                        emailService.send(referral, onSuccess, onComplete);
                        break;
                    case 'out':
                        Mel.eval('{DOCUMENT.REFERRALSNOTE = DOCUMENT.REFERRALSNOTE + \'Discussed the benefits of Chronic Case Management Services and this program has been recommended. Patient has declined participation.\' + HRET}');
                        Mel.eval('{OBSNOW(\'CCM CONTRACT\', \'opt out\')}');
                        toastr.info('Patient has been opted OUT of CCM');
                        resetForm(form);
                        break;
                    default:
                        toastr.error('Please select an opt in/out option');
                        break;
                }
            }

            function onSuccess() {
                Mel.eval('{DOCUMENT.REFERRALSNOTE = DOCUMENT.REFERRALSNOTE + \'Discussed the benefits of Chronic Case Management Services and this program has been recommended. A referral has been sent to the CCM RN Case Manager.\' + HRET}');
                Mel.eval('{MEL_SEND_FLAG("Flag", "ccmgenericnurse", "N", str(._todaysdate), "CCM Referral", "' + $scope.message + '", "Summary")}');
                toastr.success('A flag will be sent to a CCM RN Case Manager desktop for review/action.');
                resetForm(form);
            }

            function onComplete() {
                $scope.progressBar = false;
            }
        }

        function resetForm(form) {
            if (form) {
                $scope.service.opt = '';
                $scope.message = '';
                form.$setPristine();
                form.$setUntouched();
            }
        }
    }

})();