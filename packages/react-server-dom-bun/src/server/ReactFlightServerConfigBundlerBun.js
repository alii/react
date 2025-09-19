/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {ReactClientValue} from 'react-server/src/ReactFlightServer';

import type {
  ClientReference,
  ServerReference,
} from '../ReactFlightBunReferences';

export type {ClientReference, ServerReference};

// Bun uses composite keys like "module#export" for the manifest
export type ClientManifest = {
  [compositeKey: string]: {
    id: string,
    name: string,
    chunks: Array<string>,
  },
};

export type ServerReferenceId = string;

// Simple tuple format like ESM: [modulePath, exportName, async?]
export type ClientReferenceMetadata = [
  string, // module path
  string, // export name
  boolean, // async
];

export type ClientReferenceKey = string;

export {
  isClientReference,
  isServerReference,
} from '../ReactFlightBunReferences';

export function getClientReferenceKey(
  reference: ClientReference<any>,
): ClientReferenceKey {
  return reference.$$id;
}

export function resolveClientReferenceMetadata<T>(
  config: ClientManifest,
  clientReference: ClientReference<T>,
): ClientReferenceMetadata {
  const id = clientReference.$$id;
  const idx = id.lastIndexOf('#');
  const exportName = id.slice(idx + 1);

  // Look up the composite key in the manifest
  const entry = config[id];
  const modulePath = entry ? entry.id : id.slice(0, idx);

  return [modulePath, exportName, clientReference.$$async === true];
}

export function getServerReferenceId<T>(
  config: ClientManifest,
  serverReference: ServerReference<T>,
): ServerReferenceId {
  return serverReference.$$id;
}

export function getServerReferenceBoundArguments<T>(
  config: ClientManifest,
  serverReference: ServerReference<T>,
): null | Array<ReactClientValue> {
  return serverReference.$$bound;
}

export function getServerReferenceLocation<T>(
  config: ClientManifest,
  serverReference: ServerReference<T>,
): void | Error {
  return serverReference.$$location;
}

export type SSRModuleMap = null | {
  [clientId: string]: {
    [clientExportName: string]: ClientReferenceMetadata,
  },
};

export type ServerManifest = mixed;

export type Hints = null;

export type HintCode = string;
export type HintModel = null;

export function dispatchHint<Code: HintCode>(
  code: Code,
  model: HintModel,
): void {
  // Hints are not supported in Bun yet
}

export function preinitScripts() {
  // Not needed for Bun
}

export function preinitStyle(
  href: string,
  precedence: ?string,
  options?: ?{crossOrigin?: ?string},
) {
  // Not needed for Bun
}

export function preinitModuleForSSR(
  href: string,
  nonce: ?string,
  crossOrigin: ?string,
) {
  // Not needed for Bun
}

export function getClientManifest(): ClientManifest {
  return {};
}

export function prepareHostDispatcher(): mixed {
  // Not needed for Bun
}
