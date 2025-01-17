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

const fn = require(`src/plugins/vis_type_timeline/server/lib/load_functions`);

const expect = require('chai').expect;

describe('load_functions.js', () => {
  it('exports a function', () => {
    expect(fn).to.be.a('function');
  });

  it('returns an object with keys named for the javascript files in the directory', () => {
    const fnList = fn('series_functions');

    expect(fnList).to.be.an('object');
    expect(fnList.sum).to.be.a('object');
  });

  it('also includes index.js files in direct subdirectories, and names the keys for the directory', () => {
    const fnList = fn('series_functions');

    expect(fnList).to.be.an('object');
    expect(fnList.opensearch).to.be.a('object');
  });
});
