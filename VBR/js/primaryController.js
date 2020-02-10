/*=========================================================================
* @author Derry Everson
*
* Work:
** https://www.catalystmedicalgroup.com
** deverson@valleymedicalcenter.com
*
* Date: 05/16/2019
*========================================================================*/

/*=========================================================================
* Known Issues
* 1.) VARIABLES FOR MEL BUILT-IN SYMBOLS USED IN FORM .... MEDS_AFTER("delimited")
*   1a.) This is an issue with HPI, will dissapear once  stable and considered is complete
* 2.) Smoking Status stays Red after updating Histories Social
*   2a.) This is not fully updated until "current" is fully added via button
* 3.) Qmaf does not update color properly
*  3a.) this is an issue with QMAF itself to updating the obsterm "QMAF_USE" to "Done"
*========================================================================*/

/*=========================================================================
* OBS TERMS USED
*
* "CARETRANSIN", "HANDOUTSPRTD", "CLINMSG PAT", "SMOK STATUS", "SMOK ADVICE",
* "HEIGHT", "WEIGHT", "BMI", "BP SYSTOLIC", "BP DIASTOLIC", "QMAF_USE", "NKPROB",
* "PROBLEMS REV","NKMED", "MEDS REVIEW", "NKA", "ALLERGY REV", "ADV DIR REV"
*========================================================================*/


(function(){
  var formApp = angular.module('vbrApp', []);
  formApp.controller('vbrController', function ($scope, $parse, $window, $interval) {

    /*=======================================================================*
    * Tooltip Text
    *========================================================================*/
    var ttDemographics = "Make demographic changes in the Registry";
    var ttTransition = "Is this patient being seen by this provider"+
                      " for the first time OR has the patient been"+
                      " seen by any other provider - such as hospitals,"+
                      " specialist, SNFs?";

    /*=======================================================================*
    * JSON Objects for VBR manipulation
    *========================================================================*/
    $scope.demographics = [
      {desc: "DOB",        tooltip: ttDemographics},
      {desc: "Gender",     tooltip: ttDemographics},
      {desc: "Race",       tooltip: ttDemographics},
      {desc: "Ethnicity",  tooltip: ttDemographics},
      {desc: "Language",   tooltip: ttDemographics}
    ];
    $scope.vitals = [
      {desc: "Height"},
      {desc: "Weight"},
      {desc: "BMI"},
      {desc: "BP"},
    ];
    $scope.reviewed = [
      {desc: "Problems",   arr: ["'{PROB_AFTER()}'","'{PROB_PRIOR()}'","NKPROB","PROBLEMS REV"]},
      {desc: "Medications",arr: ["'{MEDS_AFTER()}'","'{MEDS_PRIOR()}'","NKMED","MEDS REVIEW"]},
      {desc: "Allergies",  arr: ["'{ALL_AFTER()}'","'{ALL_PRIOR()}'","NKA","ALLERGY REV"]},
      {desc: "Directives", arr: ["'{DCT_AFTER()}'","'{DCT_PRIOR()}'","","ADV DIR REV"]},
      {desc: "QMAF",       arr: ["''","''","QMAF_USE",""]}
    ];
    $scope.others = [
      {desc: "Portal Access:"},
      {desc: "Transition of Care?", tooltip: ttTransition},
      {desc: "Smoking Status:"}
    ];
    var eduArray = [
      {desc: "BMI",             edu: "target BMI and nutrition"},
      {desc: "BP",              edu: "controlling blood pressure and target ranges"},
      {desc: "smoking status",  edu: "smoking cessation"}
    ];
    var problems = [
      {ICD10: "E43",    desc: "Unspecified severe protein-calorie malnutrition",   Weight: 0.731},
      {ICD10: "E440",   desc: "Moderate protein-calorie malnutrition",             Weight: 0.731},
      {ICD10: "E441",   desc: "Mild protein-calorie malnutrition",                 Weight: 0.731},
      {ICD10: "E46",    desc: "Unspecified protein-calorie malnutrition",          Weight: 0.731},
      {ICD10: "E6601",  desc: "Morbid (severe) obesity due to excess calories",    Weight: 0.374},
      {ICD10: "Z6841",  desc: "Body mass index (BMI) 40.0-44.9, adult",            Weight: 0.374},
      {ICD10: "Z6842",  desc: "Body mass index (BMI) 45.0-49.9, adult",            Weight: 0.374},
      {ICD10: "Z6843",  desc: "Body mass index (BMI) 50-59.9 , adult",             Weight: 0.374},
      {ICD10: "Z6844",  desc: "Body mass index (BMI) 60.0-69.9, adult",            Weight: 0.374},
      {ICD10: "Z6845",  desc: "Body mass index (BMI) 70 or greater, adult",        Weight: 0.374}
    ];
    var pregnancyCodes = ["o","z34","z35","z36","z3a"];
    var konamiArray = [];
    var patient = GetPatient();



    /*=======================================================================*
    * Transition of care Button, switches transition of care to yes or no
    *========================================================================*/
    $scope.btnTransitionOfCare = function(){
      var result = GetObsNow("CARETRANSIN");
      if(result == "no") SetObsValue("CARETRANSIN", "yes");
      else SetObsValue("CARETRANSIN", "no");
      updateTransitionOfCareStatus();
    };

    /*=======================================================================*
    * Vitals Button, searches for vitals or intake form then opens said form
    *========================================================================*/
    $scope.btnOpenVitalsForm = function(obj){
      var result1 = SearchFormList("vitals");
      var result2 = SearchFormList("intake");
      if(result1)       OpenFormComp(result1);
      else if(result2)  OpenFormComp(result2);
      else obj.stat = "Error - Vitals Page Not Found";
    };

    /*=======================================================================*
    * Easter Egg Button, once pressed it appends button code to array until
      correct code sequence is pressed then opens easter egg in a new window.
    *========================================================================*/
    $scope.btnEasterEgg = function(int){
      konamiArray.push(int);
      var konamiLength = konamiArray.length;
      var konamiCode = konamiArray.join("");
      if(konamiLength == 6){
        if(konamiCode == "113542") window.open("../Other/spaceInvaders.html","Space Invaders","width=950,height=650,menubar=0,location=0,toolbar=0,titlebar=0,status=0");
        else if(konamiCode == "553124") window.open("../Other/snake.html","Snake","width=550,height=575,menubar=0,location=0,toolbar=0,titlebar=0,status=0");
        konamiArray = [];
      }
    };

    /*=======================================================================*
    * Histories Button, searches for Histories form then opens said form
    *========================================================================*/
    $scope.btnOpenHistoriesForm = function(obj){
      var result = SearchFormList("Histories");
      if(result) OpenFormComp(result,"Social");
      else obj.stat = "Error - Histories Page Not Found";
    };

    /*=======================================================================*
    * Open Form Button, depending on objects description will open said form
    *========================================================================*/
    $scope.btnOpenForm = function(obj){
      var desc = obj.desc.toLowerCase();
      if(desc == "problems")          OpenProblemDiag();
      else if(desc == "medications")  OpenMedicationDiag();
      else if(desc == "allergies")    OpenAllergiesDiag();
      else if(desc == "directives")   OpenDirectivesDiag();
      else if(desc == "qmaf"){        OpenQMAFDiag(); SetObsValue(obj.arr[2], "Done");}
      getDocumentedStatus();
    };

    /*=======================================================================*
    * Mark Reviewed Button, Sets reviewed status to done in the chart overview
    *========================================================================*/
    $scope.btnMarkReviewed = function(obj){
      var obsStr = obj.arr[3];
      var obs = GetObsNow(obsStr);
      if(obs !== "Done") SetObsValue(obsStr, "Done");
      else SetObsValue(obsStr, "");
      getReviewedStatus();
    };

    /*=======================================================================*
    * Education Button, Opens proper handout depending on the edu status,
      records to MU activity log, and adds text to chart notes.
    *========================================================================*/
    $scope.Education = function(obj){
      for(var i=0; i<eduArray.length; i++){
        var found = SearchString(eduArray[i].desc, obj.desc);
        if(found){
          var activityID = 12;
          var handoutList = [];
          var desc = OpenHandout(obj.edu);
          var currentDate = getCurrentDate();
          var handoutObs = GetObsNow("HANDOUTSPRTD");
          var loginName = GetCurrentUser().loginName;
          try{ handoutList = JSON.parse(handoutObs); }catch(e){ }
          AddMUActivityLog(activityID,loginName,desc);

          if(handoutList.length == 0){
            handoutList.push((" - Patient’s <strong>"+eduArray[i].desc+"</strong>, recorded as (<strong>"+obj.value+"</strong>) on (<strong>"+currentDate+"</strong>), patient was provided education on <strong>"+eduArray[i].edu+"</strong>.<br>"));
            SetObsValue("HANDOUTSPRTD", JSON.stringify(handoutList));
          }else{
            for(var j=0; j<handoutList.length; j++){
              var found = SearchString(eduArray[i].desc,handoutList[j]);
              if(found) break;
              else if(!found && j==handoutList.length-1){
                handoutList.push((" - Patient’s <strong>"+eduArray[i].desc+"</strong>, recorded as (<strong>"+obj.value+"</strong>) on (<strong>"+currentDate+"</strong>), patient was provided education on <strong>"+eduArray[i].edu+"</strong>.<br>"));
                SetObsValue("HANDOUTSPRTD", JSON.stringify(handoutList));
              }
            }
          }
          obj.edu = ""; //ADDED BUT DIDNT CHANGE COLOR PERM
          updateChartNotes();
          break;
        }
      }
    };

    /*=======================================================================*
    * Writes varible "chartNotes" to the chart
    *========================================================================*/
    function updateChartNotes(){
      var handoutList = []
      var handoutObs = GetObsNow("HANDOUTSPRTD");
      var chartNotes = "<br><strong style=\"font-size:18px;\">Measures Review</strong><br>";

      try{ handoutList = JSON.parse(handoutObs); }catch(e){ }
      for(var i=0; i<handoutList.length; i++){ chartNotes += handoutList[i]; }

      SetTextTranslation(chartNotes, "html");
    };

    /*=======================================================================*
    * Replaces MEL error message box for better visuals and functionality
    *========================================================================*/
    function alertMsg(arr, cl){
      if(cl == 0) cl = 'alert-success';
      else if(cl == 1) cl = 'alert-info';
      else if(cl == 2) cl = 'alert-warning';
      else cl = 'alert-danger';
      $scope.alert = {cl: cl,ttl: arr[0],msg: arr[1],vis: true};
      setTimeout(function(){$scope.alert.vis = false}, 10000);
    };

    /*=======================================================================*
    * Checks the status between documented and reviewed to verify completion
    *========================================================================*/
    function CheckStatus(obj){
      if((obj.doc == "Done" || obj.doc == "--" || obj.omit == 1) && (obj.rev == "Done" || obj.rev == "--")) obj.stat = "Done";
      else obj.stat = "Missing"
    };

    /*=======================================================================*
    * Checks if demographics have been completed
      Note: can in place of done be the actual data from patient.
    *========================================================================*/
    function getDemographicsStatus(){
      for(var i=0; i<$scope.demographics.length; i++){
        var obj = $scope.demographics[i];
        var desc = obj.desc.toLowerCase();
        if(desc == "dob"){
          obj.stat = patient.dateOfBirth?"Done":"Missing";
          obj.value = patient.dateOfBirth?patient.dateOfBirth:"";
        }
        else if(desc == "gender"){
          obj.stat = patient.sex?"Done":"Missing";
          obj.value = patient.sex?patient.sex:"";
        }
        else if(desc == "race"){
          obj.stat = patient.race?"Done":"Missing";
          obj.value = patient.race?patient.race:"";
        }
        else if(desc == "ethnicity"){
          obj.stat = patient.ethnicity?"Done":"Missing";
          obj.value = patient.ethnicity?patient.ethnicity:"";
        }
        else if(desc == "language"){
          obj.stat = patient.preferredLanguage?"Done":"Missing";
          obj.value = patient.preferredLanguage?patient.preferredLanguage:"";
        }
        if(obj.stat == "Done") obj.tooltip = "";
      }
    };

    /*=======================================================================*
    * Checks if sections have been documented
    *========================================================================*/
    function getDocumentedStatus(){
      for(var i=0; i<$scope.reviewed.length; i++){
        var obj = $scope.reviewed[i];
        var desc = obj.desc.toLowerCase();
        var probA = obj.arr[0]?EvaluateMel(obj.arr[0]):false;
        var probB = obj.arr[1]?EvaluateMel(obj.arr[1]):false;
        var probN = obj.arr[2]?GetObsNow(obj.arr[2]):false;
        if(desc == "qmaf" && probN == "Done") obj.doc = "Done"      // == "done" added, Line 252 & 263 to fix Qmaf error alwyas done
        else if(desc == "directives"){
          if(patient.ageInYears>=65){
            if(probA || probB) obj.doc = "Done";
            else obj.doc = "Missing";
            obj.omit = 0;
          }else{
            obj.doc = "Age: " + patient.ageInYears + " Yrs";
            obj.omit = 1;
          }
        }
        else if(desc !== "qmaf" && (probA || probB || probT== "T")) obj.doc = "Done"; //desc !== "qmaf" added
        else obj.doc = "Missing";
        CheckStatus(obj);
      }
    };

    /*=======================================================================*
    * Checks the transition of care status and sets obsterm to correct yes or no
    *========================================================================*/
    function getTransitionOfCareStatus(){
      var result = GetObsNow("CARETRANSIN");
      if(result == "") SetObsValue("CARETRANSIN", "no");
      else if(result == "Y") SetObsValue("CARETRANSIN", "yes");
      updateTransitionOfCareStatus();
    };

    /*=======================================================================*
    * Checks if patient portal is active, inactive, or denied
    *========================================================================*/
    function getPortalAccessStatus(){
      for(var i=0; i<$scope.others.length; i++){
        var obj = $scope.others[i];
        if(obj.desc == "Portal Access:"){
          var result = LastObsValue("CLINMSG PAT");
          if(result == "1") obj.stat = "Active";
          else if(result == "2") obj.stat = "Invitaion-Denied";
          else obj.stat = "Inactive";
          break;
        }
      }
    };

    /*=======================================================================*
    * Checks if sections have been Reviewed via the chart overview checkboxes
    *========================================================================*/
    function getReviewedStatus(){
      for(var i=0; i<$scope.reviewed.length; i++){
        var obj = $scope.reviewed[i];
        var obs = GetObsNow(obj.arr[3]);
        if(obj.desc == "QMAF") obj.rev = "--";
        else if(obs == "Done") obj.rev = "Done";
        else obj.rev = "Missing";
        CheckStatus(obj);
      }
    };

    /*=======================================================================*
    * Checks current smoking status of patient
    *========================================================================*/
    function getSmokingStatus(){
      for(var i=0; i<$scope.others.length; i++){
        var obj = $scope.others[i];
        var found = SearchString("smoking",obj.desc);
        if(found){
          if(patient.ageInYears>=13){
            var smokeList = ["unknown","current","former","never"];
            var obsNow = GetObsNow("SMOK STATUS");
            var obsAny = ObsAny("SMOK STATUS");
            var obsAdv = GetObsNow("SMOK ADVICE");
            for(var j=0; j<smokeList.length; j++){
              var isNow = SearchString(smokeList[j],obsNow);
              var isAny = SearchString(smokeList[j],obsAny);
              if( isNow || isAny){
                if(obsAdv !== "yes" && smokeList[j] == "current") obj.stat = "Current - Advise to quit"
                else obj.stat = isNow? obsNow:obsAny;
                if(smokeList[j] == "current"){
                  obj.edu = "Smoking";
                  obj.value = "Current";
                }
                break;
              }
              else{
                obj.stat = "Missing";
                obj.edu = "";
              }
            }
          }else{
            obj.stat =  "Age: " + patient.ageInYears + " Yrs";
            obj.omit = 1;
          }
          break;
        }
      }
      getEducationStatus(obj);
    };

    /*=======================================================================*
    * Checks for each vital and requests for updates
    *========================================================================*/
    function getVitalsStatus(){
      for(var i=0; i<$scope.vitals.length; i++){
        var obj = $scope.vitals[i];
        var desc = obj.desc.toLowerCase();
        if(desc == "height"){ updateHeightStatus(obj);}
        else if(desc == "weight"){ updateWeightStatus(obj);}
        else if(desc == "bmi"){ updateBMIStatus(obj);}
        else if(desc == "bp"){ updateBPStatus(obj);}
        //corrections(obj);
      }
    };

    // DERRY!!
    // function corrections(obj){
    //
    //   var desc = "";
    //   var handoutList = [];
    //   var handoutObs = GetObsNow("HANDOUTSPRTD");
    //
    //   try{ desc = obj.desc }catch(e){};
    //   try{ handoutList = JSON.parse(handoutObs); }catch(e){};
    //
    //   try{
    //
    //     for(i=0; i<handoutList.length; i++){
    //       var found = SearchString(desc, handoutList[i]);
    //
    //       if(found){
    //         handoutList.splice(i,1);
    //         SetObsValue("HANDOUTSPRTD", JSON.stringify(handoutList));
    //         updateChartNotes();
    //         break;
    //       }
    //     }
    //     //window.alert(JSON.stringify(handoutList));
    //     //setTimeout(function(){ updateChartNotes(); window.alert("Triggered");},5000);
    //   }catch(e){ window.alert("2 " + e); }
    // };



    /*=======================================================================*
    * Updates the status of transition of care text
    *========================================================================*/
    function updateTransitionOfCareStatus(){
      for(var i=0; i<$scope.others.length; i++){
        var obj = $scope.others[i];
        var found = SearchString("transition",obj.desc);
        if(found){ obj.stat = GetObsNow("CARETRANSIN"); break; }
      }
    };

    /*=======================================================================*
    * Updates vitals height
    *========================================================================*/
    function updateHeightStatus(obj){
      if(patient.ageInYears>=2){
        var obs = ObsAny("HEIGHT");
        if(obs){
          obj.stat = "Done";
          obj.value = obs;
        }
        else obj.stat = "Missing";
      }else{
        obj.stat = "Age: "+ patient.ageInYears +" Yrs";
        obj.omit = 1;
      }
    };

    /*=======================================================================*
    * Updates vitals weight
    *========================================================================*/
    function updateWeightStatus(obj){
      if(patient.ageInYears>=2){
        var obs = GetObsNow("WEIGHT");
        if(obs){
          obj.stat = "Done";
          obj.value = obs;
        }
        else obj.stat = "Missing";
      }else{
        obj.stat = "Age: "+ patient.ageInYears +" Yrs";
        obj.omit = 1;
      }
    };

    /*=======================================================================*
    * Checks if problem is in current problems list
    *========================================================================*/
    function checkList(problem, currentProblems){
      for(var i=0; i<currentProblems.length; i++){
        if(problem.ICD10.toLowerCase() == currentProblems[i].ICD10.toLowerCase()) return true;
      }
      return false;
    };

    /*=======================================================================*
    * Gets current problems, checks if problem is already in current problems
      List, and adds problem to current problems list
    *========================================================================*/
    function getChkAdd(code){
      var currentProblems = getCurrentProblems();
      for(var i=0; i<problems.length; i++){
        var found = checkList(problems[i], currentProblems);
        if(problems[i].ICD10 == code && !found){
          var currentDate = getCurrentDate();
          var normalized = icd10Normalize(problems[i].ICD10);
          addProblem("DX OF",problems[i].desc,"ICD10-"+normalized, currentDate, "", "" , "N", "");
          alertMsg(["Problem Added:", (problems[i].ICD10+" "+problems[i].desc)], 1);
          break;
        }
      }
    };

    // DERRY!!!!!!
    // function getchkRemove(){
    //
    //   var currentProblems = getCurrentProblems();
    //
    //   for(var i=0; i<currprob.length; i++){
    //     if(problem.ICD10.toLowerCase() == currprob[i].ICD10.toLowerCase()){
    //       var rtn = removeProblem(currprob[i].PID, getCurrentDate(), false, "Resolved");
    //       setTimeout(function(){updateCurrentProblemsTable();},500);
    //       alertMsg(rtn, -1);
    //       break;
    //     }
    //   }
    // }

    /*=======================================================================*
    * Checks if patient is pregnant
    *========================================================================*/
    function isPregnant(){
      var currentProblems = getCurrentProblems();
      for(var i=0; i<currentProblems.length; i++){
        for(var j=0; j<pregnancyCodes.length; j++){
          var currentProblem = currentProblems[i].ICD10.toLowerCase().slice(0,pregnancyCodes[j].length);
          if(pregnancyCodes[j] == currentProblem) return true;
        }
      }
      return false;
    };

    /*=======================================================================*
    * Updates vitals BMI and automatically adds problems to current problems
      list depending on the patient's BMI
    *========================================================================*/
    function updateBMIStatus(obj){
      // Needs to be age ==< 18 || age ==> 74 ??
      var pregnant = isPregnant();
      if(patient.ageInYears>=18 && patient.ageInYears<=74 && !pregnant){
        var obs = GetObsNow("BMI");
        if(obs){
          obj.value = obs;
          obj.stat = "Done";
          if(obs < 18){obj.desc += " - Underweight"; obj.edu = "Malnutrition";}
          else if(obs > 18 && obs < 25){obj.desc += " - Normal"; obj.edu = "";}
          else if(obs > 25 && obs < 30){obj.desc += " - Overweight"; obj.edu = "Over weight";}
          else if(obs > 30 && obs < 40){obj.desc += " - Obese"; obj.edu = "Obesity";}
          else if(obs >= 40){obj.desc += " - Morbid Obesity"; obj.edu = "Morbid";
            getChkAdd("E6601");
            if(obs <= 44.9) getChkAdd("Z6841");
            else if(obs >= 45.0 && obs <= 49.9) getChkAdd("Z6842");
            else if(obs >= 50.0 && obs <= 59.9) getChkAdd("Z6843");
            else if(obs >= 60.0 && obs <= 69.9) getChkAdd("Z6844");
            else if(obs >= 70.0) getChkAdd("Z6845");
          }
        }else obj.stat = "Missing";
      }else{
        if(pregnant){
          obj.stat = "Pregnant";
          obj.omit = 1;
        }else{
          obj.stat = "Age: "+ patient.ageInYears +" Yrs";
          obj.omit = 1;
        }
      }
      getEducationStatus(obj);
    };


    /*=======================================================================*
    * Updates vitals BP recordings and if patient needs an education handout.
    *========================================================================*/
    function updateBPStatus(obj){
      if(patient.ageInYears>=2){
        var obs1 = GetObsNow("BP SYSTOLIC");
        var obs2 = GetObsNow("BP DIASTOLIC");
        if(obs1 && obs2){
          obj.value = obs1+"/"+obs2;
          obj.stat = "Done";
          if((obs1 <= 120) && (obs2 <= 80)){obj.edu = "";}
          else if(((obs1 >= 120) && (obs1 <= 139)) || ((obs2 >= 80) && (obs2 <= 89))){obj.edu = "";}
          else if((obs1 >= 140) || (obs2 >= 90)){obj.edu = "Hypertensive";}
          // if((obs1 >= 0 && obs1 <= 119) && (obs2 >= 0 && obs2 <= 80)){obj.desc += " - Normal"; obj.edu = "";}
          // else if((obs1 >= 120 && obs1 <= 129) && (obs2 >= 0 && obs2 <= 80)){obj.desc += " - Elevated"; obj.edu = ""}
          // else if((obs1 >= 130 && obs1 <= 139) || (obs2 >= 81 && obs2 <= 89)){obj.desc += " - Stage 1"; obj.edu = "Stage 1"}
          // else if((obs1 >= 140 && obs1 <= 999) || (obs2 >= 99 && obs2 <= 999)){obj.desc += " - Stage 2"; obj.edu = "Stage 2"}
          else{obj.desc += " - Invalid"; obj.edu = "";}
        }else obj.stat = "Missing";
      }else{
        obj.stat = "Age: "+ patient.ageInYears +" Yrs";
        obj.omit = 1;
      }
      getEducationStatus(obj);
    };

    /*=======================================================================*
    * Gets and sets education status if user has already clicked on education
    *========================================================================*/
    function getEducationStatus(obj){
      for(var i=0; i<eduArray.length; i++){
        var found1 = SearchString(eduArray[i].desc,obj.desc);
        if(found1){
          var handoutObs = GetObsNow("HANDOUTSPRTD");
          var found2 = SearchString(eduArray[i].desc,handoutObs);
          if(handoutObs !=="" && found2){
            obj.edu = "";
            break;
          }
        }
      }
    };




    /*=======================================================================*
    * Initialization, Do not move
    *========================================================================*/
    function INIT(){
      getDemographicsStatus();
      getVitalsStatus();
      getPortalAccessStatus();
      getTransitionOfCareStatus();
      getSmokingStatus();
      getReviewedStatus();
      getDocumentedStatus();
      //corrections();
    };
    window.onload = INIT();
    document.onload = INIT();

    /*=======================================================================*
    * Fixes a digestion issue with section table
    *========================================================================*/
    setInterval(function(){ getReviewedStatus(); getDocumentedStatus(); try{$scope.$digest()}catch(e){}}, 5000);

    /*=======================================================================*
    * Required for the tooltips to display properly
    *========================================================================*/
    $(document).ready(function(){
      $('[data-toggle="tooltip"]').tooltip();
    });

  });
}());
