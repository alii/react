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
  ClientReferenceMetadata,
  ServerReferenceId,
} from '../ReactFlightBunReferences';

import type {ClientManifest} from '../ReactFlightBunReferences';
import type {ClientReferenceKey} from '../ReactFlightBunReferences';

import {
  isClientReference,
  getClientReferenceKey,
  resolveClientReferenceMetadata,
  getServerReferenceId,
  getServerReferenceBoundArguments,
} from '../ReactFlightBunReferences';

import isArray from 'shared/isArray';

type ServerConsumerManifest = mixed;

export type {
  ClientReference,
  ServerReference,
  ClientReferenceMetadata,
  ServerReferenceId,
  ClientReferenceKey,
  ClientManifest,
  ServerConsumerManifest,
};

export {
  isClientReference,
  getClientReferenceKey,
  resolveClientReferenceMetadata,
  getServerReferenceId,
  getServerReferenceBoundArguments,
};

export type SSRModuleMap = null | {
  [clientId: string]: {
    [clientExportName: string]: ClientReferenceMetadata,
  },
};

export type ServerManifest = mixed;

export type Hints = null;

export type HintCode = string;
export type HintModel<T: HintCode> = null;

export function dispatchHint<Code: HintCode>(
  code: Code,
  model: HintModel<Code>,
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