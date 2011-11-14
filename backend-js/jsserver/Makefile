AR=jar
ARFLAGS=uf

# We don't pre-calculate this. Instead, we re-calculate it at each compilation
# so that recently-added libs are discovered.
#
#lib := $(shell find war/WEB-INF/lib -name '*.jar' -print0 | tr '\0' ':')

classes := war/WEB-INF/classes

classpath := "${classes}"

http_servlet := -extends javax.servlet.http.HttpServlet


include Makefile.paths

qxoo_jar := war/WEB-INF/lib/qxoo.jar

qxoo_classes :=							\
	qxoo_classes/qx/Bootstrap.class				\
	qxoo_classes/qx/core/Environment.class			\
	qxoo_classes/qx/bom/client/OperatingSystem.class	\
	qxoo_classes/qx/bom/client/Locale.class			\
	qxoo_classes/qx/bom/client/Html.class			\
	qxoo_classes/qx/bom/client/Transport.class		\
	qxoo_classes/qx/bom/client/Plugin.class			\
	qxoo_classes/qx/bom/client/Engine.class			\
	qxoo_classes/qx/bom/client/Browser.class		\
	qxoo_classes/qx/bom/client/Css.class			\
	qxoo_classes/qx/bom/client/PhoneGap.class		\
	qxoo_classes/qx/bom/client/Flash.class			\
	qxoo_classes/qx/bom/client/EcmaScript.class		\
	qxoo_classes/qx/bom/client/Device.class			\
	qxoo_classes/qx/bom/client/Event.class			\
	qxoo_classes/qx/bom/client/Runtime.class		\
	qxoo_classes/qx/bom/client/Json.class			\
	qxoo_classes/qx/core/Environment.class			\
	qxoo_classes/qx/Mixin.class				\
	qxoo_classes/qx/Interface.class				\
	qxoo_classes/qx/lang/Core.class				\
	qxoo_classes/qx/core/Property.class			\
	qxoo_classes/qx/Class.class				\
	qxoo_classes/qx/dev/StackTrace.class			\
	qxoo_classes/qx/lang/Array.class			\
	qxoo_classes/qx/core/Aspect.class			\
	qxoo_classes/qx/data/MBinding.class			\
	qxoo_classes/qx/core/ObjectRegistry.class		\
	qxoo_classes/qx/dom/Node.class				\
	qxoo_classes/qx/lang/Function.class			\
	qxoo_classes/qx/bom/Event.class				\
	qxoo_classes/qx/event/Manager.class			\
	qxoo_classes/qx/event/Registration.class		\
	qxoo_classes/qx/lang/String.class			\
	qxoo_classes/qx/lang/RingBuffer.class			\
	qxoo_classes/qx/log/appender/RingBuffer.class		\
	qxoo_classes/qx/log/Logger.class			\
	qxoo_classes/qx/core/Assert.class			\
	qxoo_classes/qx/core/MAssert.class			\
	qxoo_classes/qx/core/MEvents.class			\
	qxoo_classes/qx/core/MLogging.class			\
	qxoo_classes/qx/core/MProperty.class			\
	qxoo_classes/qx/core/Object.class			\
	qxoo_classes/qx/event/type/Event.class			\
	qxoo_classes/qx/event/type/Data.class			\
	qxoo_classes/qx/data/SingleValueBinding.class		\
	qxoo_classes/qx/data/IListData.class			\
	qxoo_classes/qx/type/BaseError.class			\
	qxoo_classes/qx/core/AssertionError.class		\
	qxoo_classes/qx/core/ValidationError.class		\
	qxoo_classes/qx/lang/Type.class				\
	qxoo_classes/qx/event/IEventHandler.class		\
	qxoo_classes/qx/util/ObjectPool.class			\
	qxoo_classes/qx/event/Pool.class			\
	qxoo_classes/qx/util/DisposeUtil.class			\
	qxoo_classes/qx/event/IEventDispatcher.class		\
	qxoo_classes/qx/event/dispatch/Direct.class		\
	qxoo_classes/qx/event/handler/Object.class		\
	qxoo_classes/qx/lang/Date.class				\
	qxoo_classes/qx/lang/Generics.class			\
	qxoo_classes/qx/lang/JsonImpl.class			\
	qxoo_classes/qx/lang/Json.class				\
	qxoo_classes/qx/lang/Object.class			\
	qxoo_classes/qx/io/remote/RpcError.class		\
	qxoo_classes/qx/util/Base64.class			\
	qxoo_classes/qx/util/Serializer.class

# not yet
# 	qxoo_classes/qx/dev/DebugObject.class


app_classes :=							\
	qxoo_classes/aiagallery/dbif/Entity.class		\
	qxoo_classes/aiagallery/dbif/MApps.class		\
	qxoo_classes/aiagallery/dbif/MComments.class		\
	qxoo_classes/aiagallery/dbif/MDbifCommon.class		\
	qxoo_classes/aiagallery/dbif/MFlags.class		\
	qxoo_classes/aiagallery/dbif/MLiking.class		\
	qxoo_classes/aiagallery/dbif/MMobile.class		\
	qxoo_classes/aiagallery/dbif/MSearch.class		\
	qxoo_classes/aiagallery/dbif/MTags.class		\
	qxoo_classes/aiagallery/dbif/MVisitors.class		\
	qxoo_classes/aiagallery/dbif/MWhoAmI.class		\
	qxoo_classes/aiagallery/dbif/ObjAppData.class		\
	qxoo_classes/aiagallery/dbif/ObjComments.class		\
	qxoo_classes/aiagallery/dbif/ObjDownloads.class		\
	qxoo_classes/aiagallery/dbif/ObjFlags.class		\
	qxoo_classes/aiagallery/dbif/ObjLikes.class		\
	qxoo_classes/aiagallery/dbif/ObjPermissionGroup.class	\
	qxoo_classes/aiagallery/dbif/ObjSearch.class		\
	qxoo_classes/aiagallery/dbif/ObjTags.class		\
	qxoo_classes/aiagallery/dbif/ObjVisitors.class		\
	qxoo_classes/aiagallery/dbif/Constants.class		\
	qxoo_classes/aiagallery/dbif/DbifAppEngine.class	\
	qxoo_classes/aiagallery/dbif/Decoder64.class		\
								\
	qxoo_classes/aiagallery/dbif/MSimData.class


rpcjs_classes :=					\
	qxoo_classes/rpcjs/AbstractRpcHandler.class	\
	qxoo_classes/rpcjs/appengine/Rpc.class		\
	qxoo_classes/rpcjs/rpc/Server.class		\
	qxoo_classes/rpcjs/rpc/error/Error.class	\
	qxoo_classes/rpcjs/dbif/Entity.class		\
	qxoo_classes/rpcjs/sim/Dbif.class		\
	qxoo_classes/rpcjs/appengine/Dbif.class

server_classes :=				\
	qxoo_classes/main/Loader.class		\
	qxoo_classes/main/Window.class		\
	qxoo_classes/main/GuiServlet.class	\
	qxoo_classes/main/RpcServlet.class


all: $(qxoo_classes) $(app_classes) $(rpcjs_classes) $(server_classes)
	cd qxoo_classes && jar -cf ../$(qxoo_jar)			\
	  $(shell echo $(qxoo_classes) | sed -e s,qxoo_classes/,,g)	\
	  $(shell echo $(app_classes) | sed -e s,qxoo_classes/,,g)	\
	  $(shell echo $(rpcjs_classes) | sed -e s,qxoo_classes/,,g)	\
	  $(shell echo $(server_classes) | sed -e s,qxoo_classes/,,g)	\
	  $(shell echo $(qxoo_classes) |				\
		sed -e s,qxoo_classes/,,g -e 's,\.class,1.class,g')	\
	  $(shell echo $(app_classes) |					\
		sed -e s,qxoo_classes/,,g -e 's,\.class,1.class,g')	\
	  $(shell echo $(rpcjs_classes) |				\
		sed -e s,qxoo_classes/,,g -e 's,\.class,1.class,g')	\
	  $(shell echo $(server_classes) |				\
		sed -e s,qxoo_classes/,,g -e 's,\.class,1.class,g')

qxoo_classes/%.class : $(qxroot)/%.js
	echo 'window = Packages.main.Window().get(); '			\
		'navigator = window.navigator; '			\
		'qx = window.qx;'					\
		'qxvariants = window.qxvariants;'			\
		'aiagallery = window.aiagallery;'			\
		'rpcjs = window.rpcjs;'					\
			| cat - $< > /tmp/$(notdir $<)
	java -classpath							   \
	  "$(classpath):$(shell find war/WEB-INF/lib			   \
			    -name '*.jar' -print0 | tr '\0' ':')"	   \
	  org.mozilla.javascript.tools.jsc.Main				   \
	  -extends java.lang.Object					   \
	  -d qxoo_classes						   \
	  -package $(basename $(shell echo $< |				   \
			sed -e s,$(qxroot)/,, -e 's,\.js,,' -e 's,/,.,g')) \
	  /tmp/$(notdir $<)
	  rm -f /tmp/$(notdir $<)

qxoo_classes/%.class : $(app)/%.js
	echo 'window = Packages.main.Window().get(); '			\
		'navigator = window.navigator; '			\
		'qx = window.qx;'					\
		'qxvariants = window.qxvariants;'			\
		'aiagallery = window.aiagallery;'			\
		'rpcjs = window.rpcjs;'					\
			| cat - $< > /tmp/$(notdir $<)
	java -classpath							   \
	  "$(classpath):$(shell find war/WEB-INF/lib			   \
			    -name '*.jar' -print0 | tr '\0' ':')"	   \
	  org.mozilla.javascript.tools.jsc.Main				   \
	  -extends java.lang.Object					   \
	  -d qxoo_classes						   \
	  -package $(basename $(shell echo $< |				   \
			sed -e s,$(app)/,, -e 's,\.js,,' -e 's,/,.,g')) \
	  /tmp/$(notdir $<)
	  rm -f /tmp/$(notdir $<)

qxoo_classes/%.class : $(rpcjs)/%.js
	echo 'window = Packages.main.Window().get(); '			\
		'navigator = window.navigator; '			\
		'qx = window.qx;'					\
		'qxvariants = window.qxvariants;'			\
		'aiagallery = window.aiagallery;'			\
		'rpcjs = window.rpcjs;'					\
			| cat - $< > /tmp/$(notdir $<)
	java -classpath							   \
	  "$(classpath):$(shell find war/WEB-INF/lib			   \
			    -name '*.jar' -print0 | tr '\0' ':')"	   \
	  org.mozilla.javascript.tools.jsc.Main				   \
	  -extends java.lang.Object					   \
	  -d qxoo_classes						   \
	  -package $(basename $(shell echo $< |				   \
			sed -e s,$(rpcjs)/,, -e 's,\.js,,' -e 's,/,.,g')) \
	  /tmp/$(notdir $<)
	  rm -f /tmp/$(notdir $<)

qxoo_classes/%.class : src/%.js
	echo 'window = Packages.main.Window().get(); '			\
		'navigator = window.navigator; '			\
		'qx = window.qx;'					\
		'qxvariants = window.qxvariants;'			\
		'aiagallery = window.aiagallery;'			\
		'rpcjs = window.rpcjs;'					\
			| cat - $< > /tmp/$(notdir $<)
	java -classpath							\
	  "$(classpath):$(shell find war/WEB-INF/lib			\
			    -name '*.jar' -print0 | tr '\0' ':')"	\
	  org.mozilla.javascript.tools.jsc.Main				\
	  -extends java.lang.Object					\
	  -d qxoo_classes						\
	  -package $(basename $(shell echo $< |				\
			sed -e s,src/,, -e 's,\.js,,' -e 's,/,.,g'))	\
	  /tmp/$(notdir $<)
	  rm -f /tmp/$(notdir $<)

qxoo_classes/main/RpcServlet.class : src/main/RpcServlet.js
	echo 'window = Packages.main.Window().get(); '			\
		'navigator = window.navigator; '			\
		'qx = window.qx;'					\
		'qxvariants = window.qxvariants;'			\
		'aiagallery = window.aiagallery;'			\
		'rpcjs = window.rpcjs;'					\
			| cat - $< > /tmp/$(notdir $<)
	java -classpath							\
	  "$(classpath):$(shell find war/WEB-INF/lib			\
			    -name '*.jar' -print0 | tr '\0' ':')"	\
	  org.mozilla.javascript.tools.jsc.Main				\
	  -extends javax.servlet.http.HttpServlet			\
	  -d qxoo_classes						\
	  -package $(basename $(shell echo $< |				\
			sed -e s,src/,, -e 's,\.js,,' -e 's,/,.,g'))	\
	  /tmp/$(notdir $<)
	  rm -f /tmp/$(notdir $<)

qxoo_classes/main/GuiServlet.class : src/main/GuiServlet.js
	echo 'window = Packages.main.Window().get(); '			\
		'navigator = window.navigator; '			\
		'qx = window.qx;'					\
		'qxvariants = window.qxvariants;'			\
		'aiagallery = window.aiagallery;'			\
		'rpcjs = window.rpcjs;'					\
			| cat - $< > /tmp/$(notdir $<)
	java -classpath							\
	  "$(classpath):$(shell find war/WEB-INF/lib			\
			    -name '*.jar' -print0 | tr '\0' ':')"	\
	  org.mozilla.javascript.tools.jsc.Main				\
	  -extends javax.servlet.http.HttpServlet			\
	  -d qxoo_classes						\
	  -package $(basename $(shell echo $< |				\
			sed -e s,src/,, -e 's,\.js,,' -e 's,/,.,g'))	\
	  /tmp/$(notdir $<)
	  rm -f /tmp/$(notdir $<)

# Window does not call its own get()
qxoo_classes/main/Window.class : src/main/Window.js
	java -classpath							\
	  "$(classpath):$(shell find war/WEB-INF/lib			\
			    -name '*.jar' -print0 | tr '\0' ':')"	\
	  org.mozilla.javascript.tools.jsc.Main				\
	  -extends java.lang.Object					\
	  -d qxoo_classes						\
	  -package $(basename $(shell echo $< |				\
			sed -e s,src/,, -e 's,\.js,,' -e 's,/,.,g'))	\
	  $<

$(classes)/GuestbookServlet.class: src/guestbook/GuestbookServlet.java
	javac -classpath "$(classpath)" src/guestbook/GuestbookServlet.java
	mv src/guestbook/GuestbookServlet.class $(classes)/GuestbookServlet.class


.PHONY: clean
clean:
	find qxoo_classes -name '*.class' -exec rm {} \;
	rm -f $(qxoo_jar)

.PHONY: create_qxoo.jar
create_qxoo.jar:
	touch $(qxoo_jar)

.PHONY: appserver
appserver :
	java -ea -cp ${classpath} \
	  com.google.appengine.tools.KickStart \
	  com.google.appengine.tools.development.DevAppServerMain \
	  --port=8080 war

.PHONY: upload
upload :	all
	../appengine-java-sdk-1.5.0.1/bin/appcfg.sh update war
