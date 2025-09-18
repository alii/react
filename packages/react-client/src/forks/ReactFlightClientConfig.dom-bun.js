/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

export {default as rendererVersion} from 'shared/ReactVersion';
export const rendererPackageName = 'react-server-dom-bun';

export * from 'react-client/src/ReactFlightClientStreamConfigWeb';
export * from 'react-client/src/ReactClientConsoleConfigPlain';
export * from 'react-server-dom-bun/src/client/ReactFlightClientConfigBundlerBun';
export * from 'react-dom-bindings/src/shared/ReactFlightClientConfigDOM';
export const usedWithSSR = true;

// Bun uses ES modules natively, so like ESM we don't need to prepare
// the destination for modules in the browser environment
export type ModuleLoading = null;

export function prepareDestinationForModuleImpl(
  moduleLoading: ModuleLoading,
  chunks: mixed,
  nonce: ?string,
) {
  // In Bun we don't need to prepare our destination since Bun handles ES modules natively
}
