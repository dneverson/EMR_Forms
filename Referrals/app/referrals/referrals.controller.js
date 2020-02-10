/**
 * Referral's Controller
 * @namespace Modules
 */
(function() {
    'use strict';

    angular
        .module("app")
        .controller("referralsController", ['$state', 'emailService', 'patientService', referralsController]);

        /**
         * @name referralsController
         * @desc Referrals controller
         * @param emailService Service that sends an e-mail upon successful referral submission
         * @memberOf Modules
         * @constructor
         */
        function referralsController($state, emailService, patientService) {
            var vm = this;

            vm.patient = patientService.patient;
            vm.progressBar = false;
            vm.providers = [];
            vm.referral = {};
            vm.referralOptions = [];
            vm.problemOptions = [];
            vm.stateChange = stateChange;
            vm.submitReferral = submitReferral;

            initialize();

            function initialize(){

                //TODO: Store and query from DB via an AngularJS Service
                vm.providers = [
                    {name: "Ambroson, Craig MD", departments: ["Primary Care Provider Request (Peds)"]},
                    {name: "Arnzen, Barbara PA", departments: ["Dermatology"]},
                    {name: "Bell, Adam DO", departments: ["Surgery"]},
                    {name: "Bigsby, Geneen DO", departments: ["OBGYN (Gynecology)"]},
                    {name: "Blankenship, Beth PA", departments: ["Pain Management"]},
                    {name: "Carasali, Natale", departments: ["Primary Care Provider Request (Peds)"]},
                    {name: "Carpenter, Todd", departments: ["Primary Care Provider Request (Adult)"]},
                    {name: "Carpenter, Stephanie", departments: ["Mental Health (Adult)"]},
                    {name: "Capdeboscq, Linda", departments: ["Rheumatology"]},
                    {name: "Cochran, John MD", departments: ["Urology"]},
                    {name: "Davis, Heather", departments:["Mental Health (Peds)", "Primary Care Provider Request (Peds)"]},
                    {name: "Dykstra, Tim DO", departments: ["Internal Medicine", "Primary Care Provider Request (Adult)"]},
                    {name: "Edgehouse, Kristin", departments: ["Primary Care Provider Request (Peds)"]},
                    {name: "Eggleston, Melanie", departments: ["Internal Medicine", "Primary Care Provider Request (Adult)"]},
                    {name: "Ellis, Carol NP", departments: ["Primary Care Provider Request (Adult)"]},
                    {name: "Grinage, Jennifer", departments:["Occupational Medicine"]},
                    {name: "Hedrick, Andrea CNM", departments: ["OB/GYN (Obstetrics)"]},
                    {name: "Hedrick, Frances MD", departments: ["Primary Care Provider Request (Adult)"]},
                    {name: "Hoffmann, Brian MD", departments: ["Surgery"]},
                    {name: "Jefferson, Glenn MD", departments: ["Primary Care Provider Request (Adult)"]},
                    {name: "Justis, Darby MD", departments: ["Primary Care Provider Request (Peds)"]},
                    {name: "Krisher, Ted MD", departments: ["Primary Care Provider Request (Peds)"]},
                    {name: "Leon, Scott MD", departments: ["Primary Care Provider Request (Adult)"]},
                    {name: "Mahal, Richard NP", departments: ["Primary Care Provider Request (Adult)"]},
                    {name: "Mallory, Cheryl MD", departments: ["Primary Care Provider Request (Adult)"]},
                    {name: "Morris, Kathy NP", departments: ["Primary Care Provider Request (Adult)"]},
                    {name: "Natale, Carasali MD", departments: ["Primary Care Provider Request (Peds)"]},
                    {name: "Petersen, David MD", departments: ["Primary Care Provider Request (Adult)"]},
                    {name: "Schug, Andy PA", departments: [""]},
                    {name: "Schultz, Greg MD", departments: ["Primary Care Provider Request (Peds)"]},
                    {name: "Steiger, Irwin MD", departments: ["Primary Care Provider Request (Adult)"]},
                    {name: "Stolte, Carmen NP", departments: ["Primary Care Provider Request (Adult)"]},
                    {name: "Urquhart, Sean MD", departments: ["OBGYN (Gynecology)", "OBGYN (Obstetrics)"]},
                    {name: "Washington, Neil DPM", departments: ["Podiatry"]},
                    {name: "Watson, Alex MD", departments: ["OBGYN (Gynecology)", "OBGYN (Obstetrics)"]},
                    {name: "Willis, Charla MD", departments: ["Internal Medicine", "Primary Care Provider Request (Adult)"]}
                ];

                vm.referringProviders = getProviders();

                vm.referral = {
                    options        : {},
                    patient     : vm.patient,
                    preferredProvider   : "",
                    referringProvider   : EvaluateMel('{DOCUMENT.PROVIDER}'),
                    problems     : {},
                    message       : "",
                    urgent      : ""
                };

                vm.master = angular.copy(vm.referral);

                var userFullName = EvaluateMel("{USER.REALNAME}");
                var EMAIL_TO = "ECNurseAcct@valleymedicalcenter.com";
                var EMAIL_FROM = EvaluateMel("{USER.LOGINNAME}") + "@valleymedicalcenter.com";

                //TODO: Store and query from DB via an AngularJS Service
                vm.referralOptions = [
                    {department: "Adult Protective Services", chartNoteText: "An Adult Protective Services request has been sent to the referral specialist.", showProviderList: false},
                    {department: "Allergy Testing ", chartNoteText: "A Allergy Test request has been sent to the referral specialist.", showProviderList: false},
										{department: "Audiology", chartNoteText: "An Audiology request has been sent to the referral specialist.", showProviderList: false},
                    {department: "Behavioral Health", chartNoteText: "A Behavioral Health request has been sent to the referral specialist.", showProviderList: false},
                    {department: "Cardiology", chartNoteText: "A Cardiology request has been sent to the referral specialist.", showProviderList: false},
                    {department: "Coumadin Management", chartNoteText: "A Coumadin Management request has been sent to the referral specialist.", showProviderList: false},
                    {department: "Counseling", chartNoteText: "A Counseling request has been sent to the referral specialist.", showProviderList: false},
                    {department: "Dermatology", chartNoteText: "A Dermatology request has been sent to the referral specialist.", showProviderList: false},
                    {department: "Diabetic Education", chartNoteText: "A Diabetic Education request has been sent to the referral specialist.", showProviderList: false},
                    {department: "Diabetic Management", chartNoteText: "A Diabetic Management request has been sent to the referral specialist.", showProviderList: false},
                    {department: "Emergency Transport", chartNoteText: "An Emergency Transport request has been sent to the referral specialist.", showProviderList: false},
                    {department: "Endocrinology", chartNoteText: "An Endocrinology request has been sent to the referral specialist.", showProviderList: false},
                    {department: "ENT", chartNoteText: "An ENT request has been sent to the referral specialist.", showProviderList: false},
                    {department: "Gastroenterology", chartNoteText: "A Gastroenterology request has been sent to the referral specialist.", showProviderList: false},
                    {department: "General Surgery", chartNoteText: "A General Surgery request has been sent to the referral specialist.", showProviderList: false},
										{department: "Genetic Testing", chartNoteText: "A Genetic Test request has been sent to the referral specialist.", showProviderList: false},
                    {department: "Gynecology", chartNoteText: "A Gynecology request has been sent to the referral specialist.", showProviderList: false},
                    {department: "Home Health", chartNoteText: "A Home Health request has been sent to the referral specialist.", showProviderList: false},
										{department: "In Home Visit", chartNoteText: "A In Home Visit request has been sent to the referral specialist.", showProviderList: false},
                    {department: "Nephrology", chartNoteText: "A Nephrology request has been sent to the referral specialist.", showProviderList: false},
                    {department: "Neurocognitive", chartNoteText: "A Neurocognitive request has been sent to the referral specialist.", showProviderList: false},
                    {department: "Neurology", chartNoteText: "A Neurology request has been sent to the referral specialist.", showProviderList: false},
                    {department: "Obstetrics", chartNoteText: "An Obstetrics request has been sent to the referral specialist.", showProviderList: false},
                    {department: "Occupational Medicine", chartNoteText: "An Occupational Medicine request has been sent to the referral specialist.", showProviderList: false},
                    {department: "Oncology Hematology", chartNoteText: "An Oncology/Hematology request has been sent to the referral specialist.", showProviderList: false},
                    {department: "Ophthalmology", chartNoteText: "An Ophthalmology request has been sent to the referral specialist.", showProviderList: false},
                    {department: "Orthopedic", chartNoteText: "An Orthopedic request has been sent to the referral specialist.", showProviderList: false},
                    {department: "Other", chartNoteText: "A General Consult request has been sent to the referral specialist.", showProviderList: false},
                    {department: "Pain Management", chartNoteText: "A Pain Management Consult request has been sent to the referral specialist.", showProviderList: false},
                    {department: "PCP Request", chartNoteText: "A PCP Request has been sent to the referral specialist.", showProviderList: false},
                    {department: "Physical Therapy", chartNoteText: "A Physical Therapy request has been sent to the referral specialist.", showProviderList: false},
                    {department: "Podiatry", chartNoteText: "A Podiatry request has been sent to the referral specialist.", showProviderList: false},
                    {department: "Pulmonary", chartNoteText: "A Pulmonary request has been sent to the referral specialist.", showProviderList: false},
                    {department: "Respite Care", chartNoteText: "A Respite Care request has been sent to the referral specialist.", showProviderList: false},
                    {department: "Rheumatology", chartNoteText: "A Rheumatology request has been sent to the referral specialist.", showProviderList: false},
                    {department: "Speech Occupational Therapy", chartNoteText: "A Speech/Occupational Therapy request has been sent to the referral specialist.", showProviderList: false},
                    {department: "Tobacco Cessation", chartNoteText: "A Tobacco Cessation request has been sent to the referral specialist.", showProviderList: false},
                    {department: "Urology", chartNoteText: "A Urology request has been sent to the referral specialist.", showProviderList: false},
                    {department: "Weight and Wellness", chartNoteText: "A Weight & Wellness request has been sent to the referral specialist.", showProviderList: false},
                    {department: "Wound Care", chartNoteText: "A Wound Care request has been sent to the referral specialist.", showProviderList: false},
                    {department: "Chronic Care Management", chartNoteText: "The patient has ACCEPTED/DENIED opting into the Chronic Care Management program.", email: {to: EMAIL_TO, from: EMAIL_FROM, subject: "Chronic Care Management Referral Request from " + userFullName }, showProviderList: false}
                ];
            }


            /**
             * Resets the form to its Initialized state.
             * @param form
             */
            function reset(form) {
                if (form){
                    form.$setPristine();
                    form.$setUntouched();
                }
                vm.referral = angular.copy(vm.master);
            }

            function getProviders() {
                var emrProviders = EvaluateMel('{GET_USER_LIST("VMC", "", "delimited")}').split('|'); //EMR-Physician
                var emrProviderNames = [];

                var providerSearchName = '';
                var providerRealName = '';
                var PROVIDER_NAME = 1;
                for (var i = 0; i < emrProviders.length; i++) {
                    providerSearchName = emrProviders[i].split('^')[PROVIDER_NAME];
                    providerRealName = providerSearchName.split(',');
                    providerRealName = providerRealName[providerRealName.length - 1].trim() + ' ' + providerRealName.slice(0, (providerRealName.length - 1)).toString().trim();
                    emrProviderNames.push(providerRealName);
                }

                return emrProviderNames;
            }

            // Get patient problem lsit
            function getProblems() {
                var emrProbsList = EvaluateMel('{PROB_AFTER("delimited")}').split('|');
                var emrProbs = [];
                //var melText = "{USEROK('" + emrProbsList + "')}";
                //EvaluateMel(melText);

                var probDesc = '';
                var probCode = '';
                var probDescLoc = 1;
                var probCodeLoc = 7;
                var probAdd = ''
                for (var i = 0; i < emrProbsList.length; i++) {
                    probDesc = emrProbsList[i].split('^')[probDescLoc];
                    probCode = emrProbsList[i].split('^')[probCodeLoc];
                    probAdd = probDesc + " (" + probCode + ")"
                    emrProbs.push({problem: probAdd});
                }

                return emrProbs;
            }

            vm.problemOptions = getProblems();

            function stateChange() {
                var url = (vm.referral.options != null) ? vm.referral.options.department : '';

                // Navigate to new state
                if ($state.get(url)) {
                    $state.go(url);
                }
                else {
                    $state.go('referrals.default', {referralType: url.split(' ').join('-')});
                }
            }

            /**
             * @desc Handles submission of the referral form
             */
            function submitReferral(form){
                if (form.$valid)
                {
                    //vm.progressBar = true;
                    //emailService.send(vm.referral, onSuccess, onComplete);
                    onSuccess();
                }

                function onSuccess() {
                    // Set urgent indicator
                    var urgentInd = "N";
                    if (vm.referral.urgent) {urgentInd = "U";}

                    // Set up validation check for flag sending
                    var flagSuccessInd = "FAIL";
                    // Create check variable in MEL
                    // Replace " and ' characters with empty space
                    var escMsg = vm.referral.message;
                    escMsg = escMsg.replace(/["']/g, "");
                    escMsg = escMsg + " Associated Problem: " + vm.referral.problems.problem
                    EvaluateMel('{IF (FLAG_SENT <> "") THEN FLAG_SENT = "FAIL" ELSE global FLAG_SENT = "FAIL" ENDIF}');
                    try{
                      if(vm.referral.options.department === "In Home Visit"){
                        var flagMEL = '{MEL_SEND_FLAG("Flag", "referralgeneric", "' + urgentInd + '", str(._todaysdate),"' + vm.referral.options.department + ' Referral", "' + escMsg +'", "Orders")}';
                        flagMEL = flagMEL + '{MEL_SEND_FLAG("Flag", "pdammon", "' + urgentInd + '", str(._todaysdate),"' + vm.referral.options.department + ' Referral", "' + escMsg +'", "Orders")}';
                        flagMEL = flagMEL + '{MEL_SEND_FLAG("Flag", "referralgeneric", "N", str(ADDDATES(str(._TODAYSDATE),"0","0","14")),"    Follow Up - ' + vm.referral.options.department + ' Referral ", "Follow Up - ' + escMsg + '", "Orders")}';
                        flagMEL = flagMEL + '{MEL_SEND_FLAG("Flag", "pdammon", "N", str(ADDDATES(str(._TODAYSDATE),"0","0","14")),"    Follow Up - ' + vm.referral.options.department + ' Referral ", "Follow Up - ' + escMsg + '", "Orders")}';
                      }else{
                        var flagMEL = '{MEL_SEND_FLAG("Flag", "referralgeneric", "' + urgentInd + '", str(._todaysdate),"' + vm.referral.options.department + ' Referral", "' + escMsg +'", "Orders")}';
                        flagMEL = flagMEL + '{MEL_SEND_FLAG("Flag", "referralgeneric", "N", str(ADDDATES(str(._TODAYSDATE),"0","0","60")),"    Follow Up - ' + vm.referral.options.department + ' Referral ", "Follow Up - ' + escMsg + '", "Orders")}';
                      }
                    }catch(e){
                      window.alert(e);
                    }

                    flagMEL = flagMEL + '{FLAG_SENT = "SUCCESS"}';
                    EvaluateMel(flagMEL);
                    flagSuccessInd = EvaluateMel("{FLAG_SENT}");
                    //EvaluateMel('{MEL_SEND_FLAG("Flag", "referralgeneric", "' + urgentInd + '", str(._todaysdate),"' + vm.referral.options.department + ' Referral", "' + vm.referral.message +'", "Orders")}');
                    //EvaluateMel('{MEL_SEND_FLAG("Flag", "referralgeneric", "N", str(ADDDATES(str(._TODAYSDATE),"0","0","60")),"    Follow Up - ' + vm.referral.options.department + ' Referral ", "Follow Up - ' + vm.referral.message + '", "Orders")}');
                    if (flagSuccessInd == "SUCCESS"){
                        var mel = "{DOCUMENT.REFERRALSNOTE = DOCUMENT.REFERRALSNOTE + \"" + vm.referral.options.chartNoteText + "\" + HRET}";
                        EvaluateMel(mel);
                        toastr.remove()
                        toastr.success("Referral request for " + vm.referral.patient.name + " sent successfully!");
                    }
                    else {
                        toastr.remove()
                        toastr.error("Referral request flag FAILED to send. Please try again and contact Information Systems if problem persists.");
                    }
                    onComplete();
                    //reset(form);
                }

                function onComplete() {
                    vm.progressBar = false;
                }
            }
        }
})();
