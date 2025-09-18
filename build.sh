# Build everything we need, explicitly including react-server bundles by name
yarn build react/index,react/jsx-dev-runtime,react/jsx-runtime,react.react-server,react-jsx-dev-runtime.react-server,react-jsx-runtime.react-server,react-dom/index,react-dom/client,react-dom/server.node,react-dom-server.node,react-dom-server-legacy.node,react-dom.react-server,react-server-dom-bun,scheduler/index

TARGET_DIR=/Users/ali/code/bun/default/packages/bun-framework-react/node_modules

rm -rf $TARGET_DIR/react
rm -rf $TARGET_DIR/react-dom
rm -rf $TARGET_DIR/react-server-dom-bun

cp -r build/oss-stable/react $TARGET_DIR/react
cp -r build/oss-stable/react-dom $TARGET_DIR/react-dom
cp -r build/oss-stable/react-server-dom-bun $TARGET_DIR/react-server-dom-bun

echo "Packages copied to $TARGET_DIR"
