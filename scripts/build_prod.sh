#!/bin/sh

if  test ! -z "$BUILD_BRANCH" && test -f /.dockerenv
then
	echo "Changing path to /"
	cd /
	echo "Deleting /app"
	rm -rf /app
	echo "Cloning $BUILD_BRANCH into /app"
	git clone --single-branch --branch "$BUILD_BRANCH" https://github.com/big-neon/bn-web.git /app
	echo "Changing path to /app"
	cd /app
fi
npm install --production
npm install --only=dev
npm run build
if test ! -z "$BUILD_OUTPUT"
then
	mv build "$BUILD_OUTPUT"
fi
