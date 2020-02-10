/*=========================================================================
* @author Derry Everson
*
* Work:
** https://www.catalystmedicalgroup.com
** deverson@valleymedicalcenter.com
*
* Date: 11/05/2019
*========================================================================*/
/*=========================Abbreviation list==============================*
aD = admissionDate -------------------------- PULL/SAVE
aS = assessment ----------------------------- PULL/SAVE
aST = assessmentTypes ------------- Static
txt = description ----------------- Static
dI = discontinued  ---------------- Static
dob = dateOfBirth ----------- EMR
dD = dischargeDate -------------------------- PULL/SAVE
emD = emergencyDate ------------------------- PULL/SAVE
enD = engagementDate ------------------------ PULL/SAVE
fA = snfFacility ---------------------------- PULL/SAVE
fT = facilityType --------------------------- PULL/SAVE
fTs = facilityTypes --------------- Static
nI = notImplemented --------------- Static
pAD = primaryAdmitDiagnosis ----------------- PULL/SAVE
pE = PatientEstablished ----- EMR
pcp = primaryCareProvider --- EMR
pD = primaryDiagnosis  ---------------------- PULL/SAVE
pG = providerGroup ---------------- Static
pI - patientIdentified  --------------------- PULL/SAVE
pIT = patientIdentifiedTypes ------ Static
pN = patientName ------------ EMR
pT = providerType --------------------------- PULL/SAVE
pTT = providerTypes --------------- Static
rP = response ------------------------------- PULL/SAVE
rPs = responses ------------------- Static
sP = serviceProvided ------------------------ PULL/SAVE
sPT = serviceProvidedTypes -------- Static
tT = tooltip ---------------------- Static
tS = timeSpent ------------------------------ PULL/SAVE
uN = userName --------------- EMR
vD = visitDate ------------------------------ PULL/SAVE
vi = visits --------------------------------- PULL/SAVE
viO = visitOptions ---------------- Static
vR = visitReset ----------------------------- PULL/SAVE
vT = visitType ------------------------------ PULL/SAVE
sA = snfAdmissionDate ----------------------- PULL/SAVE
sD = snfDischargeDate ----------------------- PULL/SAVE
sB = selectedButton --- HTML
sL = stayLocation --------------------------- PULL/SAVE
hN = hospitalName --------------------------- PULL/SAVE
hV = homeVisitType -------------------------- PULL/SAVE
hVs = homeVisitTypes ------------- Static
iB = inlineButton ----- HTML
lV = Locationvisit -------------------------- PULL/SAVE
lVT = locationvisitTypes ---------- Static
lN = loginName ------------- EMR
*========================================================================*/

(function(){
  var formApp = angular.module('IHCMEgApp', []);
  formApp.controller('IHCMEController', function ($scope, $parse, $window, $interval, $http) {

    /*=========================================================================
    * GLOBALS
    *========================================================================*/
    var currentUser, patient, isMel;
    var timer = null;

    /*=========================================================================
    * Used for diffrent browser adjustments
    *========================================================================*/
    var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    var isFirefox = typeof InstallTrigger !== 'undefined';
    var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));
    var isIE = /*@cc_on!@*/false || !!document.documentMode;
    var isEdge = !isIE && !!window.StyleMedia;
    var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);

    /*=========================================================================
    * Primary JSON Object that the form looks at
    *========================================================================*/
    $scope.Form = {
      aD: {txt: ""}, dD: {txt: ""}, dob: {txt: ""}, emD: {txt: ""}, enD: {txt: ""},
      fT: {txt: "",lock:1}, iB: 1, vR: "", pE: 0, pN: {txt: ""}, pG: {txt: ""}, hV: {txt: "",lock:1},
      pT: {txt: ""}, pcp: {txt: ""}, pAD: {txt: ""}, pD: {txt: ""}, rP: {txt: "",lock:1},
      sA: {txt: ""}, sD: {txt: ""}, uN: {txt: "",lN:""}, vT: {txt: ""}, vD: {txt: ""}, vi: [],
      viO: {
        pTT: [{txt:"RN"},{txt:"BSN"},{txt:"CMA"},{txt:"Care Coordinator"},{txt:"Case Manager"},{txt:"Community Health Worker"},{txt:"Social Worker"},{txt:"Home Health Aide"}],
        sPT: [{txt:"Medication Management"},{txt:"Skin & Wound Care"},{txt:"Medication Administration"},{txt:"Nutrition Care"},{txt:"Maintenance of an Appliance",tT:"ex: Catheter or Ostomy Pouch"},{txt:"Respiration Therapy"},{txt:"Physical or Occupational Therapy"},{txt:"Review of Post-Discharge Self-Care Instructions"},{txt:"Caregiver Education or Training"},{txt:"Palliative Consultation"}],
        aST: [{txt:"Functional"},{txt:"Environmental"},{txt:"Social Services"},{txt:"Community Engagement"},{txt:"Caregiver & Family Support"},{txt:"Financial Status"},{txt:"Transportation"},{txt:"Cognitive Function"},{txt:"Behavioral Health"},{txt:"Nutrition"}],
        pIT: [{txt:"Barriers to Transportation / Mobility"},{txt:"Home Modification Required",tT:"ex: DME Installation"},{txt:"Social Services Support Needs",tT:"ex: Food Insecurity or Medicaid - Eligible"},{txt:"Insufficient Caregiver Support"},{txt:"Limited Community Engagement"},{txt:"Therapy Need, Occupational"},{txt:"Therapy Need, Physical"},{txt:"Therapy Need, Speech"},{txt:"Home Health Need",tT:"ex: Patient Should be Assess for Homebound Status"},{txt:"Behavioral Health",tT:"ex: Depression"},{txt:"Medication"},{txt:"Memory and Cognition"}],
        lVT: [{txt:"Home"},{txt:"Domiciliary"},{txt:"Rest Home"},{txt:"Assisted Living Facility"},{txt:"Nursing Facility"}]
      },
      fTs: [{txt: "Acute Care Hospital"},{txt: "Critical Access Hospital"},{txt: "Skilled Nursing Facility"},{txt: "Inpatient Rehabilitation Facility"},{txt: "Inpatient Psychiatric Facility"}],
      rPs: [{txt: "Accepted"},{txt: "Denied"}], hVs: [{txt: "Care Management"},{txt: "Post-Discharge"}],
      dI: [{txt: "No Need for another waiver-related home visit"},{txt: "Patient or caregiver declined another visit"},{txt: "Patient qualified for Medicare home health care or benefit"},{txt: "Patient admitted to facility"},{txt: "Appropriate staff unavailable for next visit"},{txt: "Visit unable to be scheduled during 90-day period post-discharge period"}],
      nI: [{txt: "Patient or caregiver declined visit"},{txt: "Patient qualified for Medicare home health care or benefit"},{txt: "Patient admitted to facility"},{txt: "Appropriate staff unavailable for next visit"},],
      fA: {txt: "",tT: "No Abbreviations"},sL: {txt: "",tT: "No Abbreviations"}, hN: {txt: "",tT: "No Abbreviations"}, iE: {txt:""}
    };

    /*=========================================================================
    * Dynamic-ish Chart Notes
    *========================================================================*/
    $scope.updateChartNotes = function(){
      var primary = [["pN","Patient Name"],["iE","Patient is"],["pcp","PCP"],["dob","DOB"],["pG","Provider Group"],["rP","Response"],["enD","Engagement Date"],["pT","Provider Type"],["hV","Home Visit Type"]];
      var inpatient = [["sL","Stay Location"],["fT","Type of Facility"],["pAD","Primary Admit Dx"],["aD","Admission Date"],["dD","Discharge Date"]];
      var emergency = [["hN","Hospital Name"],["pD","Primary Dx"],["emD","Emergency Date"]];
      var snf = [["fA","Facility"],["sA","Admission Date"],["sD","Discharge Date"]];
      var provider = [["vT","Visit Type"],["vD","Visit Date"]];
      var f = $scope.Form;
      var ls = []
      var chartNotes = "<br><strong style=\"font-size:18px;\">In Home Encounter</strong><br>";
      for(var i=0; i<primary.length; i++) f[primary[i][0]].txt?ls.push(" - <strong>"+primary[i][1]+":</strong> "+f[primary[i][0]].txt+"<br>"):"";
      if(f.iB==0){
        ls.push("<br><strong>Provider</strong><br>")
        for(var i=0; i<provider.length; i++) f[provider[i][0]].txt?ls.push(" - <strong>"+provider[i][1]+":</strong> "+f[provider[i][0]].txt+"<br>"):"";
      }else if(f.iB==1){
        ls.push("<br><strong>Inpatient</strong><br>")
        for(var i=0; i<inpatient.length; i++) f[inpatient[i][0]].txt?ls.push(" - <strong>"+inpatient[i][1]+":</strong> "+f[inpatient[i][0]].txt+"<br>"):"";
      }else if(f.iB==2){
        ls.push("<br><strong>Emergency Rooms</strong><br>")
        for(var i=0; i<emergency.length; i++) f[emergency[i][0]].txt?ls.push(" - <strong>"+emergency[i][1]+":</strong> "+f[emergency[i][0]].txt+"<br>"):"";
      }else if(f.iB==3){
        ls.push("<br><strong>Skilled Nursing Facility</strong><br>")
        for(var i=0; i<snf.length; i++) f[snf[i][0]].txt?ls.push(" - <strong>"+snf[i][1]+":</strong> "+f[snf[i][0]].txt+"<br>"):"";
      }
      ls.push("<br><strong>Home Visit(s)</strong><br>")
      for(var i=0; i<f.vi.length; i++){
        if(f.vi[i].aS&&f.vi[i].lV&&f.vi[i].pI&&f.vi[i].pT&&f.vi[i].sP&&f.vi[i].tS&&f.vi[i].uN&&f.vi[i].vD){
          ls.push(" - <strong>Visit on ("+f.vi[i].vD+"</strong>),   ");
          ls.push("<strong>In-Home Visit Provider:</strong> "+f.vi[i].uN+",   ");
          ls.push("<strong>Provider Type:</strong> "+f.vi[i].pT+",   ");
          ls.push("<strong>Location of Visit:</strong> "+f.vi[i].lV+",   ");
          ls.push("<strong>Care/Service Provided:</strong> "+f.vi[i].sP+",   ");
          ls.push("<strong>Assessment Type Completed:</strong> "+f.vi[i].aS+",   ");
          ls.push("<strong>Patient Needs Identified:</strong> "+f.vi[i].pI+",   ");
          ls.push("<strong>Time Spent:</strong> "+f.vi[i].tS+" minutes<br>");
        }
      }
      var strDI = strNI = "";
      for(var i=0; i<f.dI.length; i++) if(f.dI[i].status) strDI += " - "+f.dI[i].txt+"<br>";
      for(var i=0; i<f.nI.length; i++) if(f.nI[i].status) strNI += " - "+f.nI[i].txt+"<br>";
      if(f.dI.status) strDI += " - "+f.dI.txt+"<br>";
      if(f.nI.status) strNI += " - "+f.nI.txt+"<br>";
      if(strDI) ls.push("<br><strong>In-Home Visits Discontinued</strong><br>"+strDI);
      if(strNI) ls.push("<br><strong>In-Home Visits Not Implemented</strong><br>"+strNI);
      for(var i=0; i<ls.length; i++) chartNotes += ls[i];
      if(isMel) SetTextTranslation(chartNotes, "html");
      //else console.log(chartNotes);
    };

    /*=========================================================================
    * Adds a new editable visit object to visits
    *========================================================================*/
    $scope.addVisit = function(){
      var len = $scope.Form.vi.length;
      var maxLen = 9;
      if(len < maxLen){
        $scope.Form.vi.push({vD:getCurrentDate(),uN:getUserName()});
        insertVisitOptionsLast();
        // Fixes async issue running before the table updates.
        setTimeout(function(){ getDateTimes(); getTooltips(); }, 1000);
      }else window.alert("Maximum Visits Reached ("+maxLen+")");
    };

    /*=========================================================================
    * Basic switch for input clicking
    *========================================================================*/
    $scope.checkboxSwitch = function(item){
      item.status = item.status?false:true;
    };

    /*=========================================================================
    * Basic switch for input clicking in IE / fixes issues of double clicking
    * This seems redunant !lock&&isIE not working this does?
    *========================================================================*/
    $scope.checkboxSwitchInline = function(item){
      if(isIE) item.status = item.status?false:true;
    };

    /*=========================================================================
    * Updates the Text depending on what is selected in the
    dropdown / checkboxes
    *========================================================================*/
    $scope.checkboxTextUpdate = function(text,list){
      var result = [];
      var options = list.viO[text+"T"];
      if(options.status) result.push(options.txt)
      for(var i=0; i<options.length; i++){
        if(options[i].status) result.push(options[i].txt);
      }
      list[text] = result;
    };

    /*=========================================================================
    * Initiates the Day the reset will apply
    *========================================================================*/
    $scope.initReset = function(){
      $scope.Form.vR = getCurrentDate(1,0,0);
      $scope.saveVisit(1);
    };

    /*=========================================================================
    * Removes idexed visit - for admins only
    *========================================================================*/
    $scope.removeIndexVisit = function(loc){
      $scope.Form.vi.splice(loc,1);
    };

    /*=========================================================================
    * Saves the currnt form state and pushes to the DB (ObsTerms Form/Data)
    *========================================================================*/
    $scope.saveVisit = function(isEnd){
      try{
        var sanitizedCopy = sanitizeFormData();
        setLocks(sanitizedCopy);
        var visitData = JSON.stringify(parseVisitData(sanitizedCopy));
        var formData = JSON.stringify(parseFormData(sanitizedCopy));
        if(isMel){
          try{ if(visitData.length <= 2000) SetObsValue("CM VISIT OUT",formData); }
          catch(e){ window.alert("Function [saveVisit (VisitData)]: "+e); }
          try{ if(formData.length <= 2000) SetObsValue("CM HOME",visitData); }
          catch(e){ window.alert("Function [saveVisit (FormData)]: "+e); }
        }
        if(!isEnd) INIT();
        $scope.updateChartNotes();
      }catch(e){ window.alert("Function [saveVisit]: "+e); }
    };

    /*=========================================================================
    * Sets current patient established status
    *========================================================================*/
    $scope.setEstablished = function(option){
      if(isMel && option == 0){
        SetObsValue("NEWPATIENT","New");
        $scope.Form.iE.txt = "New";
      }
      else if(isMel && option == 1){
        SetObsValue("NEWPATIENT","Established");
        $scope.Form.iE.txt = "Established";
      }
    };

    /*=========================================================================
    * Initiates a timer to save the current form state
    *========================================================================*/
    $scope.startTimer = function(){
      if(timer){ clearTimeout(timer); timer = null; }
       timer = setTimeout($scope.saveVisit, 5000, 1);
    };


    /*=========================================================================
    * Syncs JQuery Calendar Data with AngularJS Scopes and vise versa
    * Note 1: Yes this is a thing they do not play well together
    * Note 2: this can be phased out once switched to chromium
    *========================================================================*/
    function dateSync(){
      var today = getCurrentDate();
      var date2 = new Date(today);
      var dateObj = angular.element(document).find('.date');
        for(var i=0; i<dateObj.length;i++){
          var element = $(dateObj[i]);
          var date1 = new Date(element.data().date);
          if(date1 > date2) element.find('Input')[0].value = today;
          else element.find('Input')[0].value = element.data().date;
          element.find('Input').trigger('change');
        }
    };

    /*=========================================================================
    * Returns list of Admins
    *========================================================================*/
    function getAdmins(){
      var results = ["deverson","pdammon","speterson","dbuntin"]
      return results;
    };

    /*=========================================================================
    * Returns a human readable current date (MM/DD/YYYY)
    * aD, aM, aY are modifiers if needed
    *========================================================================*/
    function getCurrentDate(aD,aM,aY){
      if(!aD) aD=0;
      if(!aM) aM=0;
      if(!aY) aY=0;
      var today = new Date();
      var dd = today.getDate()+aD;
      var mm = today.getMonth()+1+aM;
      var yyyy = today.getFullYear()+aY;
      if (dd<10)dd='0'+dd;
      if (mm<10)mm='0'+mm;
      today = mm+'/'+dd+'/'+yyyy;
      return today;
    };

    /*=========================================================================
    * Gets all Calendars on document and links the JQuery required to work
    * Note 1: This can be phased out once switched to chromium
    *========================================================================*/
    function getDateTimes(){
      $(".date").datetimepicker({format:"L"});
      $('.date').on('dp.change', function(e){dateSync();});
    };

    /*=========================================================================
    * Gets previous form data from DB (ObsTerm)
    *========================================================================*/
    function getFormData(){
      if(isMel){
        var obs = ObsAny("CM VISIT OUT");
        if(obs) return JSON.parse(obs)
      }
      return 0;
    };

    /*=========================================================================
    * Gets all tooltips on document and links the JQuery required to work
    *========================================================================*/
    function getTooltips(){
      $('[data-toggle="tT"]').tooltip();
    };

    /*=========================================================================
    * Returns Username
    *========================================================================*/
    function getUserName(){
      return $scope.Form.uN.txt;
    }

    /*=========================================================================
    * Gets previous visit data from DB (ObsTerm)
    *========================================================================*/
    function getVisitData(){
      if(isMel){
        var obs = ObsAny("CM HOME");
        if(obs) return JSON.parse(obs)
      }
      return 0;
    };

    /*=========================================================================
    * Inserts all visit options into each visit
    * Note: used for easier traversing in angular ng-repeat
    *========================================================================*/
    function insertVisitOptionsAll(){
      try{
        var arr = $scope.Form;
        for(var i=0; i< arr.vi.length; i++){
          arr.vi[i].viO = angular.copy(arr.viO);
        }
      }catch(e){ window.alert("Function [insertVisitOptionsAll]: "+e); }
    };

    /*=========================================================================
    * Inserts all visit options into last visit
    * Note: used for easier traversing in angular ng-repeat (for Add Visit button)
    *========================================================================*/
    function insertVisitOptionsLast(){
      var arr = $scope.Form
      var deepCopy = angular.copy(arr.viO);
      arr.vi[arr.vi.length-1].viO = deepCopy;
    };

    /*=========================================================================
    * Returns true if user is valid Admin else returns false
    *========================================================================*/
    function isAdmin(lN){
      var admins = getAdmins();
      for(var i=0; i<admins.length; i++){
        if(lN.toLowerCase() == admins[i].toLowerCase()) return 1;
      }
      return 0;
    };

    /*=========================================================================
    * Iterates through each visit's options marking all previously selected
    * NOTE: DO NOT FUCK WITH THIS LOGIC, Thank you :)
    *========================================================================*/
    function isChecked(){
      try{
        var col = [["aS","aST"],["pI","pIT"],["sP","sPT"]]
        for(var i=0; i< $scope.Form.vi.length; i++){
          for(var x=0; x< col.length; x++){
            //console.log($scope.Form.vi[i][col[x][0]])
            if($scope.Form.vi[i][col[x][0]]){
              for(var y=0; y< $scope.Form.vi[i][col[x][0]].length; y++){
                //console.log($scope.Form.vi[i].viO[col[x][1]])
                if($scope.Form.vi[i].viO[col[x][1]]){
                  var found = 0;
                  for(var z=0; z< $scope.Form.vi[i].viO[col[x][1]].length; z++){
                    var vi = $scope.Form.vi[i][col[x][0]][y]
                    var vo = $scope.Form.vi[i].viO[col[x][1]][z]
                    if (vi === vo.txt){
                      //console.log("Visit ["+i+"] col: "+col[x][0]+" txt: "+vo.txt)
                      vo.status = true;
                      found++;
                      continue;
                    }
                    //Last of the Last of iterations between columns
                    if (z == $scope.Form.vi[i].viO[col[x][1]].length-1 && y == $scope.Form.vi[i][col[x][0]].length-1 && !found){ //vi !== vo.txt){
                      //console.log("Visit ["+i+"] col: "+col[x][0]+" txt: "+$scope.Form.vi[i][col[x][0]][0])
                      $scope.Form.vi[i].viO[col[x][1]].txt = $scope.Form.vi[i][col[x][0]][0];
                      $scope.Form.vi[i].viO[col[x][1]].status = true;
                    }
                  }
                }
              }
            }
          }
        }
      }catch(e){ window.alert("Function [isChecked]: "+e) }
    };

    /*=========================================================================
    * Returns true if the object property is empty else false
    *========================================================================*/
    function isEmpty(obj){
      for(var key in obj){ if(obj.hasOwnProperty(key)) return false; }
      return true;
    };

    /*=========================================================================
    * Returns current patient's established status and sets the form text
    *========================================================================*/
    function isEstablished(){
      var obs = ObsAny('NEWPATIENT').toLowerCase();
      if(obs == "established"){
        $scope.Form.iE.txt = "Established";
        return 1;
      }
      $scope.Form.iE.txt = "New";
      return 0;
    };

    /*=========================================================================
    * Checks for the reset varible from In-home visits discontinued / not
    implemented and resets if appropriate
    *========================================================================*/
    function isVisitReset(){
      var date1 = new Date(getCurrentDate());
      if($scope.Form.vR){
        var date2 = new Date($scope.Form.vR);
        if(date1 >= date2){
          $scope.Form.vR = "";
          $scope.Form.vi = [];
        }
      }
    };

    /*=========================================================================
    * Removes Visit data before being pushed to DB (ObsTerm for Form Data)
    *========================================================================*/
    function parseFormData(sanitizedCopy){
      delete sanitizedCopy.vi;
      return sanitizedCopy;
    };

    /*=========================================================================
    * Removes Form data before being pushed to DB (ObsTerm for Visit Data)
    *========================================================================*/
    function parseVisitData(sanitizedCopy){
      var visitData = sanitizedCopy.vi;
      return visitData;
    };

    /*=========================================================================
    * Sanitizes usless form data before being pushed to the DB (ObsTerm)
    *========================================================================*/
    function sanitizeFormData(){
      try{
        var deepCopy = angular.copy($scope.Form);
        var f = $scope.Form
        var arr = ["aST","dob","fTs","pE","pcp","pG","pIT","pN","pT","pTT","rPs","hVs","sPT","uN","viO","sB","iB","lVT","lN","dI","nI"];
        var arr2 = ["aST","dob","fTs","pE","pcp","pG","pIT","pN","pTT","rPs","hVs","sPT","viO","sB","iB","lVT","lN","dI","nI"];
        for(var i=0; i<arr.length;i++){
          var item = deepCopy[arr[i]];
          if(deepCopy[arr[i]] != "undefined" && deepCopy[arr[i]] != null) delete deepCopy[arr[i]];
        }
        if(deepCopy.vi){
          for(var j=0; j<deepCopy.vi.length;j++){
            for(var z=0; z<arr2.length; z++){
              if(deepCopy.vi[j][arr2[z]] != "undefined" && deepCopy.vi[j][arr2[z]] != null) delete deepCopy.vi[j][arr2[z]];
            }
            if(!deepCopy.vi[j].aS||!deepCopy.vi[j].lV||!deepCopy.vi[j].pI||!deepCopy.vi[j].pT||!deepCopy.vi[j].sP||!deepCopy.vi[j].tS||!deepCopy.vi[j].uN||!deepCopy.vi[j].vD){
              deepCopy.vi.splice(j,1);
            }
          }
        }
        return deepCopy;
      }catch(e){ window.alert("Function [sanitizeFormData]: "+e); }
    };

    /*=========================================================================
    * Sets all Form data if data keys are found
    *========================================================================*/
    function setFormData(data){
      for(key in data){
        if(data.hasOwnProperty(key)) $scope.Form[key] = data[key];
      }
    };

    /*=========================================================================
    * Sets locks on Visit data before being pushed to DB (ObsTerm)
    * BUG: Add checking for valid data before locking (Non mel issue)
    *========================================================================*/
    function setLocks(arr){
      try{
        if(isMel) var result = arr.vi;
        else var result = $scope.Form.vi;
        if(!isEmpty(result)){
          for(var i=0;i<result.length;i++){
            var empty = isEmpty(result[i]);
            if(!empty) result[i].lock = 1
          }
        }
      }catch(e){ window.alert("Function [setLocks]: "+e); }
    };

    /*=========================================================================
    * Gets previous visit data from DB (ObsTerm)
    *========================================================================*/
    function setVisitData(data){
      $scope.Form.vi = data;
    };

    /*=========================================================================
    * Sets Mel Data to form or defaults to static data for basic mode
    *========================================================================*/
    function setMelData(){
      try{
        var f = $scope.Form;
        var formData  = getFormData();
        var visitData = getVisitData();
        if(formData)  setFormData(formData);
        if(visitData) setVisitData(visitData);
        f.pN.txt   = isMel?patient.fullName:"Bob Vila";
        f.pcp.txt  = isMel?patient.pcp:"Bob Ross";
        f.dob.txt  = isMel?patient.dateOfBirth:"08/02/1776";
        f.uN.txt   = isMel?currentUser.fullName:"George Costanza";
        f.uN.lN    = isMel?currentUser.loginName:"gcostanza";
        f.isAdmin  = isMel?isAdmin(currentUser.loginName):1;
        f.pE       = isMel?isEstablished():0;
        f.pG.txt   = "Catalyst Medical Group";
        f.pT.txt   = "Primary Care Provider";
      }catch(e){ window.alert("Function [setMelData]: "+e); }
    };

    /*=======================================================================*
    * Initiates the Form Logic
    *========================================================================*/
    function INIT(){
      try{
        currentUser = GetCurrentUser();
        patient = GetPatient();
        isMel = 1;
      }catch(e){
        isMel = 0;
        //console.log("Centricity Not Attached, Basic Mode Enabled")
      }
      try{
        setMelData();
        insertVisitOptionsAll();
        isVisitReset();
        isChecked();
        $scope.addVisit();
      }catch(e){ window.alert("Function [INIT (2)]: "+e); }
    };

    /*=======================================================================*
    * Waits for full document load to Initiate functions
    *========================================================================*/
    angular.element(document).ready(function () {
      document.querySelector('#btnDefault1').click();
      if(isMel && isEstablished()) document.querySelector('#btnPatient2').click();
      else document.querySelector('#btnPatient1').click();
      getDateTimes();
      getTooltips();
    });

    INIT();

  });
}());
