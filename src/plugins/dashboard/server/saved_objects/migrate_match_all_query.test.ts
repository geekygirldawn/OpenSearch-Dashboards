/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 */

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/*
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */
import { migrateMatchAllQuery } from './migrate_match_all_query';
import { SavedObjectMigrationContext, SavedObjectMigrationFn } from 'opensearch-dashboards/server';

const savedObjectMigrationContext = (null as unknown) as SavedObjectMigrationContext;

describe('migrate match_all query', () => {
  test('should migrate obsolete match_all query', () => {
    const migratedDoc = migrateMatchAllQuery(
      {
        attributes: {
          opensearchDashboardsSavedObjectMeta: {
            searchSourceJSON: JSON.stringify({
              query: {
                match_all: {},
              },
            }),
          },
        },
      } as Parameters<SavedObjectMigrationFn>[0],
      savedObjectMigrationContext
    );

    const migratedSearchSource = JSON.parse(
      migratedDoc.attributes.opensearchDashboardsSavedObjectMeta.searchSourceJSON
    );

    expect(migratedSearchSource).toEqual({
      query: {
        query: '',
        language: 'kuery',
      },
    });
  });

  it('should return original doc if searchSourceJSON cannot be parsed', () => {
    const migratedDoc = migrateMatchAllQuery(
      {
        attributes: {
          opensearchDashboardsSavedObjectMeta: 'opensearchDashboardsSavedObjectMeta',
        },
      } as Parameters<SavedObjectMigrationFn>[0],
      savedObjectMigrationContext
    );

    expect(migratedDoc).toEqual({
      attributes: {
        opensearchDashboardsSavedObjectMeta: 'opensearchDashboardsSavedObjectMeta',
      },
    });
  });
});
