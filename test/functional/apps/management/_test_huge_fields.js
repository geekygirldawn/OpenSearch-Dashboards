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

export default function ({ getService, getPageObjects }) {
  const opensearchArchiver = getService('opensearchArchiver');
  const security = getService('security');
  const PageObjects = getPageObjects(['common', 'home', 'settings']);

  describe('test large number of fields', function () {
    this.tags(['skipCloud']);

    const EXPECTED_FIELD_COUNT = '10006';
    before(async function () {
      await security.testUser.setRoles(['opensearch_dashboards_admin', 'test_testhuge_reader']);
      await opensearchArchiver.loadIfNeeded('large_fields');
      await PageObjects.settings.createIndexPattern('testhuge', 'date');
    });

    it('test_huge data should have expected number of fields', async function () {
      const tabCount = await PageObjects.settings.getFieldsTabCount();
      expect(tabCount).to.be(EXPECTED_FIELD_COUNT);
    });

    after(async () => {
      await security.testUser.restoreDefaults();
      await opensearchArchiver.unload('large_fields');
    });
  });
}
