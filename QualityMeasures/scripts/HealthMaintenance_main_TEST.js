/****************************************************
*               Health Maintenance   		      			*
*   		 			 05-DEC-2016, RWemlinger     					*
*****************************************************
* This form will be used to display health 			    *
*  maintenance information.		               				*
****************************************************/

/*Check if the interface between MEL Engine and HTML is present or not */
if (isMelThere()) {
  initializeApplication()
} 

// On page load get patient information and measures
function runHM() {	
	$('#errorMsgDiv').hide();
	fnHMGetImmunizations();
	fnHMGetScreenings();
	//fnHMGetLabTests();
	fnHMGetDiseaseMgmt();
};

// Populate Immunization information in Immunization Section
function fnHMGetImmunizations() {
	// Variables
	var rawImmunList = Mel.eval('{IMMUN_GETLIST("", "Last")}'); // Latest immunizations	
	var immunHTML = "";
	var tdHTML = "";

	if (rawImmunList != "") {
		var immunList = rawImmunList.split("|");
		var immunData;
		// Loop through immunizations
		for (var i = 0; i < immunList.length; i++){
			immunData = immunList[i].split("^");
			tdHTML = tdHTML + "<tr><td>" + immunData[2] + "</td><td class='text-center'>" + immunData[3] + "</td><td class='text-center'>" + immunData[29].split(" ")[0] + "</td></tr>" 
		}
	}

	if (tdHTML != ""){
		immunHTML = '<table class="qmTable table-striped">';
		immunHTML = immunHTML + '<tr><th>Group</th><th class="text-center">Vaccine</th><th class="text-center">Administered</th></tr>';
		immunHTML = immunHTML + tdHTML;
		immunHTML = immunHTML + '</table>';
	}
	else {
		immunHTML = "No recorded immunizations";
	}

	// Write to immunization div
	document.getElementById("immunHMDiv").innerHTML = immunHTML;
};

function fnHMGetScreenings() {
	var screeningHTML = '<table class="qmTable table-striped">';
	screeningHTML = screeningHTML + '<tr><th>Screening</th><th class="text-center">Result (Date)</th><th class="text-center">Add New Screening Record</th></tr>';

	// Create array of observation obs/name values
	var obsData;
	var observations = [
	  ["Colonoscopy", "COLONOSCOPY"],
	  ["Sigmoid", "SIGMOID"],
	  ["Hemoccults", "HEMOCCULT"],
	  ["Opthalmology Exam", "OPTHALMOLOGY"],
	  ["Dental Exam", "DMDENTEXLAST"]
	];

	// Check tobacco use and add smoking cessation counseling if patient is a user
	var tobaccoObs = Mel.eval('{fnUtilityGetMostRecentObsName(ARRAY("TOBACCO USE","SMOKES","ORALTOBACUSE"))}');
	if (tobaccoObs != "") {
		var tobaccoData = fnGetObsData("Tobacco Use",tobaccoObs);
		tobaccoData = tobaccoData[3].toLowerCase();
		if (tobaccoData != "no" && tobaccoData != "never" && tobaccoData != "false" && tobaccoData != "former") {
			observations.push(["Tobacco Cessation", "SMOK ADVICE"]);
		}
	}

	// If patient is female (and not exempt) add mammogram
	if (Mel.eval("{Patient.Sex}") == "Female" && Mel.eval('{OBSPREV("MAMMO_EXEMPT")}') == "") {
		observations.push(["Mammogram", "MAMMOGRAM"]);
	}	

	for (var obs = 0; obs < observations.length; obs++) {
    obsData = fnGetObsData(observations[obs][0],observations[obs][1]);
		screeningHTML = screeningHTML + fnCreateTR(obsData);
	} 

	// Write to screening div
	screeningHTML = screeningHTML + "</table>";
	document.getElementById("screenHMDiv").innerHTML = screeningHTML;
}

/*function fnHMGetLabTests() {
	var labTestHTML = '<table class="qmTable table-striped">';
	labTestHTML = labTestHTML + '<tr><th>Lab / Test</th><th class="text-center">Result (Date)</th><th class="text-center" width="300">Add New Lab/Test Result</th></tr>';

	// Decide most recent observations for necessary obs
	var ekgObs = Mel.eval('{fnUtilityGetMostRecentObsName(ARRAY("EKG","EKG INTERP"))}');
	if ( ekgObs == "" ) {ekgObs = "EKG";}

	// Create array of observation obs/name values
	var obsData;
	var observations = [
		["Albumin", "ALBUMIN"],
		["Alkaline Phosphate", "ALK PHOS"],
		["Amylase", "AMYLASE"],
		["B-12", "B-12"],
		["Basophil Count", "BASOPH COUNT"],
		["Bilirubin Direct", "BLI DIRECT"],
		["Bilirubin Indirect", "BLI INDIREC"],
		["Bilirubin Total", "BLI TOTAL"],
		["BUN (Urea Nitrogen)", "BUN"],
		["BUN/CREAT", "BUN/CREAT"],
		["Calcium", "CALCIUM"],
		["Chol/HDL", "CHOL/HDL"],
		["Cholesterol", "CHOLESTEROL"],
		["Creatinine", "CREATININE"],
		["Eosiniphil Count", "EOS COUNT"],
	  ["Echo", "ECHOCARDIOGR"],
	  ["EKG", ekgObs],
		["ESR", "ESR"],
		["GFR", "GFR"],
		["Globulins", "GLOBULIN TOT"],
		["Glucose (Blood) ", "GLUCOSE SER"],
		["Hematocrit", "HCT"],
		["HDL", "HDL"],
		["Hemoglobin", "HGB"],
		["Hemoglobin A1C", "HGBA1C"],
		["INR", "INR"],		
		["LDL Cholesterol", "LDL"],
		["Lipase", "LIPASE"],
		["LVEF", "LVEF"],
		["MCH", "MCH"],
		["MCHC", "MCHC"],
		["MCV", "MCV"],
		["Neutrophil Count", "NEUTROPHLTOT"],
		["O2 Saturation", "O2SAT(OXIM)"],
		["Platelet Count", "PLATELETS"],
		["Potassium", "POTASSIUM"],
		["Protein, Total", "PROTEIN, TOT"],
		["Protein, Urine", "PROTEIN, URN"],
		["PSA, Ultrasensitive", "PSAULTRASEN"],
		["RBC (Erythrosite)", "RBC"],
		["RDW", "RDW"],
		["Respiratory Rate", "RESP RATE"],
		["Sodium", "SODIUM"],
		["SGOT (AST)", "SGOT (AST)"],
		["SGPT (ALT)", "SGPT (ALT)"],
	  ["Stress Test", "STRESS EKG"],
		["Testosterone, Total", "TESTO, TOTAL"],
		["Testosterone, Free", "TESTOS FREE"],
		["Triglyceride", "TRIGLYCERIDE"],
		["TSH, Ultra", "TSH ULTRA"],
		["Vitamin D", "VIT D 25-CH"],
		["VLDL", "VLDL"],
		["WBC", "WBC"]
	];

	// If patient is female (and not exempt) add pap smear
	if (Mel.eval("{Patient.Sex}") == "Female" && Mel.eval('{OBSPREV("PAP_EXEMPT")}') == "") {
		observations.push(["Pap/Pathology", "PAP SMEAR"]); 
	}	

	for (var obs = 0; obs < observations.length; obs++) {
    obsData = fnGetObsData(observations[obs][0],observations[obs][1]);
		labTestHTML = labTestHTML + fnCreateTR(obsData);
	} 

	// Write to lab/test div
	labTestHTML = labTestHTML + "</table>";
	document.getElementById("labTestHMDiv").innerHTML = labTestHTML;
}*/

function fnHMGetDiseaseMgmt() {
	var screeningHTML = '<table class="qmTable table-striped">';
	screeningHTML = screeningHTML + '<tr><th>Disease Mgmt Task</th><th class="text-center">Result (Date)</th><th class="text-center" width="300">Add New Screening Record</th></tr>';

	// Create array of observation obs/name values
	var obsData;
	var observations = [];
	var newObs = [];
	
	// Check for diabetes
	var testing = Mel.eval('{checkDxList("E11")}');
	debugBox.innerHTML = testing;
	if (Mel.eval('{checkDxList("E10")}') != 'FALSE' || Mel.eval('{checkDxList("E11")}') != 'FALSE') {
		newObs.push("Diabetic Foot Exam", "DIAB FOOT CK");
		observations.push(newObs);
	} 	

	// If the patient has screenings to add create TR's 
	if (observations.length > 0) {
		for (var obs = 0; obs < observations.length; obs++) {
    	obsData = fnGetObsData(observations[obs][0],observations[obs][1]);
			screeningHTML = screeningHTML + fnCreateTR(obsData);
		} 
	}
	else {
		screeningHTML = '<table class="qmTable table-striped"><tr><td><strong>No Screenings Available</strong></td></tr>';
	}	

	// Write to screening div
	screeningHTML = screeningHTML + "</table>";
	document.getElementById("diseaseMgmtHMDiv").innerHTML = screeningHTML;
}

// Take in OBSTERM and return list [obsTerm, obsName, obsDate, obsValue]
function fnGetObsData(obsName, obsTerm) {
	var obsData = [];
	var obsValue = Mel.eval('{LASTOBSVALUE("' + obsTerm + '")}');
	var obsDate = Mel.eval('{LASTOBSDATE("' + obsTerm + '")}');
	obsData.push(obsTerm);
	obsData.push(obsName)
	obsData.push(obsDate);
	obsData.push(obsValue);
	return obsData;
}

// Create TR for Screening Table 
// obsData: 0 = term, 1 = name, 2 = date, 3 = value
function fnCreateTR(obsData) {
	var returnTR = "<tr>";
	// obsName
	returnTR = returnTR + "<td>" + obsData[1] + "</td>"; 
	// obsValue (obsDate), "-" if no obs
	if (obsData[2] == "") { 
		returnTR = returnTR + "<td class='text-center'>-</td>"; 
	} 
	else {
		returnTR = returnTR + "<td class='text-center'>" + obsData[3] + " (" + obsData[2] + ")" +"</td>";
	}
	// Create update TR
	returnTR = returnTR + "<td class='form-horizontal text-center'>";
	returnTR = returnTR +   "<div class='tblInputDiv'><select id='" + obsData[0] + "_val' class='form-control input-sm'><option>Completed</option><option>Refused</option></select></div>";
	returnTR = returnTR +   "<div class='tblInputDiv'><input id='" + obsData[0] + "_date' type='text' size='7' class='form-control input-sm' placeholder='mm/dd/yyyy'/></div>";
	returnTR = returnTR +   "<div class='tblInputDiv'><button class='btn btn-primary btn-sm' onclick='fnAddObs(this,\"" + obsData[1] + "\",\"" + obsData[0] + "\")'>Add</button>";
	if (obsData[1] == "Colonoscopy") {
		returnTR = returnTR + "<div class='tblInputDiv'><button class='btn btn-success btn-sm' onclick='fnRequestColonoscopy(this)'>Order</button></div></div>";
	}
	else {
		returnTR = returnTR + "</div>";
	}	
	returnTR = returnTR + "</td>";

	returnTR = returnTR + "</tr>";
	return returnTR;
}

function fnAddObs(btnObject, obsName, obsTerm) {
	// Get obs value and date from input object
	var obsValue = obsTerm + "_val";
	var obsDate = obsTerm + "_date";
	obsValue = document.getElementById(obsValue);
	obsDate = document.getElementById(obsDate);

	// Get parent div for messaging
	var parentTD = $(btnObject).parent();

	// Validate date format of MM/DD/YYYY
	var dateFmt = /[0-1][0-9][/][0-3][0-9][/][19|20][0-9][0-9]/;
	if (obsDate.value.match(dateFmt) && obsDate.value.length == 10) {
		// Get target value location
		var obsRecordTD = parentTD.parent().prev();
		var chrtNote = '{DOCUMENT.MeasuresChartNote = DOCUMENT.MeasuresChartNote + "   - ' + obsName + ': ' + obsValue.value + ' (' + obsDate.value + ')" + HRET}';
		Mel.eval(chrtNote);
		// Add observation and set target text
		var melStatement = '{OBSNOW("' + obsTerm + '","' + obsValue.value + '","' + obsDate.value + '")}';
		Mel.eval(melStatement);		

		obsRecordTD.html(obsValue.value + " (" + obsDate.value + ")");
		parentTD.parent().html("<span class='bldGreenTxt'>Observation Added</span>");
		document.getElementById("errorMsgDiv").innerHTML = "";
		$("#errorMsgDiv").hide("slow");
	}
	else {
		// Add error messaging
		obsDate.parentElement.className += " has-error";
		document.getElementById("errorMsgDiv").innerHTML = "<span><strong>Observation Date:</strong> Please ensure date format is MM/DD/YYYY</span>";		
		$("#errorMsgDiv").addClass("alert-danger");
		$("#errorMsgDiv").show("slow");
	}
}

// Sent Colonoscopy request to Referral Specialist
function fnRequestColonoscopy(btnObject) {
	Mel.eval('{MEL_SEND_FLAG("Flag", "referralgeneric", "N", str(._todaysdate),"Surgery Referral", "Patient needs colonoscopy screening.", "Orders")}');
	Mel.eval('{MEL_SEND_FLAG("Flag", "referralgeneric", "N", str(ADDDATES(str(._TODAYSDATE),"0","0","60")),"    Follow Up - Surgery Referral ", "Follow Up - Patient needs colonoscopy screening.", "Orders")}');
	
	// Get parent div for messaging and ad messaging
	var parentTD = $(btnObject).parent();
	parentTD.parent().html("<span class='bldGreenTxt'>Ordered</span>");

	// Add to chart note
	Mel.eval('{DOCUMENT.MeasuresChartNote = DOCUMENT.MeasuresChartNote + "   - Request sent to Referral Specialist to schedule a colonoscopy screening appointment" + HRET}');
}