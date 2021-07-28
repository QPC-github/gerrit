/**
 * @license
 * Copyright (C) 2016 The Android Open Source Project
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
import '@polymer/iron-icon/iron-icon';
import '../gr-avatar/gr-avatar';
import '../gr-hovercard-account/gr-hovercard-account';
import {appContext} from '../../../services/app-context';
import {getDisplayName} from '../../../utils/display-name-util';
import {isSelf, isServiceUser} from '../../../utils/account-util';
import {ReportingService} from '../../../services/gr-reporting/gr-reporting';
import {ChangeInfo, AccountInfo, ServerInfo} from '../../../types/common';
import {hasOwnProperty} from '../../../utils/common-util';
import {fireEvent} from '../../../utils/event-util';
import {isInvolved} from '../../../utils/change-util';
import {ShowAlertEventDetail} from '../../../types/events';
import {GrLitElement} from '../../lit/gr-lit-element';
import {css, customElement, html, property, state} from 'lit-element';
import {classMap} from 'lit-html/directives/class-map';

@customElement('gr-account-label')
export class GrAccountLabel extends GrLitElement {
  @property({type: Object})
  account?: AccountInfo;

  @property({type: Object})
  _selfAccount?: AccountInfo;

  /**
   * Optional ChangeInfo object, typically comes from the change page or
   * from a row in a list of search results. This is needed for some change
   * related features like adding the user as a reviewer.
   */
  @property({type: Object})
  change?: ChangeInfo;

  @property({type: String})
  voteableText?: string;

  /**
   * Should this user be considered to be in the attention set, regardless
   * of the current state of the change object?
   */
  @property({type: Boolean})
  forceAttention = false;

  /**
   * Only show the first name in the account label.
   */
  @property({type: Boolean})
  firstName = false;

  /**
   * Should attention set related features be shown in the component? Note
   * that the information whether the user is in the attention set or not is
   * part of the ChangeInfo object in the change property.
   */
  @property({type: Boolean})
  highlightAttention = false;

  @property({type: Boolean})
  hideHovercard = false;

  @property({type: Boolean})
  hideAvatar = false;

  @property({
    type: Boolean,
    reflect: true,
  })
  cancelLeftPadding = false;

  @property({type: Boolean})
  hideStatus = false;

  @state()
  _config?: ServerInfo;

  @property({type: Boolean, reflect: true})
  selectionChipStyle = false;

  @property({
    type: Boolean,
    reflect: true,
  })
  selected = false;

  @property({type: Boolean, reflect: true})
  deselected = false;

  reporting: ReportingService;

  private readonly restApiService = appContext.restApiService;

  static get styles() {
    return [
      css`
        :host {
          display: inline-block;
          vertical-align: top;
          position: relative;
          border-radius: var(--label-border-radius);
          box-sizing: border-box;
          white-space: nowrap;
          padding: 0 var(--account-label-padding-horizontal, 0);
        }
        /* If the first element is the avatar, then we cancel the left padding,
        so we can fit nicely into the gr-account-chip rounding. The obvious
        alternative of 'chip has padding' and 'avatar gets negative margin'
        does not work, because we need 'overflow:hidden' on the label. */
        :host([cancelLeftPadding]) {
          padding-left: 0;
        }
        :host::after {
          content: var(--account-label-suffix);
        }
        :host([deselected][selectionChipStyle]) {
          background-color: var(--background-color-primary);
          border: 1px solid var(--comment-separator-color);
          border-radius: 8px;
          color: var(--deemphasized-text-color);
        }
        :host([selected][selectionChipStyle]) {
          background-color: var(--chip-selected-background-color);
          border: 1px solid var(--chip-selected-background-color);
          border-radius: 8px;
          color: var(--chip-selected-text-color);
        }
        :host([selected]) iron-icon.attention {
          color: var(--chip-selected-text-color);
        }
        gr-avatar {
          height: calc(var(--line-height-normal) - 2px);
          width: calc(var(--line-height-normal) - 2px);
          vertical-align: top;
          position: relative;
          top: 1px;
        }
        #attentionButton {
          /* This negates the 4px horizontal padding, which we appreciate as a
         larger click target, but which we don't want to consume space. :-) */
          margin: 0 -4px 0 -4px;
          vertical-align: top;
        }
        iron-icon.attention {
          color: var(--deemphasized-text-color);
          width: 12px;
          height: 12px;
          vertical-align: top;
        }
        iron-icon.status {
          color: var(--deemphasized-text-color);
          width: 14px;
          height: 14px;
          vertical-align: top;
          position: relative;
          top: 2px;
        }
        .name {
          display: inline-block;
          text-decoration: inherit;
          vertical-align: top;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: var(--account-max-length, 180px);
        }
        .hasAttention .name {
          font-weight: var(--font-weight-bold);
        }
      `,
    ];
  }

  render() {
    const {account, change, highlightAttention, forceAttention} = this;
    if (!account) return;
    const hasAttention =
      forceAttention ||
      this._hasUnforcedAttention(highlightAttention, account, change);
    this.deselected = !this.selected;
    this.cancelLeftPadding = !this.hideAvatar && !hasAttention;
    return html`<span>
        ${!this.hideHovercard
          ? html`<gr-hovercard-account
              for="hovercardTarget"
              .account="${account}"
              .change="${change}"
              ?highlight-attention=${highlightAttention}
              .voteableText=${this.voteableText}
            ></gr-hovercard-account>`
          : ''}
        ${hasAttention
          ? html`<gr-button
              id="attentionButton"
              link=""
              aria-label="Remove user from attention set"
              @click=${this._handleRemoveAttentionClick}
              ?disabled=${!this._computeAttentionButtonEnabled(
                highlightAttention,
                account,
                change,
                this.selected,
                this._selfAccount
              )}
              ?has-tooltip=${this._computeAttentionButtonEnabled(
                highlightAttention,
                account,
                change,
                false,
                this._selfAccount
              )}
              title="${this._computeAttentionIconTitle(
                highlightAttention,
                account,
                change,
                forceAttention,
                this.selected,
                this._selfAccount
              )}"
              ><iron-icon
                class="attention"
                icon="gr-icons:attention"
              ></iron-icon>
            </gr-button>`
          : ''}
      </span>
      <span
        id="hovercardTarget"
        class="${classMap({
          hasAttention: !!hasAttention,
        })}"
      >
        ${!this.hideAvatar
          ? html`<gr-avatar .account="${account}" imageSize="32"></gr-avatar>`
          : ''}
        <span class="text" part="gr-account-label-text">
          <span class="name"
            >${this._computeName(account, this.firstName, this._config)}</span
          >
          ${!this.hideStatus && account.status
            ? html`<iron-icon
                class="status"
                icon="gr-icons:calendar"
              ></iron-icon>`
            : ''}
        </span>
      </span>`;
  }

  constructor() {
    super();
    this.reporting = appContext.reportingService;
    this.restApiService.getConfig().then(config => {
      this._config = config;
    });
    this.restApiService.getAccount().then(account => {
      this._selfAccount = account;
    });
    this.addEventListener('attention-set-updated', () => {
      // For re-evaluation of everything that depends on 'change'.
      if (this.change) this.change = {...this.change};
    });
  }

  _isAttentionSetEnabled(
    highlight: boolean,
    account: AccountInfo,
    change?: ChangeInfo
  ) {
    return highlight && !!change && !!account && !isServiceUser(account);
  }

  _hasUnforcedAttention(
    highlight: boolean,
    account: AccountInfo,
    change?: ChangeInfo
  ) {
    return (
      this._isAttentionSetEnabled(highlight, account, change) &&
      change &&
      change.attention_set &&
      !!account._account_id &&
      hasOwnProperty(change.attention_set, account._account_id)
    );
  }

  _computeName(
    account?: AccountInfo,
    firstName?: boolean,
    config?: ServerInfo
  ) {
    return getDisplayName(config, account, firstName);
  }

  _handleRemoveAttentionClick(e: MouseEvent) {
    if (!this.account || !this.change) return;
    if (this.selected) return;
    e.preventDefault();
    e.stopPropagation();
    if (!this.account._account_id) return;

    this.dispatchEvent(
      new CustomEvent<ShowAlertEventDetail>('show-alert', {
        detail: {
          message: 'Saving attention set update ...',
          dismissOnNavigation: true,
        },
        composed: true,
        bubbles: true,
      })
    );

    // We are deliberately updating the UI before making the API call. It is a
    // risk that we are taking to achieve a better UX for 99.9% of the cases.
    const selfName = getDisplayName(this._config, this._selfAccount);
    const reason = `Removed by ${selfName} by clicking the attention icon`;
    if (this.change.attention_set)
      delete this.change.attention_set[this.account._account_id];
    // For re-evaluation of everything that depends on 'change'.
    this.change = {...this.change};

    this.reporting.reportInteraction(
      'attention-icon-remove',
      this._reportingDetails()
    );
    this.restApiService
      .removeFromAttentionSet(
        this.change._number,
        this.account._account_id,
        reason
      )
      .then(() => {
        fireEvent(this, 'hide-alert');
      });
  }

  _reportingDetails() {
    if (!this.account) return;
    const targetId = this.account._account_id;
    const ownerId =
      (this.change && this.change.owner && this.change.owner._account_id) || -1;
    const selfId = this._selfAccount?._account_id || -1;
    const reviewers =
      this.change && this.change.reviewers && this.change.reviewers.REVIEWER
        ? [...this.change.reviewers.REVIEWER]
        : [];
    const reviewerIds = reviewers
      .map(r => r._account_id)
      .filter(rId => rId !== ownerId);
    return {
      actionByOwner: selfId === ownerId,
      actionByReviewer: selfId !== -1 && reviewerIds.includes(selfId),
      targetIsOwner: targetId === ownerId,
      targetIsReviewer: reviewerIds.includes(targetId),
      targetIsSelf: targetId === selfId,
    };
  }

  _computeAttentionButtonEnabled(
    highlight: boolean,
    account: AccountInfo,
    change: ChangeInfo | undefined,
    selected: boolean,
    selfAccount?: AccountInfo
  ) {
    if (selected) return true;
    return (
      !!this._hasUnforcedAttention(highlight, account, change) &&
      (isInvolved(change, selfAccount) || isSelf(account, selfAccount))
    );
  }

  _computeAttentionIconTitle(
    highlight: boolean,
    account: AccountInfo,
    change: ChangeInfo | undefined,
    force: boolean,
    selected: boolean,
    selfAccount?: AccountInfo
  ) {
    const enabled = this._computeAttentionButtonEnabled(
      highlight,
      account,
      change,
      selected,
      selfAccount
    );
    return enabled
      ? 'Click to remove the user from the attention set'
      : force
      ? 'Disabled. Use "Modify" to make changes.'
      : 'Disabled. Only involved users can change.';
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gr-account-label': GrAccountLabel;
  }
}
