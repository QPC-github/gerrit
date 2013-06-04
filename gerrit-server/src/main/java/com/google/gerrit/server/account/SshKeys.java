// Copyright (C) 2013 The Android Open Source Project
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.gerrit.server.account;

import com.google.gerrit.extensions.registration.DynamicMap;
import com.google.gerrit.extensions.restapi.ChildCollection;
import com.google.gerrit.extensions.restapi.IdString;
import com.google.gerrit.extensions.restapi.ResourceNotFoundException;
import com.google.gerrit.extensions.restapi.RestView;
import com.google.inject.Inject;
import com.google.inject.Provider;

public class SshKeys implements
    ChildCollection<AccountResource, AccountResource.SshKey> {
  private final DynamicMap<RestView<AccountResource.SshKey>> views;
  private final Provider<GetSshKeys> list;

  @Inject
  SshKeys(DynamicMap<RestView<AccountResource.SshKey>> views,
      Provider<GetSshKeys> list) {
    this.views = views;
    this.list = list;
  }

  @Override
  public RestView<AccountResource> list() {
    return list.get();
  }

  @Override
  public AccountResource.SshKey parse(AccountResource parent, IdString id)
      throws ResourceNotFoundException {
    throw new ResourceNotFoundException(id);
  }

  @Override
  public DynamicMap<RestView<AccountResource.SshKey>> views() {
    return views;
  }
}
