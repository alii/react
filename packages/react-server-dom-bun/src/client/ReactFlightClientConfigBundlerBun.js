/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {
  Thenable,
  FulfilledThenable,
  RejectedThenable,
  ReactDebugInfo,
} from 'shared/ReactTypes';

import type {ModuleLoading} from 'react-client/src/ReactFlightClientConfig';

// Bun's SSR manifest structure
export type ServerConsumerModuleMap = {
  [id: string]: {
    [exportName: string]: {
      specifier: string,
      name: string,
    },
  },
};
export type ServerManifest = string; // Module root path
export type ServerReferenceId = string;

import {prepareDestinationForModuleImpl} from 'react-client/src/ReactFlightClientConfig';

// Simple tuple format matching server config
export opaque type ClientReferenceMetadata = [
  string, // module path
  string, // export name
  boolean, // async
];

// eslint-disable-next-line no-unused-vars
export opaque type ClientReference<T> = {
  specifier: string,
  name: string,
  async?: boolean,
};

// The reason this function needs to defined here in this file instead of just
// being exported directly from the BunDestination... file is because the
// ClientReferenceMetadata is opaque and we can't unwrap it there.
// This should get inlined and we could also just implement an unwrapping function
// though that risks it getting used in places it shouldn't be. This is unfortunate
// but currently it seems to be the best option we have.
export function prepareDestinationForModule(
  moduleLoading: ModuleLoading,
  nonce: ?string,
  metadata: ClientReferenceMetadata,
) {
  prepareDestinationForModuleImpl(moduleLoading, metadata[0], nonce);
}

export function resolveClientReference<T>(
  bundlerConfig: ServerConsumerModuleMap,
  metadata: ClientReferenceMetadata,
): ClientReference<T> {
  const modulePath = metadata[0];
  const exportName = metadata[1];
  const isAsync = metadata[2];

  // If no bundlerConfig (browser case), use metadata directly
  if (!bundlerConfig) {
    return {
      specifier: modulePath,
      name: exportName,
      async: isAsync,
    };
  }

  // The ssrManifest from Bun has the structure:
  // { "pages/index.tsx": { "default": { specifier: "ssr:pages/index.tsx", name: "default" } } }
  const moduleEntry = bundlerConfig[modulePath];

  if (!moduleEntry) {
    // eslint-disable-next-line react-internal/prod-error-codes
    throw new Error(
      'Could not find the module "' +
        modulePath +
        '" in the React Server Consumer Manifest. ' +
        'This is probably a bug in the React Server Components bundler.',
    );
  }

  const exportEntry =
    moduleEntry[exportName] || moduleEntry['*'] || moduleEntry.default;

  if (!exportEntry || !exportEntry.specifier) {
    // eslint-disable-next-line react-internal/prod-error-codes
    throw new Error(
      'Could not find the export "' +
        exportName +
        '" in module "' +
        modulePath +
        '" in the React Server Consumer Manifest.',
    );
  }

  return {
    specifier: exportEntry.specifier,
    name: exportEntry.name,
    async: isAsync,
  };
}

export function resolveServerReference<T>(
  config: ServerManifest,
  id: ServerReferenceId,
): ClientReference<T> {
  const baseURL: string = config;
  const idx = id.lastIndexOf('#');
  const exportName = id.slice(idx + 1);
  const fullURL = id.slice(0, idx);
  if (!fullURL.startsWith(baseURL)) {
    // eslint-disable-next-line react-internal/prod-error-codes
    throw new Error(
      'Attempted to load a Server Reference outside the hosted root.',
    );
  }
  return {specifier: fullURL, name: exportName};
}

const asyncModuleCache: Map<string, Thenable<any>> = new Map();

export function preloadModule<T>(
  metadata: ClientReference<T>,
): null | Thenable<any> {
  const existingPromise = asyncModuleCache.get(metadata.specifier);
  if (existingPromise) {
    if (existingPromise.status === 'fulfilled') {
      return null;
    }
    return existingPromise;
  } else {
    // $FlowFixMe[unsupported-syntax]
    const modulePromise: Thenable<T> = import(metadata.specifier);
    if (metadata.async) {
      modulePromise.then(
        value => {
          const fulfilledThenable: FulfilledThenable<mixed> =
            (modulePromise: any);
          fulfilledThenable.status = 'fulfilled';
          fulfilledThenable.value = value.default;
        },
        error => {
          const rejectedThenable: RejectedThenable<mixed> =
            (modulePromise: any);
          rejectedThenable.status = 'rejected';
          rejectedThenable.reason = error;
        },
      );
    } else {
      modulePromise.then(
        value => {
          const fulfilledThenable: FulfilledThenable<mixed> =
            (modulePromise: any);
          fulfilledThenable.status = 'fulfilled';
          fulfilledThenable.value = value;
        },
        error => {
          const rejectedThenable: RejectedThenable<mixed> =
            (modulePromise: any);
          rejectedThenable.status = 'rejected';
          rejectedThenable.reason = error;
        },
      );
    }
    asyncModuleCache.set(metadata.specifier, modulePromise);
    return modulePromise;
  }
}

export function requireModule<T>(metadata: ClientReference<T>): T {
  let moduleExports = asyncModuleCache.get(metadata.specifier);
  if (moduleExports) {
    if (moduleExports.status === 'fulfilled') {
      moduleExports = moduleExports.value;
    } else {
      throw moduleExports.reason;
    }
  } else {
    // eslint-disable-next-line react-internal/prod-error-codes
    throw new Error(
      'Module "' + metadata.specifier + '" must be preloaded before use.',
    );
  }
  if (metadata.name === '*') {
    // This is a placeholder value that represents that the caller imported this
    // as a CommonJS module as is.
    return moduleExports;
  }
  if (metadata.name === '') {
    // This is a placeholder value that represents that the caller accessed the
    // default property of this if it was an ESM interop module.
    return moduleExports.default;
  }
  return moduleExports[metadata.name];
}

export function getModuleDebugInfo<T>(
  metadata: ClientReference<T>,
): null | ReactDebugInfo {
  // TODO: Implement module debug info for Bun
  return null;
}
