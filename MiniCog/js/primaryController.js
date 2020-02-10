/*=========================================================================
* @author Derry Everson
*
* Work:
** https://www.catalystmedicalgroup.com
** deverson@valleymedicalcenter.com
*
* Date: 09/13/2019
*========================================================================*/

/*=========================================================================
* OBS TERMS USED
* 0
*========================================================================*/


(function(){
  var formApp = angular.module('minicogApp', []);
  formApp.controller('minicogController', function ($scope, $parse, $window, $interval, $http) {

    /*=======================================================================*
    * Global Varible - START
    *========================================================================*/
    var chartNotes = "<br><strong style=\"font-size:18px;\">Mini-Cog</strong><br>";
    var scoreNotes = "";
    var followupNotes = "";
    var additionalNotes = "";

    var recallVersions = [
      {version: 1, Q1: "Banana",    Q2: "Sunrise",  Q3: "Chair"},
      {version: 2, Q1: "Leader",    Q2: "Season",   Q3: "Table"},
      {version: 3, Q1: "Village",   Q2: "Kitchen",  Q3: "Baby"},
      {version: 4, Q1: "River",     Q2: "Nation",   Q3: "Finger"},
      {version: 5, Q1: "Captain",   Q2: "Garden",   Q3: "Picture"},
      {version: 6, Q1: "Daughter",  Q2: "Heaven",   Q3: "Mountain"}
    ]

    $scope.recallVersion = getVersion(recallVersions);

    $scope.scores = {
      word: "Missing",
      clock: "Missing",
      total: "Incomplete"
    };
    /*=======================================================================*
    * Global Varible - END
    *========================================================================*/

    /*=======================================================================*
    * updates score notes for chart
    *========================================================================*/
    function setScoreNotes(scores){
      scoreNotes = "";
      if(scores.clock == 0) scoreNotes += " - Patient was <strong>unable and or refused</strong> to complete the drawing<br>";
      else if(scores.clock == 1) scoreNotes += " - Patient had an <strong>abnormal</strong> clock drawing<br>";
      else if(scores.clock == 2) scoreNotes += " - Patient had a <strong>normal</strong> clock drawing<br>";
      if(scores.total >= 3)scoreNotes += " - Mini-Cog score is within normal limits<br>";
      else scoreNotes += " - Mini-Cog score may indicate further evaluation of cognitive status<br>";
      updateChartNotes();
    };

    /*=======================================================================*
    * updates total score
    *========================================================================*/
    function setTotalScore(){
      var scores = $scope.scores;
      var total = scores.word + scores.clock;
      if(total >= 0){
        scores.total = total;
        setScoreNotes(scores);
      }
    };

    /*=======================================================================*
    * randomize version selected for patient
    *========================================================================*/
    function getVersion(arr){
      var rand = Math.floor((Math.random() * arr.length));
      return arr[rand];
    };

    /*=======================================================================*
    * auto fills the answers to save overall time on form
    *========================================================================*/
    function getWords(){
      $scope.A1 = $scope.recallVersion.Q1;
      $scope.A2 = $scope.recallVersion.Q2;
      $scope.A3 = $scope.recallVersion.Q3;
    };

    /*=======================================================================*
    * updates final chart notes and pushes it to chart
    *========================================================================*/
    function updateChartNotes(){
      try{
        SetTextTranslation(chartNotes + scoreNotes + followupNotes + additionalNotes, "html");
      }catch(e){
        console.log(e+"\n\n"+chartNotes+"\n\n"+scoreNotes+"\n\n"+followupNotes+"\n\n"+additionalNotes);
      }
    };

    /*=======================================================================*
    * updates additional notes for chart
    *========================================================================*/
    $scope.setAdditionalComments = function(comments){
      additionalNotes = " - Additional Comments: " + comments + "<br>";
      updateChartNotes();
    };

    /*=======================================================================*
    * updates clock drawing score
    *========================================================================*/
    $scope.setClockScore = function(value){
      $scope.scores.clock = parseInt(value);
      setTotalScore();
    };

    /*=======================================================================*
    * updates follow up notes for chart
    *========================================================================*/
    $scope.setRefuseFollowup = function(checked){
      if(checked) followupNotes = " - Patient refused followup appintment<br>";
      else followupNotes = "";
      updateChartNotes();
    };

    /*=======================================================================*
    * updates word recall score depending on patients response
    *========================================================================*/
    $scope.setWordScore = function(version, A1, A2, A3){
      var total = 0;
      if(version.Q1.toLowerCase() == A1.toLowerCase()){total += 1; $scope.CA1 = 1;}
      else $scope.CA1 = 0;
      if(version.Q2.toLowerCase() == A2.toLowerCase()){total += 1; $scope.CA2 = 1;}
      else $scope.CA2 = 0;
      if(version.Q3.toLowerCase() == A3.toLowerCase()){total += 1; $scope.CA3 = 1;}
      else $scope.CA3 = 0;
      $scope.scores.word = total;
      setTotalScore();
    };

    /*=======================================================================*
    * Init do not move location
    *========================================================================*/
    function init(){
      getWords();
    };
    init();

    // console.log(
    //
    //   "%c            `...`                          \n"+
    //   "        :sdMMMMMMMmy:                      \n"+
    //   "      `dMMMMMMMMMMMMMd`                    \n"+
    //   "      hMMMMMMhyhNMMMMMh     ..             \n"+
    //   "      MMMMMM-   .MMMMMM     oMh:           \n"+
    //   "      MMMMMM`    MMMMMM`    oMMMm+`        \n"+
    //   "      MMMMMM`    -osyys     :yyssNNs.      \n"+
    //   "      MMMMMM`                    yMMMh-    \n"+
    //   "      MMMMMM`                    yMMNs.    \n"+
    //   "      MMMMMM`    :ydddd`    /ddddNm+`      \n"+
    //   "      MMMMMM`    MMMMMM`    oMMMh:         \n"+
    //   "      MMMMMM:   -MMMMMM     oNs.           \n"+
    //   "      hMMMMMMdhdMMMMMMy     ``             \n"+
    //   "      `yMMMMMMMMMMMMMh`                    \n"+
    //   "        .ohNMMMMMNdo-                      \n"+
    //   "             ```                           \n"+
    //   "      Catalyst Medical Group               \n"+
    //   "                                           \n"+
    //   "      Author: Derry Everson                \n"+
    //   "                                           \n",
    //   'background: #00426c; color: #fff'
    // );
    // var developers = [
    //   {CMG_Developers: "Derry Everson", Email: "deverson@valleymedicalcenter.com"},
    //   {CMG_Developers: "Robin Wemlinger", Email: "rwemlinger@valleymedicalcenter.com"},
    // ];
    // console.table(developers)

  });
}());
