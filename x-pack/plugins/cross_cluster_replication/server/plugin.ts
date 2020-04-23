/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

declare module 'src/core/server' {
  interface RequestHandlerContext {
    crossClusterReplication?: CrossClusterReplicationContext;
  }
}

import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { i18n } from '@kbn/i18n';
import {
  CoreSetup,
  Plugin,
  Logger,
  PluginInitializerContext,
  APICaller,
  IScopedClusterClient,
} from 'src/core/server';

import { Index } from '../../index_management/server';
import { PLUGIN } from '../common/constants';
import { Dependencies } from './types';
import { registerApiRoutes } from './routes';
import { License } from './services';
import { elasticsearchJsPlugin } from './client/elasticsearch_ccr';
import { CrossClusterReplicationConfig } from './config';
import { isEsError } from './lib/is_es_error';
import { formatEsError } from './lib/format_es_error';

interface CrossClusterReplicationContext {
  client: IScopedClusterClient;
}

const ccrDataEnricher = async (indicesList: Index[], callWithRequest: APICaller) => {
  if (!indicesList?.length) {
    return indicesList;
  }
  const params = {
    path: '/_all/_ccr/info',
    method: 'GET',
  };
  try {
    const { follower_indices: followerIndices } = await callWithRequest(
      'transport.request',
      params
    );
    return indicesList.map(index => {
      const isFollowerIndex = !!followerIndices.find(
        (followerIndex: { follower_index: string }) => {
          return followerIndex.follower_index === index.name;
        }
      );
      return {
        ...index,
        isFollowerIndex,
      };
    });
  } catch (e) {
    return indicesList;
  }
};

export class CrossClusterReplicationServerPlugin implements Plugin<void, void, any, any> {
  private readonly config$: Observable<CrossClusterReplicationConfig>;
  private readonly license: License;
  private readonly logger: Logger;

  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
    this.config$ = initializerContext.config.create();
    this.license = new License();
  }

  setup(
    { http, elasticsearch }: CoreSetup,
    { licensing, indexManagement, remoteClusters }: Dependencies
  ) {
    this.config$
      .pipe(first())
      .toPromise()
      .then(config => {
        // remoteClusters.isUiEnabled is driven by the xpack.remote_clusters.ui.enabled setting.
        // The CCR UI depends upon the Remote Clusters UI (e.g. by cross-linking to it), so if
        // the Remote Clusters UI is disabled we can't show the CCR UI.
        const isCcrUiEnabled = config.ui.enabled && remoteClusters.isUiEnabled;

        // If the UI isn't enabled, then we don't want to expose any CCR concepts in the UI, including
        // "follower" badges for follower indices.
        if (isCcrUiEnabled) {
          if (indexManagement.indexDataEnricher) {
            indexManagement.indexDataEnricher.add(ccrDataEnricher);
          }
        }
      });

    this.license.setup(
      {
        pluginId: PLUGIN.ID,
        minimumLicenseType: PLUGIN.minimumLicenseType,
        defaultErrorMessage: i18n.translate(
          'xpack.crossClusterReplication.licenseCheckErrorMessage',
          {
            defaultMessage: 'License check failed',
          }
        ),
      },
      {
        licensing,
        logger: this.logger,
      }
    );

    // Extend the elasticsearchJs client with additional endpoints.
    const esClientConfig = { plugins: [elasticsearchJsPlugin] };
    const ccrEsClient = elasticsearch.createClient('crossClusterReplication', esClientConfig);
    http.registerRouteHandlerContext('crossClusterReplication', (ctx, request) => {
      return {
        client: ccrEsClient.asScoped(request),
      };
    });

    registerApiRoutes({
      router: http.createRouter(),
      license: this.license,
      lib: {
        isEsError,
        formatEsError,
      },
    });
  }

  start() {}
  stop() {}
}