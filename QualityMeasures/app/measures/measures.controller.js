/**
 * Quality Measure's Controller
 * @namespace Modules
 */
(function() {
    'use strict';

    angular
        .module("app")
        .controller("measuresController", ['$state', 'emailService', 'patientService', measuresController]);

        /**
         * @name measuresController
         * @desc measures controller
         * @param emailService Service that sends an e-mail upon successful measure submission
         * @memberOf Modules
         * @constructor
         */
        function measuresController($state, emailService, patientService) {
            var vm = this;

            vm.patient = patientService.patient;
            vm.progressBar = false;
            vm.providers = [];
            vm.measures = {};
            vm.measuresOptions = [];
            vm.stateChange = stateChange;
            vm.submitMeasures = submitMeasures;

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
                vm.measures = {
                    options        : {},
                    patient     : vm.patient,
                    preferredProvider   : "",
                    referringProvider   : Mel.eval('{DOCUMENT.PROVIDER}'),
                    message       : ""
                };

                vm.master = angular.copy(vm.measures);

                var userFullName = Mel.eval("{USER.REALNAME}");
                var EMAIL_TO = "ECNurseAcct@valleymedicalcenter.com";
                var EMAIL_FROM = Mel.eval("{USER.LOGINNAME}") + "@valleymedicalcenter.com";
                var immunList = Mel.eval("{DOCUMENT.UpcomingImmunizations}");

                //TODO: Store and query from DB via an AngularJS Service
                vm.measuresOptions = [{department: "Cardiology VMC Providence", chartNoteText: "A referral has been sent to Providence Cardiology Reception.", email: {to: EMAIL_TO, from: EMAIL_FROM, subject: "Cardiology - VMC Providence Referral Request from " + userFullName }, showProviderList: false}];

                /*var providerSearchName = '';
                var providerRealName = '';
                var PROVIDER_NAME = 1;
                for (var i = 0; i < immunList.length; i++) {
                    immunization = immunList[i];
                    vm.measuresOptions.push(immunization);
                }
                vm.measuresOptions = [
                    {department: "Cardiology VMC Providence", chartNoteText: "A referral has been sent to Providence Cardiology Reception.", email: {to: EMAIL_TO, from: EMAIL_FROM, subject: "Cardiology - VMC Providence Referral Request from " + userFullName }, showProviderList: false},
                    {department: "Chronic Care Management", chartNoteText: "The patient has ACCEPTED/DENIED opting into the Chronic Care Management program.", email: {to: EMAIL_TO, from: EMAIL_FROM, subject: "Chronic Care Management Referral Request from " + userFullName }, showProviderList: false},
                    {department: "Dermatology", chartNoteText: "A referral has been sent to Dermatology Reception.", email: {to: EMAIL_TO, from: EMAIL_FROM, subject: "Dermatology Referral Request from " + userFullName }, showProviderList: false},
                    {department: "Diabetes (Education Nutrition)", chartNoteText: "A referral has been sent to IM Reception.", email: {to: EMAIL_TO, from: EMAIL_FROM, subject: "Diabetes (Education/Nutrition) Referral Request from " + userFullName }, showProviderList: false},
                    {department: "Diabetes (Physician Consult)", chartNoteText: "A referral has been sent to IM Reception.", email: {to: EMAIL_TO, from: EMAIL_FROM, subject: "Diabetes (Physician Consult) Referral Request from " + userFullName }, showProviderList: false},
                    //{department: "Eye Care Specialists", chartNoteText: "A referral has been to Eye Care Specialists", email: {to: "5097511188@nike.valleymedicalcenter.com", from: EMAIL_FROM, subject: "Eye Care Specialists Referral from Valley Medical Center" }, showProviderList: false},
                    {department: "Internal Medicine", chartNoteText: "A referral has been sent to IM Reception.", email: {to: EMAIL_TO, from: EMAIL_FROM, subject: "Internal Medicine Referral Request from " + userFullName }, showProviderList: true},
                    {department: "Mental Health (Adult)", chartNoteText: "A referral has been sent to Mental Health Reception (Adult).", email: {to: EMAIL_TO, from: EMAIL_FROM, subject: "Mental Health (Adult) Referral Request from " + userFullName }, showProviderList: false},
                    {department: "Mental Health (Peds)", chartNoteText: "A referral has been sent to Mental Health Reception (Peds).", email: {to: EMAIL_TO, from: EMAIL_FROM, subject: "Mental Health (Peds) Referral Request from " + userFullName }, showProviderList: false},
                    {department: "Neurology", chartNoteText: "A referral has been sent to Neurology.", email: {to: EMAIL_TO, from: EMAIL_FROM, subject: "Neurology Referral Request from " + userFullName }, showProviderList: false},
                    {department: "OBGYN (Gynecology)", chartNoteText: "A referral has been sent to OB/GYN (Gynecology) Reception.", email: {to: EMAIL_TO, from: EMAIL_FROM, subject: "OB/GYN (Gynecology) Referral Request from " + userFullName }, showProviderList: true},
                    {department: "OBGYN (Obstetrics)", chartNoteText: "A referral has been sent to OB/GYN (Obstetrics) Reception.", email: {to: EMAIL_TO, from: EMAIL_FROM, subject: "OB/GYN (Obstetrics) Referral Request from " + userFullName }, showProviderList: true},
                    {department: "Occupational Medicine", chartNoteText: "A referral has been sent to Occupational Medicine Reception.", email: {to: EMAIL_TO, from: EMAIL_FROM, subject: "Occupational Medicine Referral Request from " + userFullName }, showProviderList: false},
                    {department: "Pain Management", chartNoteText: "A referral has been sent to Pain Management Reception.", email: {to: EMAIL_TO, from: EMAIL_FROM, subject: "Pain Management Referral Request from " + userFullName }, showProviderList: false},
                    //{department: "Peak Physical Therapy", chartNoteText: "A referral has been sent to Peak Physical Therapy.", email: {to: "2087460688@nike.valleymedicalcenter.com", from: EMAIL_FROM, subject: "Peak Physical Therapy Referral from Valley Medical Center" }, showProviderList: false},
                    {department: "Podiatry", chartNoteText: "A referral has been sent to Podiatry Reception", email: {to: EMAIL_TO, from: EMAIL_FROM, subject: "Podiatry Referral Request from " + userFullName }, showProviderList: false},
                    {department: "Primary Care Provider Request (Adult)", chartNoteText: "A request has been sent for a Primary Care Provider.", email: {to: EMAIL_TO, from: EMAIL_FROM, subject: "Primary Care Provider Request Referral Request from " + userFullName }, showProviderList: true},
                    {department: "Primary Care Provider Request (Peds)", chartNoteText: "A request has been sent for a Primary Care Provider.", email: {to: EMAIL_TO, from: EMAIL_FROM, subject: "Primary Care Provider Request Referral Request from " + userFullName }, showProviderList: true},
                    {department: "Rheumatology", chartNoteText: "A referral has been sent to Rheumatology Reception.", email: {to: EMAIL_TO, from: EMAIL_FROM, subject: "Rheumatology Referral Request from " + userFullName }, showProviderList: false},
                    {department: "Surgery", chartNoteText: "A referral has been sent to Surgery Reception.", email: {to: EMAIL_TO, from: EMAIL_FROM, subject: "Surgery Referral Request from " + userFullName }, showProviderList: true},
                    {department: "Urology", chartNoteText: "A referral has been sent to Urology Reception.", email: {to: EMAIL_TO, from: EMAIL_FROM, subject: "Urology Referral Request from " + userFullName }, showProviderList: false},
                    {department: "Weight and Wellness", chartNoteText: "A referral has been sent to Weight & Wellness Reception.", email: {to: EMAIL_TO, from: EMAIL_FROM, subject: "Weight & Wellness Referral Request from " + userFullName }, showProviderList: false}
                ];*/
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
                vm.measures = angular.copy(vm.master);
            }

            function getProviders() {
                var emrProviders = Mel.eval('{GET_USER_LIST("VMC", "EMR-Physician", "delimited")}').split('|');
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

            function stateChange() {
                var url = (vm.measures.options != null) ? vm.measures.options.department : '';

                // Navigate to new state
                if ($state.get(url)) {
                    $state.go(url);
                }
                else {
                    $state.go('measures.default', {measureType: url.split(' ').join('-')});
                }
            }

            /**
             * @desc Handles submission of the referral form
             */
            function submitMeasures(form){
                if (form.$valid)
                {
                    vm.progressBar = true;
                    emailService.send(vm.measures, onSuccess, onComplete);
                }

                function onSuccess() {
                    var mel = "{DOCUMENT.REFERRALSNOTE = DOCUMENT.REFERRALSNOTE + \"" + vm.measures.options.chartNoteText + "\" + HRET}";
                    Mel.eval(mel);
                    toastr.success("Referral for " + vm.measures.patient.name + " sent successfully!");
                    reset(form);
                }

                function onComplete() {
                    vm.progressBar = false;
                }
            }
        }
})();