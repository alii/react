yarn build react/index,react-dom/index,react-server-dom-bun
cd build/oss-stable/react-server-dom-bun
bun pm pack --filename tarball.tgz
$TARBALL=$(pwd)/tarball.tgz
echo $TARBALL
cd ~/code/bun/default/packages/bun-framework-react
bun remove react-server-dom-bun
bun add react-server-dom-bun@$TARBALL
cd ~/code/react