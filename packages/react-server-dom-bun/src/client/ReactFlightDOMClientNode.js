/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {ReactCustomFormAction, Thenable} from 'shared/ReactTypes.js';

import type {
  DebugChannel,
  FindSourceMapURLCallback,
  Response,
} from 'react-client/src/ReactFlightClient';

import type {
  ModuleLoading,
  ServerConsumerModuleMap,
  ServerManifest,
} from 'react-client/src/ReactFlightClientConfig';

type ServerConsumerManifest = {
  moduleMap: ServerConsumerModuleMap,
  moduleLoading: ModuleLoading,
  serverModuleMap: null | ServerManifest,
};

import type {Readable} from 'stream';

import {
  close,
  createResponse,
  createStreamState,
  getRoot,
  processBinaryChunk,
  processStringChunk,
  reportGlobalError,
} from 'react-client/src/ReactFlightClient';

import type {ReactServerValue} from 'react-client/src/ReactFlightReplyClient';
import {processReply} from 'react-client/src/ReactFlightReplyClient';

export {
  createServerReference,
  registerServerReference,
} from 'react-client/src/ReactFlightReplyClient';

import type {TemporaryReferenceSet} from 'react-client/src/ReactFlightTemporaryReferences';

export {createTemporaryReferenceSet} from 'react-client/src/ReactFlightTemporaryReferences';

export type {TemporaryReferenceSet};

function noServerCall() {
  // eslint-disable-next-line react-internal/prod-error-codes
  throw new Error(
    'Server Functions cannot be called during initial render. ' +
      'This would create a fetch waterfall. Try to use a Server Component ' +
      'to pass data to Client Components instead.',
  );
}

type EncodeFormActionCallback = <A>(
  id: any,
  args: Promise<A>,
) => ReactCustomFormAction;

export type Options = {
  nonce?: string,
  encodeFormAction?: EncodeFormActionCallback,
  findSourceMapURL?: FindSourceMapURLCallback,
  replayConsoleLogs?: boolean,
  environmentName?: string,
  // For the Node.js client we only support a single-direction debug channel.
  debugChannel?: Readable,
};

function startReadingFromStream(
  response: Response,
  stream: Readable,
  onEnd: () => void,
): void {
  const streamState = createStreamState(response, stream);

  stream.on('data', chunk => {
    if (typeof chunk === 'string') {
      processStringChunk(response, streamState, chunk);
    } else {
      processBinaryChunk(response, streamState, chunk);
    }
  });

  stream.on('error', error => {
    reportGlobalError(response, error);
  });

  stream.on('end', onEnd);
}

function createFromNodeStream<T>(
  stream: Readable,
  serverConsumerManifest: ServerConsumerManifest,
  options?: Options,
): Thenable<T> {
  const debugChannel: void | DebugChannel =
    __DEV__ && options && options.debugChannel !== undefined
      ? {
          hasReadable: options.debugChannel.readable !== undefined,
          callback: null,
        }
      : undefined;

  const response: Response = createResponse(
    serverConsumerManifest.moduleMap,
    serverConsumerManifest.serverModuleMap,
    serverConsumerManifest.moduleLoading,
    noServerCall,
    options ? options.encodeFormAction : undefined,
    options && typeof options.nonce === 'string' ? options.nonce : undefined,
    undefined, // TODO: If encodeReply is supported, this should support temporaryReferences
    __DEV__ && options && options.findSourceMapURL
      ? options.findSourceMapURL
      : undefined,
    __DEV__ && options ? options.replayConsoleLogs === true : false, // defaults to false
    __DEV__ && options && options.environmentName
      ? options.environmentName
      : undefined,
    debugChannel,
  );

  if (__DEV__ && options && options.debugChannel) {
    let streamEndedCount = 0;
    const handleEnd = () => {
      if (++streamEndedCount === 2) {
        close(response);
      }
    };
    startReadingFromStream(response, options.debugChannel, handleEnd);
    startReadingFromStream(response, stream, handleEnd);
  } else {
    startReadingFromStream(response, stream, close.bind(null, response));
  }

  return getRoot(response);
}

function encodeReply(
  value: ReactServerValue,
  options?: {temporaryReferences?: TemporaryReferenceSet, signal?: AbortSignal},
): Promise<
  string | URLSearchParams | FormData,
> /* We don't use URLSearchParams yet but maybe */ {
  return new Promise((resolve, reject) => {
    const abort = processReply(
      value,
      '',
      options && options.temporaryReferences
        ? options.temporaryReferences
        : undefined,
      resolve,
      reject,
    );
    if (options && options.signal) {
      const signal = options.signal;
      if (signal.aborted) {
        abort((signal: any).reason);
      } else {
        const listener = () => {
          abort((signal: any).reason);
          signal.removeEventListener('abort', listener);
        };
        signal.addEventListener('abort', listener);
      }
    }
  });
}

export {createFromNodeStream, encodeReply};
