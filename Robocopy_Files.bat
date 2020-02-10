@echo off

SET CG=A
SET CB=B
SET CR=C
SET CP=D
SET CY=E
SET CW=F

SET MASTER1="\\hygieia\IS\_IS\HtmlLibraries"
SET MASTER2="\\hygieia\IS\_IS\HtmlForms"
SET DEMO1="\\npcps02\c$\Program Files\Centricity Practice Solution\jboss\standalone\deployments\npcentricityps.ear\CentricityPracticeWS.war\EncounterForms\HtmlLibraries"
SET LIVE1="\\cps-app1\c$\Program Files\Centricity Practice Solution\jboss\standalone\deployments\centricityps.ear\CentricityPracticeWS.war\EncounterForms\HtmlLibraries"
SET DEMO2="\\npcps02\c$\Program Files\Centricity Practice Solution\jboss\standalone\deployments\npcentricityps.ear\CentricityPracticeWS.war\EncounterForms\HtmlForms"
SET LIVE2="\\cps-app1\c$\Program Files\Centricity Practice Solution\jboss\standalone\deployments\centricityps.ear\CentricityPracticeWS.war\EncounterForms\HtmlForms"

SET DEMO3="\\npcps02\c$\Program Files\Centricity Practice Solution\jboss\standalone\deployments\cmgcentricityps.ear\CentricityPracticeWS.war\EncounterForms\HtmlLibraries"
SET DEMO4="\\npcps02\c$\Program Files\Centricity Practice Solution\jboss\standalone\deployments\cmgcentricityps.ear\CentricityPracticeWS.war\EncounterForms\HtmlForms"

SET DEMO5="\\cps-cmgapp1\c$\Program Files\Centricity Practice Solution\jboss\standalone\deployments\cmgcentricityps.ear\CentricityPracticeWS.war\EncounterForms\HtmlLibraries"
SET DEMO6="\\cps-cmgapp1\c$\Program Files\Centricity Practice Solution\jboss\standalone\deployments\cmgcentricityps.ear\CentricityPracticeWS.war\EncounterForms\HtmlForms"


SET TMPTIME=%TIME:~0,1%
IF "%TMPTIME%"==" " (
	SET TIMESTAMP=%DATE:~4,2%%DATE:~7,2%%DATE:~-4%0%TIME:~1,1%%TIME:~3,2%%TIME:~6,2%
) ELSE (
	SET TIMESTAMP=%DATE:~4,2%%DATE:~7,2%%DATE:~-4%%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%
)

:MENU
cls
TITLE Robocopy HTML Libraries [%date%]
color %CB%
@echo.
@echo				            `...`
@echo				        :sdMMMMMMMmy:
@echo				      `dMMMMMMMMMMMMMd`
@echo				      hMMMMMMhyhNMMMMMh     ..
@echo				      MMMMMM-   .MMMMMM     oMh:
@echo				      MMMMMM`    MMMMMM`    oMMMm+`
@echo				      MMMMMM`    -osyys     :yyssNNs.
@echo				      MMMMMM`                    yMMMh-
@echo				      MMMMMM`                    yMMNs.
@echo				      MMMMMM`    :ydddd`    /ddddNm+`
@echo				      MMMMMM`    MMMMMM`    oMMMh:
@echo				      MMMMMM:   -MMMMMM     oNs.
@echo				      hMMMMMMdhdMMMMMMy     ``
@echo				      `yMMMMMMMMMMMMMh`
@echo				        .ohNMMMMMNdo-
@echo				             ```
@echo.
@echo.
@echo			Select an Option
@echo.
@echo		 	[1] - Upload HtmlLibraries to Demo
@echo			[2] - Upload HtmlLibraries to Live
@echo		 	[3] - Upload HtmlForms to Demo
@echo			[4] - Upload HtmlForms to Live
@echo			---------------------------------------
@echo			[5] - Upload HtmlLibraries to NP CMG
@echo			[6] - Upload HtmlForms     to NP CMG
@echo			---------------------------------------
@echo			[7] - Upload HtmlLibraries to Prod CMG
@echo			[8] - Upload HtmlForms     to Prod CMG
@echo			---------------------------------------
@echo			[9] - Exit
@echo.

SET /p CHOICE= ".		Select an Option: "
IF "%CHOICE%"=="1" (
	SET SOURCE=%MASTER1%
	SET DESTIN=%DEMO1%
) ELSE (
	IF "%CHOICE%"=="2" (
		SET SOURCE=%MASTER1%
		SET DESTIN=%LIVE1%
	) ELSE (
		IF "%CHOICE%"=="3" (
			SET SOURCE=%MASTER2%
			SET DESTIN=%DEMO2%
		) ELSE (
			IF "%CHOICE%"=="4" (
				SET SOURCE=%MASTER2%
				SET DESTIN=%LIVE2%
			) ELSE (
				IF "%CHOICE%"=="5" (
				  SET SOURCE=%MASTER1%
				  SET DESTIN=%DEMO3%
				) ELSE (
					IF "%CHOICE%"=="6" (
						SET SOURCE=%MASTER2%
						SET DESTIN=%DEMO4%
					) ELSE (
						IF "%CHOICE%"=="7" (
							SET SOURCE=%MASTER1%
							SET DESTIN=%DEMO5%
						) ELSE (
						  IF "%CHOICE%"=="8" (
								SET SOURCE=%MASTER2%
								SET DESTIN=%DEMO6%
							) ELSE (
								IF "%CHOICE%"=="9" (
									EXIT
								) ELSE ( GOTO MENU)
))))))))

@echo.
@echo.
SET /p CHOICE2= ".		Start file transfers? (y/n) or exit: "
IF "%CHOICE2%"=="y" ( GOTO MAIN )
IF "%CHOICE2%"=="Y" ( GOTO MAIN )
IF "%CHOICE2%"=="" ( GOTO MAIN )
IF "%CHOICE2%"=="exit" ( EXIT ) ELSE ( GOTO MENU )



:MAIN
cls
color %CY%
@echo.
@echo 	***************************************************************************
@echo 	**** COPYING FILES FROM %SOURCE% TO SERVERS   ****
@echo 	***************************************************************************
@echo.
@echo 	Please Wait...
SET STARTTIME=%time%
"c:\Program Files\7-Zip\7z.exe" a %SOURCE%"\_Ignore\_backups\"%TIMESTAMP%".zip" %SOURCE% "-xr!_Ignore" "-xr!Robocopy_Files.bat" "-xr!Robocopy_log.txt">nul
ROBOCOPY %SOURCE% %DESTIN% /E /MT /W:5 /DCOPY:T /Z /MIR /log:Robocopy_log.txt /XF "Robocopy_log.txt" "Robocopy_Files.bat" /XD "_Ignore">nul
rem ROBOCOPY %MASTER1% %LIVE1% /E /MT /W:5 /DCOPY:T /Z /MIR /log+:Robocopy_log.txt /XF "Robocopy_log.txt" "Robocopy_Files.bat">nul
SET ENDTIME=%time%


:CALCTIMEDIFF
for /F "tokens=1-4 delims=:.," %%a in ("%STARTTIME%") do (
	 set /A "start=(((%%a*60)+1%%b %% 100)*60+1%%c %% 100)*100+1%%d %% 100"
)
for /F "tokens=1-4 delims=:.," %%a in ("%ENDTIME%") do (
	 set /A "end=(((%%a*60)+1%%b %% 100)*60+1%%c %% 100)*100+1%%d %% 100"
)
set /A elapsed=end-start
set /A hh=elapsed/(60*60*100), rest=elapsed%%(60*60*100), mm=rest/(60*100), rest%%=60*100, ss=rest/100, cc=rest%%100
if %hh% lss 10 set hh=0%hh%
if %mm% lss 10 set mm=0%mm%
if %ss% lss 10 set ss=0%ss%
if %cc% lss 10 set cc=0%cc%
set DURATION=%hh%:%mm%:%ss%,%cc%


:COMPLETE
cls
@echo.
color %CG%
@echo 			**************************************
@echo 			**** UPLOAD COMPLETED TO SERVER! ****
@echo 			**************************************
@echo.
@echo 			From: %SOURCE% %TIMESTAMP%
@echo 			To:   %DESTIN%
@echo.
@echo 			Started: %date% %STARTTIME%
@echo 			Ended:   %date% %ENDTIME%
@echo 			Total Time Spent: %DURATION%
@echo.
@echo 			Note: For more information open Robocopy_log.txt
@echo.
@echo.
rem START notepad "Robocopy_log.txt"
SET /p CHOICE3= ".			Do Another File Transfer? (y/n): "
IF "%CHOICE3%"=="y" ( GOTO MENU )
IF "%CHOICE3%"=="Y" ( GOTO MENU ) 
IF "%CHOICE3%"==""  ( GOTO MENU ) ELSE ( EXIT )
