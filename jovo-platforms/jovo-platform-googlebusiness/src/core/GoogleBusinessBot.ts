import { BaseApp, HandleRequest, Host, Jovo, Log, Util } from 'jovo-core';

import { GoogleBusiness } from '../GoogleBusiness';
import {
  BaseResponse,
  GoogleServiceAccount,
  ResponseOptions,
  Suggestion,
  TextResponse,
} from '../Interfaces';
import { GoogleBusinessAPI } from '../services/GoogleBusinessAPI';
import { GoogleBusinessRequest } from './GoogleBusinessRequest';
import { GoogleBusinessResponse } from './GoogleBusinessResponse';
import { GoogleBusinessSpeechBuilder } from './GoogleBusinessSpeechBuilder';
import { GoogleBusinessUser } from './GoogleBusinessUser';

export class GoogleBusinessBot extends Jovo {
  $googleBusinessBot: GoogleBusinessBot;
  $user: GoogleBusinessUser;

  constructor(app: BaseApp, host: Host, handleRequest?: HandleRequest) {
    super(app, host, handleRequest);
    this.$googleBusinessBot = this;
    this.$response = new GoogleBusinessResponse();
    this.$speech = new GoogleBusinessSpeechBuilder(this);
    // $reprompt object has to be added even if the platform doesn't use it.
    // Is used by users as platform independent feature
    this.$reprompt = new GoogleBusinessSpeechBuilder(this);
    this.$user = new GoogleBusinessUser(this);
    this.$output.GoogleBusiness = {};
  }

  isNewSession(): boolean {
    if (this.$user.$session) {
      return this.$user.$session.id !== this.$request!.getSessionId();
    } else {
      return false;
    }
  }

  hasAudioInterface(): boolean {
    return this.$request!.hasAudioInterface();
  }

  hasScreenInterface(): boolean {
    return this.$request!.hasScreenInterface();
  }

  hasVideoInterface(): boolean {
    return this.$request!.hasVideoInterface();
  }

  getSpeechBuilder(): GoogleBusinessSpeechBuilder {
    return new GoogleBusinessSpeechBuilder(this);
  }

  speechBuilder(): GoogleBusinessSpeechBuilder {
    return this.getSpeechBuilder();
  }

  getDeviceId(): string | undefined {
    Log.warn(`Google Business Messages doesn't provide a device ID`);
    return;
  }

  getRawText(): string | undefined {
    return (this.$request! as GoogleBusinessRequest).getRawText();
  }

  getAudioData(): undefined {
    return undefined;
  }

  getTimestamp(): string | undefined {
    return this.$request?.getTimestamp();
  }

  getLocale(): string | undefined {
    return this.$config.plugin?.GoogleBusiness?.locale;
  }

  getType(): string | undefined {
    return GoogleBusiness.appType;
  }

  getPlatformType(): string {
    return GoogleBusiness.type;
  }

  getSelectedElementId(): string | undefined {
    return undefined;
  }

  addSuggestionChips(suggestions: Suggestion[]): this {
    this.$output.GoogleBusiness.Suggestions = suggestions;
    return this;
  }

  setFallback(fallback: string): this {
    this.$output.GoogleBusiness.Fallback = fallback;
    return this;
  }

  async showText(text: string, options: ResponseOptions = {}): Promise<void> {
    const data: TextResponse = {
      ...this.makeBaseResponse(),
      ...options,
      text,
    };
    await GoogleBusinessAPI.sendResponse({
      data,
      serviceAccount: this.serviceAccount!,
      sessionId: this.$request!.getSessionId()!,
    });
  }

  makeBaseResponse(): BaseResponse {
    const messageId = Util.randomStr(12);
    return {
      messageId,
      representative: {
        representativeType: 'BOT',
      },
    };
  }

  private get serviceAccount(): GoogleServiceAccount | undefined {
    return this.$config.plugin?.GoogleBusiness.serviceAccount;
  }
}
