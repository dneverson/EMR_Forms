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

// Order Chlamydia testing
function fnOrderChlamydia(btnElement, btnText) {
	Mel.eval('{MEL_ADD_ORDER("T", "Laboratory", "Chlamydia trachomatis ONLY, (TMA)", "", "ICD10-Z00.00", "Routine gen medical exam at health care facility", "Urine", "", "N", USER.LOGINNAME, "")}');
	fnSetSuccessTd(btnElement, btnText, "Chlamydia test ordered");
}

// Add pap smear advice to chart note
function fnValidateAntidepressants(btnElement, btnText) {
	fnSetSuccessTd(btnElement, btnText, "Patient counseled on antidepressant medication adherance");
}

