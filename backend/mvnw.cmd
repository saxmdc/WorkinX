@REM ----------------------------------------------------------------------------
@REM Maven Wrapper startup batch script, version 3.3.2
@REM ----------------------------------------------------------------------------

@IF "%__MVNW_ARG0_NAME__%"=="" (SET "MVN_CMD=mvn.cmd") ELSE (SET "MVN_CMD=%__MVNW_ARG0_NAME__%")
@SET MAVEN_WRAPPER_JAR="%~dp0.mvn\wrapper\maven-wrapper.jar"
@SET MAVEN_WRAPPER_PROPERTIES="%~dp0.mvn\wrapper\maven-wrapper.properties"

@IF EXIST %MAVEN_WRAPPER_JAR% (
  @FOR /F "usebackq tokens=1,2 delims==" %%A IN (%MAVEN_WRAPPER_PROPERTIES%) DO (
    @IF "%%A"=="distributionUrl" SET DISTRIBUTION_URL=%%B
  )
)

@IF "%JAVA_HOME%"=="" (
  SET JAVA_EXE=java.exe
) ELSE (
  SET JAVA_EXE=%JAVA_HOME%\bin\java.exe
)

@"%JAVA_EXE%" -jar %MAVEN_WRAPPER_JAR% %*
