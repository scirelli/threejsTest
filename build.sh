#!/usr/bin/env bash
java -jar ./node_modules/google-closure-compiler-java/compiler.jar \
    --js_module_root './' \
    --js node_modules/three/build/three.module.js \
    --js node_modules/three/examples/jsm/loaders/TDSLoader.js \
    --js node_modules/three/examples/jsm/loaders/OBJLoader.js \
    --js js/**/*.js \
    --js js/*.js \
    --externs \
        compiler/externs/window-externs.js \
    --process_common_js_modules \
    --language_in=ECMASCRIPT_2019 \
    --language_out=ECMASCRIPT_2017 \
    --js_output_file ./build/main.cls.js \
    js/main.js
