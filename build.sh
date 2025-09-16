yarn build react/index,react-dom/index,react-server-dom-bun

# pack react
cd build/oss-stable/react
bun pm pack --filename tarball-react.tgz
TARBALL_REACT=$(pwd)/tarball-react.tgz
echo $TARBALL_REACT

# pack react-dom
cd ../react-dom
bun pm pack --filename tarball-react-dom.tgz
TARBALL_REACT_DOM=$(pwd)/tarball-react-dom.tgz
echo $TARBALL_REACT_DOM

# pack react-server-dom-bun
cd ../react-server-dom-bun
bun pm pack --filename tarball-react-server-dom-bun.tgz
TARBALL_REACT_SERVER_DOM_BUN=$(pwd)/tarball-react-server-dom-bun.tgz
echo $TARBALL_REACT_SERVER_DOM_BUN

# update bun
cd ~/code/bun/default/packages/bun-framework-react
bun remove react react-dom react-server-dom-bun
bun add react@$TARBALL_REACT react-dom@$TARBALL_REACT_DOM react-server-dom-bun@$TARBALL_REACT_SERVER_DOM_BUN

cd ~/code/react
