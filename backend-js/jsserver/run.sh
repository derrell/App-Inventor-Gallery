#!/bin/bash
SDK_BIN="/home/derrell/ME/eclipse-workspace/App Inventor Gallery/backend-js/appengine-java-sdk-1.4.3/bin"
SDK_LIB="$SDK_BIN/../lib"
SDK_CONFIG="$SDK_BIN/../config/sdk"
JAR_FILE=""
JAR_FILE=${JAR_FILE}:"$SDK_LIB/appengine-tools-api.jar:"
JAR_FILE=${JAR_FILE}:"war/WEB-INF/lib/appengine-api.jar"
JAR_FILE=${JAR_FILE}:"war/WEB-INF/lib/appengine-api-labs.jar"
JAR_FILE=${JAR_FILE}:"war/WEB-INF/lib/appengine-jsr107cache.jar"
JAR_FILE=${JAR_FILE}:"war/WEB-INF/lib/qxoo.jar"
JAR_FILE=${JAR_FILE}:"war/WEB-INF/lib/servlet-api.jar"

java -ea -cp "$JAR_FILE" \
  com.google.appengine.tools.KickStart \
  com.google.appengine.tools.development.DevAppServerMain $*
