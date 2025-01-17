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

import expect from '@osd/expect';

export default function ({ getService }) {
  const supertest = getService('supertest');
  const opensearch = getService('legacyOpenSearch');
  const opensearchArchiver = getService('opensearchArchiver');

  describe('delete', () => {
    describe('with opensearch-dashboards index', () => {
      before(() => opensearchArchiver.load('saved_objects/basic'));
      after(() => opensearchArchiver.unload('saved_objects/basic'));

      it('should return 200 when deleting a doc', async () =>
        await supertest
          .delete(`/api/saved_objects/dashboard/be3733a0-9efe-11e7-acb3-3dab96693fab`)
          .expect(200)
          .then((resp) => {
            expect(resp.body).to.eql({});
          }));

      it('should return generic 404 when deleting an unknown doc', async () =>
        await supertest
          .delete(`/api/saved_objects/dashboard/not-a-real-id`)
          .expect(404)
          .then((resp) => {
            expect(resp.body).to.eql({
              statusCode: 404,
              error: 'Not Found',
              message: 'Saved object [dashboard/not-a-real-id] not found',
            });
          }));
    });

    describe('without opensearch-dashboards index', () => {
      before(
        async () =>
          // just in case the opensearch-dashboards server has recreated it
          await opensearch.indices.delete({
            index: '.opensearch_dashboards',
            ignore: [404],
          })
      );

      it('returns generic 404 when opensearch-dashboards index is missing', async () =>
        await supertest
          .delete(`/api/saved_objects/dashboard/be3733a0-9efe-11e7-acb3-3dab96693fab`)
          .expect(404)
          .then((resp) => {
            expect(resp.body).to.eql({
              statusCode: 404,
              error: 'Not Found',
              message: 'Saved object [dashboard/be3733a0-9efe-11e7-acb3-3dab96693fab] not found',
            });
          }));
    });
  });
}
