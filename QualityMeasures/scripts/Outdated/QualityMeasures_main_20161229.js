/****************************************************
*                 Quality Measures   		      			*
*   		 			 30-SEP-2016, RWemlinger     					*
*****************************************************
* This form will be used to display measures not    *
* being met for the patient.                				*
****************************************************/

/*Check if the interface between MEL Engine and HTML is present or not */
if (isMelThere()) {
  initializeApplication()
} 

// On page load get patient information and measures
$(window).load(function () {
	fnGetPtInfo();
	fnRefreshMeasures();
});

function fnRefreshMeasures() {
	Mel.eval("{getImmunMeasures(ptAge, ptSex, chartDate)}");
	Mel.eval("{getScreeningMeasures(ptAge, ptSex, chartDate)}");
	Mel.eval("{getLabMeasures(ptAge, ptSex, chartDate)}");
	Mel.eval("{getDiseaseMgmtMeasures(ptAge, ptSex, chartDate)}");
	fnGetMeasures("Immunizations", "immunMeasuresDiv");
	fnGetMeasures("Screenings", "screeningMeasuresDiv");
	fnGetMeasures("Labs", "labMeasuresDiv");
	fnGetMeasures("DiseaseMgmt", "diseaseMgmtMeasuresDiv");
}

function fnGetPtInfo() {
	var ptName = Mel.eval("{Patient.FirstName}") + " " + Mel.eval("{Patient.LastName}");
	var ptDOB = Mel.eval("{Patient.DateOfBirth}");

	ptNameSpan.innerHTML = ptName;
	ptDOBSpan.innerHTML = ptDOB;	
};

/************** MODAL ***************
* Sets modal variables and actions
/************************************/
var QMModal = document.getElementById('QMModal'); // Modal
var QMModalSpan = document.getElementsByClassName("close")[0]; // Span to close Modal
var QMModalBtnRef;

// fnOpenModal opens the modal
function fnOpenModal(headerText, modalBody) {
	document.getElementById("QMModalHeader").innerHTML = headerText;
	document.getElementById("QMModalBody").innerHTML = modalBody;
  QMModal.style.display = "block";
}

// fnCloseModal closes the modal
function fnCloseModal() {
	QMModalHeader.innerHTML = "Error";
	QMModalBody.innerHTML = "<p>Please contact IS at extension 6990.</p>";
	QMModalAlert.innerHTML = "";
	QMModal.style.display = "none";
}
// When the user clicks on <span> (x), close the modal
QMModalSpan.onclick = function() {
  fnCloseModal();
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == QMModal) {
    fnCloseModal();
  }
}

/*********** fnGetMeasures ***********
* Retrieves given measure list and populates HTML table in given div.
/************************************/
function fnGetMeasures(measure, targetDiv) {
	var upcoming = Mel.eval("{gblUpcoming" + measure + "}");
	var overdue =  Mel.eval("{gblOverdue" + measure + "}");
	var measureHTML = "";
	var measureHeader = $("#" + measure + "Anchor").parent().parent();

	if (upcoming == "" && overdue == "") {
		// Collapse panel and change background color to success color
		measureHeader.addClass("successBgColor");
		measureHeader.removeClass("failBgColor");
		if (measureHeader.hasClass("collapsed")) { $("#" + measure + "Anchor").trigger('click'); }
		measureHTML = '<p class="indent">Measures Met</p>';
	}
	else {
		// Expand panel and change background color to failure color
		measureHeader.addClass("failBgColor");
		measureHeader.removeClass("successBgColor");
		if (!measureHeader.hasClass("collapsed")) { $("#" + measure + "Anchor").trigger('click'); }

		measureHTML = '<table class="qmTable table-striped">'
		measureHTML = measureHTML + '<tr><th>Measure</th><th class="text-center">Previous</th><th class="text-center">Due Before</th><th></th></tr>';
		measureHTML = fnCreateMeasureTR(overdue, measureHTML, "bldRedTxt")
		measureHTML = fnCreateMeasureTR(upcoming, measureHTML, "")
		measureHTML = measureHTML + '</table>';
	}
	
	document.getElementById(targetDiv).innerHTML = measureHTML;
};

/********* fnCreateMeasureTR *********
* Takes in measure list, current HTML, and td class to return table contents for given measure
/************************************/
function fnCreateMeasureTR(measureList, currentMeasureHTML, tdClass) {
	var returnHTML = currentMeasureHTML;
	var tdClassText = "";
	var measureArray = measureList.split("|");
	var userName;
	var itemArray;
	var buttonArray;

	if (tdClass !== "") { tdClassText = ' class="' + tdClass + '"';}
	
	for (i = 0; i < measureArray.length; i++) {
		if (measureArray[i] != "") {
			returnHTML = returnHTML + '<tr>';
			itemArray = measureArray[i].split("^");
			for (j = 0; j < itemArray.length; j++) {
				// Action Button
				if (j == 3) {
					returnHTML = returnHTML + '<td class="text-center">';
					if (itemArray[j] != "") {
						buttonArray = itemArray[j].split(";")
						returnHTML = returnHTML + '<button class="btn btn-primary btn-xs" onclick="' + buttonArray[1] + '"';
						returnHTML = returnHTML + 'title="' + buttonArray[2] +  '">'; 
						returnHTML = returnHTML + buttonArray[0] + '</button>';
					}
					returnHTML = returnHTML + '</td>';				
				}
				// Measure Name
				else if (j == 0) {
					returnHTML = returnHTML + '<td '+ tdClassText + '>' + itemArray[j] + '</td>';
				}
				// Measure Previous/Due Dates
				else {
					var centerTdClass = ' class="' + tdClass + ' text-center"';
					returnHTML = returnHTML + '<td' + centerTdClass + '>' + itemArray[j] + '</td>';
				}
			}
			returnHTML = returnHTML + '</tr>';
		}
	}		

	return returnHTML; 
}

/********** ACTION BUTTONS **********
* The below functions are for the action buttons
/************************************/
// Change button appearance on success
function fnSetSuccessTd(btnElement, btnText, chartNote) {
	Mel.eval('{DOCUMENT.MeasuresChartNote = DOCUMENT.MeasuresChartNote + "   - ' + chartNote + '" + HRET}');
	var parentTD = $(btnElement).parent();
	parentTD.html(btnText);
	parentTD.addClass('bldGreenTxt');
}

// Order Mammogram
function fnOrderMammogram(btnElement, btnText) {
	Mel.eval('{MEL_ADD_ORDER("T", "Mammogram", "Mammo: Screening Bilateral mammogram", "", "ICD10-Z12.31", "Screening mammogram NEC", "", "", "N", USER.LOGINNAME, "")}');
	fnSetSuccessTd(btnElement, btnText, "Mammogram ordered");
}

// Email Colonoscopy request to EC Nurse Account
function fnRequestColonoscopy(btnElement, btnText) {
	var ptName = Mel.eval("{Patient.FirstName}") + "%20" + Mel.eval("{Patient.LastName}");
	var webAddr = "http://intranet/apps/email/surgery/default.asp?PNAME=" + ptName + '%20-%20' + ptDOBSpan.innerHTML;
	Mel.eval('{fnUtilityOpenBrowser("' + webAddr + '")}');
	fnSetSuccessTd(btnElement, btnText, "Request sent to Surgery to schedule a colonoscopy screening appointment");
}

// Email Colonoscopy request to EC Nurse Account
function fnRecordCessationCounseling(btnElement, btnText) {
	Mel.eval('{OBSNOW("SMOK ADVICE", "yes")}');
	fnSetSuccessTd(btnElement, btnText, "Smoking cessation was recommended during this visit");
}

// Order BMP (Basic Metabolic Panel)
function fnOrderBMP(btnElement, btnText) {
	Mel.eval('{MEL_ADD_ORDER("T", "Laboratory", "Basic Metabolic Panel", "", "ICD10-Z00.00", "Routine gen medical exam at health care facility", "", "", "N", USER.LOGINNAME, "")}');
	fnSetSuccessTd(btnElement, btnText, "Basic Metabolic Panel (BMP) ordered");
}

// Order Digoxin Assay
function fnOrderDigoxin(btnElement, btnText) {
	Mel.eval('{MEL_ADD_ORDER("T", "Laboratory", "Digoxin", "", "ICD10-Z00.00", "Routine gen medical exam at health care facility", "", "", "N", USER.LOGINNAME, "")}');
	fnSetSuccessTd(btnElement, btnText, "Dixogin Assay ordered");
}

// Order LDL
function fnOrderLDL(btnElement, btnText) {
	Mel.eval('{MEL_ADD_ORDER("T", "Laboratory", "LDL Cholesterol (Direct)", "", "ICD10-Z00.00", "Routine gen medical exam at health care facility", "", "", "N", USER.LOGINNAME, "")}');
	fnSetSuccessTd(btnElement, btnText, "LDL Cholesterol lab test ordered");
}

// Order Hemoglobin A1C (HgbA1c)
function fnOrderHgbA1c(btnElement, btnText) {
	Mel.eval('{MEL_ADD_ORDER("T", "Laboratory", "Hemoglobin A1C", "", "ICD10-Z00.00", "Routine gen medical exam at health care facility", "", "", "N", USER.LOGINNAME, "")}');
	fnSetSuccessTd(btnElement, btnText, "Hemoglobin A1C (HgbA1c) lab test ordered");
}

// Order Hemoglobin A1C (HgbA1c) and LDL
function fnOrderHgbA1cLDL(btnElement, btnText) {
	Mel.eval('{MEL_ADD_ORDER("T", "Laboratory", "Hemoglobin A1C", "", "ICD10-Z00.00", "Routine gen medical exam at health care facility", "", "", "N", USER.LOGINNAME, "")}');
	Mel.eval('{MEL_ADD_ORDER("T", "Laboratory", "LDL Cholesterol (Direct)", "", "ICD10-Z00.00", "Routine gen medical exam at health care facility", "", "", "N", USER.LOGINNAME, "")}');
	fnSetSuccessTd(btnElement, btnText, "Hemoglobin A1C (HgbA1c) and LDL lab tests ordered");
}

// Add pap smear advice to chart note
function fnPapSmear(btnElement, btnText) {	
	fnSetSuccessTd(btnElement, btnText, "Patient advised that pap smear is due");
}

// *** TOBACCO SCREENING SECTION *** \\
	// Tobacco Screening
	function fnTobaccoScreening(btnElement, btnText) {
		// Check most recent tobacco use obs term to grab which radio (if any) should be defaulted
		var currentUse = "";
		var formerUse = "";
		var neverUse = "";
		var tobaccoObsTerm = Mel.eval('{fnUtilityGetMostRecentObsName(ARRAY("TOBACCO USE","SMOKES","ORALTOBACUSE"))}');
		var tobaccoUse = Mel.eval('{OBSANY("' + tobaccoObsTerm + '")}');
		tobaccoUse = "";
		if (tobaccoUse != "") {
			switch (tobaccoUse.toLowerCase()) {
				case "former":
					formerUse = " checked";
					break;
				case "no":
					neverUse = " checked";
					break;
				case "never":
					neverUse = " checked";
					break;
				case "false":
					neverUse = " checked";
					break;
				default:
					currentUse = " checked";
			}
		}
		// Get checkbox hidden indicator
		var hideCounselBox = " hidden";
		if (currentUse == " checked") { hideCounselBox = ""; }

		

		// Set modal reference variable to passed "this" (tobacco screening) button
		QMModalBtnRef = $(btnElement)
		// Create popup content and open modal
		var modalBody = "<h3>Please indicate the patient's tobacco use:</h3>" +
										"<form id='tobaccoUseForm'><div class='indent'>" +
										"	<div class='radio'><label><input type='radio' name='tobaccoScreen' value='Current'" + currentUse + " onclick='fnDisplayCounsBox(\"Current\")'> Current</label></div>" +
										"	<div class='radio'><label><input type='radio' name='tobaccoScreen' value='Former'" + formerUse + " onclick='fnDisplayCounsBox(\"Former\")'> Former</label></div>" +
										"	<div class='radio'><label><input type='radio' name='tobaccoScreen' value='Never'" + neverUse + " onclick='fnDisplayCounsBox(\"Never\")'> Never</label></div>" +
										" <div class='checkbox" + hideCounselBox + "' id='counsBoxDiv'><label><input type='checkbox' name='cessCounsBox' value='counseled'>Provided cessation counseling</label></div>" + 
										" <input type='button' value='Record' class='btn btn-success' onclick='fnUpdateTobaccoUse($(QMModalBtnRef), \"" + btnText + "\")' />" +
										"</div></form>";

		fnOpenModal("Tobacco Use Screening", modalBody);

	}

	// Function to hide/display cessation counseling checkbox based on radio selection
	function fnDisplayCounsBox(tobaccoUse) {
		if ( tobaccoUse == "Current" ) {
			$("#counsBoxDiv").removeClass("hidden");
		}
		else {
			$("#counsBoxDiv").addClass("hidden");
		}
	}

	// Update Tobacco Use 
	function fnUpdateTobaccoUse(btnElement, btnText) {
		var tobaccoUse = $("input[name='tobaccoScreen']:checked").val();
		if ( tobaccoUse == null ) {
			var userAlert = "<br><div class='alert alert-danger'>" +
  										"	<strong>Missing Information!</strong><br>" +
  										"	Please select patient tobacco use." +
											"	</div>"
			QMModalAlert.innerHTML = userAlert;
		}
		else {
			var chartNote = "Tobacco use (" + tobaccoUse + " User) was recorded."
			Mel.eval('{OBSNOW("TOBACCO USE", "' + tobaccoUse + '")}');
			// Check if counseling was provided. Record and document if so.
			var counsCheck = $("input[name='cessCounsBox']:checked").val();
			
			if (tobaccoUse == "Current" && counsCheck == "counseled") {
				Mel.eval('{OBSNOW("SMOK ADVICE", "yes")}');
				chartNote = chartNote + " Smoking cessation was recommended during this visit."
			}
			fnSetSuccessTd(btnElement, btnText, chartNote);
			fnCloseModal();
		}
	}

// Order Chlamydia testing
function fnOrderChlamydia(btnElement, btnText) {
	Mel.eval('{MEL_ADD_ORDER("T", "Laboratory", "Chlamydia trachomatis ONLY, (TMA)", "", "ICD10-Z00.00", "Routine gen medical exam at health care facility", "Urine", "", "N", USER.LOGINNAME, "")}');
	fnSetSuccessTd(btnElement, btnText, "Chlamydia test ordered");
}

// Add antidepressant adherance advice to chart note
function fnValidateAntidepressants(btnElement, btnText) {
	fnSetSuccessTd(btnElement, btnText, "Patient counseled on antidepressant medication adherance");
}


