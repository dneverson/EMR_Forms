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
function runQM() {
	fnGetGlobalVars();
	//fnGetPtInfo();

  //EvaluateMel("{ADD_TEXT_COMP('Enterprise\\Function Libraries', 'Utility')}")
	//EvaluateMel("{ADD_TEXT_COMP('Enterprise\\Function Libraries', 'Toolbox_SQL')}")
	//EvaluateMel("{ADD_TEXT_COMP('Enterprise\\Function Libraries', 'EMR_QualityMeasures')}")
	//EvaluateMel("{ADD_TEXT_COMP('Enterprise\\VMC\\Text_Components','QualityMeasures')}")

	fnRefreshMeasures();
};

function fnRefreshMeasures() {
	EvaluateMel("{defGblQMVars()}");
	EvaluateMel("{getImmunMeasures(ptAge, ptSex, chartDate)}");
	EvaluateMel("{getScreeningMeasures(ptAge, ptSex, chartDate)}");
	EvaluateMel("{getLabMeasures(ptAge, ptSex, chartDate)}");
	EvaluateMel("{getDiseaseMgmtMeasures(ptAge, ptSex, chartDate)}");
	fnGetMeasures("Immunizations", "immunMeasuresDiv");
	fnGetMeasures("Screenings", "screeningMeasuresDiv");
	fnGetMeasures("Labs", "labMeasuresDiv");
	fnGetMeasures("DiseaseMgmt", "diseaseMgmtMeasuresDiv");
}

function fnGetPtInfo() {
	var ptName = EvaluateMel("{Patient.FirstName}") + " " + EvaluateMel("{Patient.LastName}");
	var ptDOB = EvaluateMel("{Patient.DateOfBirth}");
	var ptPCP = EvaluateMel("{Patient.PCP}");

	ptNameSpan.innerHTML = ptName;
	ptDOBSpan.innerHTML = ptDOB;
	ptPCPSpan.innerHTML = ptPCP;
};

/************** MODAL ***************
* Sets modal variables and actions
/************************************/
function fnGetGlobalVars() {
	var QMModal = document.getElementById('QMModal'); // Modal
	var QMModalSpan = document.getElementsByClassName("close")[0]; // Span to close Modal
	var QMModalBtnRef;

	// When the user clicks on <span> (x), close the modal
	QMModalSpan.onclick = function() {fnCloseModal();};
};

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
	var upcoming = EvaluateMel("{gblUpcoming" + measure + "}");
	var overdue =  EvaluateMel("{gblOverdue" + measure + "}");
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
	var returnTest = "Test"

	if (tdClass != "") { tdClassText = ' class="' + tdClass + '"';}

	for (i = 0; i < measureArray.length; i++) {
		if (measureArray[i] != "") {
			returnHTML = returnHTML + '<tr>';
			itemArray = measureArray[i].split("^");
			returnTest = itemArray.length;
			for (j = 0; j < itemArray.length; j++) {
				// Action Button
				if (j == 3) {
					returnHTML = returnHTML + '<td class="text-center">';
					if (itemArray[j] != "") {
						if ( itemArray[j].search(";") < 0) {
							returnHTML = returnHTML + "<span class='bldGreenTxt'>" + itemArray[j] + "</span>";
							returnTest = itemArray[j];
						}
						else {
							buttonArray = itemArray[j].split(";")
							var btnOrderClass = buttonArray[0].replace(/\s/g, "");
							returnHTML = returnHTML + '<button class="btn btn-primary btn-xs ' + btnOrderClass + '" onclick="' + buttonArray[1] + '"';
							returnHTML = returnHTML + 'title="' + buttonArray[2] +  '">';
							returnHTML = returnHTML + buttonArray[0] + '</button>';
							returnTest = btnOrderClass;
						}
					}
					else {returnTest = "item array j = " + itemArray[j];}
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
	debugBox.innerHTML = returnTest;
	return returnHTML;
}

/********** ACTION BUTTONS **********
* The below functions are for the action buttons
/************************************/
// Change button appearance on success and write to chart note
function fnSetSuccessTd(btnElement, btnText, chartNote) {
	if (chartNote != "false"){
		EvaluateMel('{DOCUMENT.MeasuresChartNote = DOCUMENT.MeasuresChartNote + "   - ' + chartNote + '" + HRET}');
	}
	// Change the text for all other buttons with the same order ("Order LDL", "Order BMP", etc.)
	var buttonText = $(btnElement).text().replace(/\s/g, "");
	$("." + buttonText).each(function() {
    $(this).parent().addClass('bldGreenTxt');
    $(this).parent().html(btnText);
  });
}

// Order Mammogram
function fnOrderMammogram(btnElement, btnText) {
	EvaluateMel('{MEL_ADD_ORDER("T", "Mammogram", "Mammo: Screening Bilateral mammogram", "", "ICD10-Z12.31", "Screening mammogram NEC", "", "", "N", USER.LOGINNAME, "")}');
	fnSetSuccessTd(btnElement, btnText, "Mammogram ordered");
}

// Sent Colonoscopy request to Referral Specialist
function fnRequestColonoscopy(btnElement, btnText) {
	EvaluateMel('{MEL_SEND_FLAG("Flag", "referralgeneric", "N", str(._todaysdate),"Surgery Referral", "Patient needs colonoscopy screening.", "Orders")}');
	EvaluateMel('{MEL_SEND_FLAG("Flag", "referralgeneric", "N", str(ADDDATES(str(._TODAYSDATE),"0","0","60")),"    Follow Up - Surgery Referral ", "Follow Up - Patient needs colonoscopy screening.", "Orders")}');
	fnSetSuccessTd(btnElement, btnText, "Request sent to Referral Specialist to schedule a colonoscopy screening appointment");
}

// Record Cessation Counseling
function fnRecordCessationCounseling(btnElement, btnText) {
	EvaluateMel('{OBSNOW("SMOK ADVICE", "yes")}');
	fnSetSuccessTd(btnElement, btnText, "Smoking cessation was recommended during this visit");
}

// Order BMP (Basic Metabolic Panel)
function fnOrderBMP(btnElement, btnText) {
	EvaluateMel('{MEL_ADD_ORDER("T", "Laboratory", "Basic Metabolic Panel", "", "ICD10-Z00.00", "Routine gen medical exam at health care facility", "", "", "N", USER.LOGINNAME, "")}');
	fnSetSuccessTd(btnElement, btnText, "Basic Metabolic Panel (BMP) ordered");
}

// Order Digoxin Assay
function fnOrderDigoxin(btnElement, btnText) {
	EvaluateMel('{MEL_ADD_ORDER("T", "Laboratory", "Digoxin", "", "ICD10-Z00.00", "Routine gen medical exam at health care facility", "", "", "N", USER.LOGINNAME, "")}');
	fnSetSuccessTd(btnElement, btnText, "Dixogin Assay ordered");
}

// Order LDL
function fnOrderLDL(btnElement, btnText) {
	EvaluateMel('{MEL_ADD_ORDER("T", "Laboratory", "LDL Cholesterol (Direct)", "", "ICD10-Z00.00", "Routine gen medical exam at health care facility", "", "", "N", USER.LOGINNAME, "")}');
	fnSetSuccessTd(btnElement, btnText, "LDL Cholesterol lab test ordered");
}

// Order Hemoglobin A1C (HgbA1c)
function fnOrderHgbA1c(btnElement, btnText) {
	EvaluateMel('{MEL_ADD_ORDER("T", "Laboratory", "Hemoglobin A1C", "", "ICD10-Z00.00", "Routine gen medical exam at health care facility", "", "", "N", USER.LOGINNAME, "")}');
	fnSetSuccessTd(btnElement, btnText, "Hemoglobin A1C (HgbA1c) lab test ordered");
}

// Order Hemoglobin A1C (HgbA1c) and LDL
function fnOrderHgbA1cLDL(btnElement, btnText) {
	EvaluateMel('{MEL_ADD_ORDER("T", "Laboratory", "Hemoglobin A1C", "", "ICD10-Z00.00", "Routine gen medical exam at health care facility", "", "", "N", USER.LOGINNAME, "")}');
	EvaluateMel('{MEL_ADD_ORDER("T", "Laboratory", "LDL Cholesterol (Direct)", "", "ICD10-Z00.00", "Routine gen medical exam at health care facility", "", "", "N", USER.LOGINNAME, "")}');
	fnSetSuccessTd(btnElement, btnText, "Hemoglobin A1C (HgbA1c) and LDL lab tests ordered");
}

// Add pap smear advice to chart note
function fnPapSmear(btnElement, btnText) {
	// Set global variable to avoid pap being advised multiple times in one visit
	EvaluateMel('{PapAdvised = "TRUE"}');
	fnSetSuccessTd(btnElement, btnText, "Patient advised that pap smear is due");
}

// *** TOBACCO SCREENING SECTION *** \\
	// Tobacco Screening
	function fnTobaccoScreening(btnElement, btnText) {
		// Check most recent tobacco use obs term to grab which radio (if any) should be defaulted
		var currentUse = "";
		var formerUse = "";
		var neverUse = "";
		var tobaccoObsTerm = EvaluateMel('{fnUtilityGetMostRecentObsName(ARRAY("SMOK STATUS","TOBACCO USE","SMOKES","ORALTOBACUSE"))}');
		var tobaccoUsePrev = EvaluateMel('{LASTOBSVALUEDATE("' + tobaccoObsTerm + '")}');
		var tobaccoUse = EvaluateMel('{OBSPREV("' + tobaccoObsTerm + '")}');
		if (tobaccoUse == "") {
			tobaccoUse = "None recorded";
		}
		else {
			var tobacUseStr = tobaccoUse.toLowerCase()
			if (tobacUseStr.match(/former/g)) {
    		formerUse = " checked";
			}
			if (tobacUseStr.match(/no|never|false/g)) {
    		neverUse = " checked";
			}
			if (tobacUseStr.match(/yes|current|true/g)) {
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
										"	<div><strong>Previous Use: </strong>" + tobaccoUsePrev + " (" + tobaccoObsTerm + ")</div>" +
										"	<div class='radio'><label><input type='radio' name='tobaccoScreen' value='Current' " + currentUse + " onclick='fnDisplayCounsBox(\"Current\")'> Current</label></div>" +
										"	<div class='radio'><label><input type='radio' name='tobaccoScreen' value='Former' " + formerUse + " onclick='fnDisplayCounsBox(\"Former\")'> Former</label></div>" +
										"	<div class='radio'><label><input type='radio' name='tobaccoScreen' value='Never' " + neverUse + " onclick='fnDisplayCounsBox(\"Never\")'> Never</label></div>" +
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
			EvaluateMel('{OBSNOW("TOBACCO USE", "' + tobaccoUse + '")}');
			// Check if counseling was provided. Record and document if so.
			var counsCheck = $("input[name='cessCounsBox']:checked").val();

			if (tobaccoUse == "Current" && counsCheck == "counseled") {
				EvaluateMel('{OBSNOW("SMOK ADVICE", "yes")}');
				chartNote = chartNote + " Smoking cessation was recommended during this visit."
			}
			fnSetSuccessTd(btnElement, btnText, chartNote);
			fnCloseModal();
		}
	}

// Order Chlamydia testing
function fnOrderChlamydia(btnElement, btnText) {
	EvaluateMel('{MEL_ADD_ORDER("T", "Laboratory", "Chlamydia trachomatis ONLY, (TMA)", "", "ICD10-Z00.00", "Routine gen medical exam at health care facility", "Urine", "", "N", USER.LOGINNAME, "")}');
	fnSetSuccessTd(btnElement, btnText, "Chlamydia test ordered");
}

// Add antidepressant adherance advice to chart note
function fnValidateAntidepressants(btnElement, btnText) {
	// Set global variable to avoid medication adherence being advised multiple times in one visit
	EvaluateMel('{MedAdhere = "TRUE"}');
	fnSetSuccessTd(btnElement, btnText, "Patient counseled on antidepressant medication adherance");
}

// Add PHQ9 Screening Form
function fnAddPHQ9(btnElement, btnText) {
	EvaluateMel('{ADD_FORM_COMP("Enterprise\\VMC\\Behavioral Health", "PHQ-9 Depression", "AFTER_CURRENT", "OPEN", "")}');
	fnSetSuccessTd(btnElement, btnText, "false");
}

// Order Urine Protein screening
function fnOrderUrineProtein(btnElement, btnText) {
	EvaluateMel('{MEL_ADD_ORDER("T", "Laboratory", "Microalbumin", "", "ICD10-Z00.00", "Routine gen medical exam at health care facility", "Urine", "", "N", USER.LOGINNAME, "")}');
	fnSetSuccessTd(btnElement, btnText, "Urine Protein screening ordered");
}

// Record Diabetic Eye Exam provided and education given
function fnOrderDBEyeExam(btnElement, btnText) {
  // Add observation term
  EvaluateMel('{DOCUMENT.DIAB_EYE_EX_NOTE = "A diabetic retinal eye exam is recommended for this patient and has been ordered."}');
  // Check "Modifier 25" checkbox on A/P form
  EvaluateMel('{DOCUMENT.MODIFIER_25 = "25"}');
	fnSetSuccessTd(btnElement, btnText, "Diabetic retinal eye exam was recommended and has been ordered for this patient.");
}