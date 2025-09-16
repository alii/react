yarn build react/index,react/jsx-dev-runtime,react/jsx-runtime,react-dom/index,react-dom/client,react-dom/server.node,react-server-dom-bun --type=NODE,NODE_REACT_SERVER

TARGET_DIR=/Users/ali/code/bun/default/packages/bun-framework-react/node_modules

rm -rf $TARGET_DIR/react
rm -rf $TARGET_DIR/react-dom
rm -rf $TARGET_DIR/react-server-dom-bun

cp -r build/oss-stable/react $TARGET_DIR/react
cp -r build/oss-stable/react-dom $TARGET_DIR/react-dom
cp -r build/oss-stable/react-server-dom-bun $TARGET_DIR/react-server-dom-bun

echo "Packages copied to $TARGET_DIR"
