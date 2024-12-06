// Fragment and h are not used, but they are required for JSX to work
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h, render } from "preact";

import * as ChatWidget from "./chat";

declare global {
  interface Window {
    Maven: {
      ChatWidget: typeof ChatWidget;
    };
    MavenChatWidget: typeof ChatWidget;
  }
}

window.Maven = window.Maven || {
  ChatWidget,
};

// This is for backwards compatibility with the old chat widget code which exported a MavenChatWidget global.
// We alias it to Maven.ChatWidget so that it can be used in the new widget code without having to change.
// TODO: Remove this when the old widget code is no longer used.
window.MavenChatWidget = window.Maven.ChatWidget;
