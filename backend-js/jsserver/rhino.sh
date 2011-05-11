#!/bin/bash
SDK_BIN="/home/derrell/ME/eclipse-workspace/App Inventor Gallery/backend-js/appengine-java-sdk-1.4.3/bin"
SDK_LIB="$SDK_BIN/../lib"
SDK_CONFIG="$SDK_BIN/../config/sdk"
JAR_FILE="$SDK_LIB/appengine-tools-api.jar:war/WEB-INF/lib/js.jar:war/WEB-INF/lib/qxoo.jar"

java -cp "$JAR_FILE" \
  org.mozilla.javascript.tools.shell.Main
