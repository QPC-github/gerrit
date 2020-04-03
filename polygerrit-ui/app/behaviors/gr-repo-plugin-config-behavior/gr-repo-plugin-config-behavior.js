/**
 * @license
 * Copyright (C) 2019 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** @polymerBehavior Gerrit.RepoPluginConfig*/
export const RepoPluginConfig = {
  // Should be kept in sync with
  // gerrit/java/com/google/gerrit/extensions/api/projects/ProjectConfigEntryType.java.
  ENTRY_TYPES: {
    ARRAY: 'ARRAY',
    BOOLEAN: 'BOOLEAN',
    INT: 'INT',
    LIST: 'LIST',
    LONG: 'LONG',
    STRING: 'STRING',
  },
  PLUGIN_CONFIG_CHANGED: 'plugin-config-changed',
};

// TODO(dmfilippov) Remove the following lines with assignments
// Plugins can use the behavior because it was accessible with
// the global Gerrit... variable. To avoid breaking changes in plugins
// temporary assign global variables.
window.Gerrit = window.Gerrit || {};
window.Gerrit.RepoPluginConfig = RepoPluginConfig;
