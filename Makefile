BUILD_PATH=./build
INSTALL_PATH=~/.local/share/gnome-shell/extensions
INSTALL_NAME=vpnswitcher@chichkinmikhail.gmail.com

install: rebuild
	cp -r ${BUILD_PATH} ${INSTALL_PATH}/${INSTALL_NAME}

reinstall: uninstall install
uninstall:
	rm -rf ${INSTALL_PATH}/${INSTALL_NAME}

build:
	mkdir -p ${BUILD_PATH}
	cp metadata.json ${BUILD_PATH}
	cp extension.js ${BUILD_PATH}
	cp convenience.js ${BUILD_PATH}
	cp prefs.js ${BUILD_PATH}
	cp stylesheet.css ${BUILD_PATH}
	cp -r handlers ${BUILD_PATH}
	cp -r schema ${BUILD_PATH}
	glib-compile-schemas ${BUILD_PATH}/schema

rebuild: clear build
clear:
	rm -rf ${BUILD_PATH}
