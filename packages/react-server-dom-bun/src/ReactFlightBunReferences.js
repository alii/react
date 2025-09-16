/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {ReactClientValue} from 'react-server/src/ReactFlightServer';

export type ServerReference<T: Function> = T & {
  $$typeof: symbol,
  $$id: string,
  $$bound: null | Array<ReactClientValue>,
  $$location?: Error,
};

// eslint-disable-next-line no-unused-vars
export type ClientReference<T> = {
  $$typeof: symbol,
  $$id: string,
  $$async: boolean,
};

const CLIENT_REFERENCE_TAG = Symbol.for('react.client.reference');
const SERVER_REFERENCE_TAG = Symbol.for('react.server.reference');

export function isClientReference(reference: Object): boolean {
  return reference.$$typeof === CLIENT_REFERENCE_TAG;
}

export function isServerReference(reference: Object): boolean {
  return reference.$$typeof === SERVER_REFERENCE_TAG;
}

export function registerClientReference<T>(
  proxyImplementation: any,
  id: string,
  exportName: string,
): ClientReference<T> {
  return registerClientReferenceImpl(
    proxyImplementation,
    id + '#' + exportName,
    false,
  );
}

function registerClientReferenceImpl<T>(
  proxyImplementation: any,
  id: string,
  async: boolean,
): ClientReference<T> {
  return Object.defineProperties(proxyImplementation, {
    $$typeof: {value: CLIENT_REFERENCE_TAG},
    $$id: {value: id},
    $$async: {value: async},
  });
}

// $FlowFixMe[method-unbinding]
const FunctionBind = Function.prototype.bind;
// $FlowFixMe[method-unbinding]
const ArraySlice = Array.prototype.slice;
function bind(this: ServerReference<any>): any {
  // $FlowFixMe[incompatible-call]
  const newFn = FunctionBind.apply(this, arguments);
  if (this.$$typeof === SERVER_REFERENCE_TAG) {
    if (__DEV__) {
      const thisBind = arguments[0];
      if (thisBind != null) {
        console.error(
          'Cannot bind "this" of a Server Action. Pass null or undefined as the first argument to .bind().',
        );
      }
    }
    const args = ArraySlice.call(arguments, 1);
    const $$typeof = {value: SERVER_REFERENCE_TAG};
    const $$id = {value: this.$$id};
    const $$bound = {value: this.$$bound ? this.$$bound.concat(args) : args};
    return Object.defineProperties(newFn, {
      $$typeof: $$typeof,
      $$id: $$id,
      $$bound: $$bound,
      $$location: this.$$location
        ? {value: this.$$location}
        : {value: undefined},
      bind: {value: bind, configurable: true},
    });
  }
  return newFn;
}

export function registerServerReference<T: Function>(
  reference: T,
  id: string,
  exportName: null | string,
): ServerReference<T> {
  return Object.defineProperties((reference: any), {
    $$typeof: {value: SERVER_REFERENCE_TAG},
    $$id: {
      value: exportName === null ? id : id + '#' + exportName,
      configurable: true,
    },
    $$bound: {value: null, configurable: true},
    $$location: {
      value: __DEV__ ? Error.captureStackTrace && new Error() : undefined,
      configurable: true,
    },
    bind: {value: bind, configurable: true},
  });
}

// This is the Bun-specific module map type
export type ClientManifest = {
  [id: string]: ClientReferenceMetadata,
};

export type ServerReferenceId = string;
export type ClientReferenceMetadata = {
  id: string,
  chunks: Array<string>,
  name: string,
  async: boolean,
};

export type ClientReferenceKey = string;

export function getClientReferenceKey(
  reference: ClientReference<any>,
): ClientReferenceKey {
  return reference.$$id;
}

export function resolveClientReferenceMetadata<T>(
  config: ClientManifest,
  clientReference: ClientReference<T>,
): ClientReferenceMetadata {
  const modulePath = clientReference.$$id;
  const idx = modulePath.lastIndexOf('#');
  const exportName = modulePath.slice(idx + 1);
  const id = modulePath.slice(0, idx);

  return {
    id: id,
    chunks: [],
    name: exportName,
    async: clientReference.$$async === true,
  };
}

export function getServerReferenceId<T>(
  config: ServerManifest,
  serverReference: ServerReference<T>,
): ServerReferenceId {
  return serverReference.$$id;
}

export function getServerReferenceBoundArguments<T>(
  config: ServerManifest,
  serverReference: ServerReference<T>,
): null | Array<ReactClientValue> {
  return serverReference.$$bound;
}

export type ServerManifest = mixed;

// Re-export the proxy creation function
export function createClientModuleProxy<T>(
  moduleId: string,
): ClientReference<T> {
  const clientReference: ClientReference<T> = {
    $$typeof: CLIENT_REFERENCE_TAG,
    $$id: moduleId,
    $$async: false,
  };

  return new Proxy(clientReference, {
    get(target, prop, receiver) {
      switch (prop) {
        case '$$typeof':
        case '$$id':
        case '$$async':
          return Reflect.get(target, prop, receiver);
        default:
          return registerClientReferenceImpl(
            {},
            target.$$id + '#' + prop,
            false,
          );
      }
    },
  });
}
