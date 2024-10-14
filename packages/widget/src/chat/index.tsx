import { createRef, render } from 'preact';
import { forwardRef, useImperativeHandle } from 'preact/compat';
import { useEffect, useState } from 'preact/hooks';

export const useMediaQuery = (query: string) => {
  const mediaMatch = window.matchMedia(query);
  const [matches, setMatches] = useState(mediaMatch.matches);

  useEffect(() => {
    const handler: Parameters<
      typeof mediaMatch.addEventListener<'change'>
    >[1] = (e) => setMatches(e.matches);
    mediaMatch.addEventListener('change', handler);
    return () => mediaMatch.removeEventListener('change', handler);
  });
  return matches;
};

// TODO: L10n on this file. Importing useTranslations breaks webpack
const ChatButton = (props: {
  bgColor: string;
  textColor: string;
  horizontalPosition: 'left' | 'right';
  verticalPosition: 'top' | 'bottom';
  isOpen: boolean;
  onClick: () => void;
}) => {
  return (
    <div
      style={{
        zIndex: 1000,
        paddingLeft: '0.75rem',
        paddingRight: '0.75rem',
        height: '3rem',
        width: 'fit-content',
        position: 'fixed',
        left: props.horizontalPosition === 'left' ? '1rem' : 'auto',
        right: props.horizontalPosition === 'right' ? '1rem' : 'auto',
        top: props.verticalPosition === 'top' ? '1rem' : 'auto',
        bottom: props.verticalPosition === 'bottom' ? '1rem' : 'auto',
        borderRadius: '9999px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: 'rgba(0, 0, 0, 0.25) 0px 6px 10px 0px',
        backgroundColor: props.bgColor,
        color: props.textColor,
        '-webkit-touch-callout': 'none',
        '-webkit-user-select': 'none',
        '-khtml-user-select': 'none',
        '-moz-user-select': 'none',
        '-ms-user-select': 'none',
        userSelect: 'none',
      } as React.CSSProperties}
      onClick={props.onClick}
    >
      {!props.isOpen ? (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <svg
            style={{
              width: '1.5rem',
              height: '1.5rem',
            }}
            aria-hidden='true'
            xmlnsXlink='http://www.w3.org/2000/xmlns/'
            viewBox='0 0 20 20'
            fill='currentColor'
          >
            <path d='M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm0 16a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm1-5.034V12a1 1 0 0 1-2 0v-1.418a1 1 0 0 1 1.038-.999 1.436 1.436 0 0 0 1.488-1.441 1.501 1.501 0 1 0-3-.116.986.986 0 0 1-1.037.961 1 1 0 0 1-.96-1.037A3.5 3.5 0 1 1 11 11.466Z' />
          </svg>
          {/* eslint-disable-next-line i18next/no-literal-string */}
          <span style={{ marginLeft: '0.5rem', marginRight: '0.25rem' }}>
            Get Help
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex' }}>
          <svg
            style={{
              width: '1.5rem',
              height: '1.5rem',
            }}
            aria-hidden='true'
            xmlnsXlink='http://www.w3.org/2000/xmlns/'
            viewBox='0 0 20 20'
            fill='currentColor'
          >
            <path d='M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z' />
          </svg>
        </div>
      )}
    </div>
  );
};

type Props = {
  iframeUrl: string;
  bgColor: string;
  textColor: string;
  horizontalPosition: 'left' | 'right';
  verticalPosition: 'top' | 'bottom';
};
const App = forwardRef<
  {
    open: () => void;
    close: () => void;
  },
  Props
>((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  useImperativeHandle(ref, () => {
    return {
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    };
  });

  const isWide = useMediaQuery('(min-width: 500px)');

  return (
    <>
      <ChatButton
        bgColor={props.bgColor}
        textColor={props.textColor}
        horizontalPosition={props.horizontalPosition}
        verticalPosition={props.verticalPosition}
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      />
      <iframe
        style={{
          backgroundColor: 'white',
          width: isWide ? '480px' : '100vw',
          height: isWide ? '560px' : 'calc(100vh - 5rem)',
          position: 'fixed',
          zIndex: 1000,
          bottom: '5rem',
          right: isWide ? '1rem' : 0,
          border: 'solid rgb(209, 213, 219)',
          outline: 'none',
          boxShadow: 'rgba(0, 0, 0, 0.15) 0px 0px 20px 0px',
          borderRadius: isWide ? '12px' : 0,
          transition:
            'transform 0.2s cubic-bezier(0.03, 0.18, 0.32, 0.66) 0s, opacity 0.2s cubic-bezier(0.03, 0.18, 0.32, 0.66) 0s, box-shadow 0.2s cubic-bezier(0.03, 0.18, 0.32, 0.66) 0s',
          transformOrigin: 'bottom right',
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'scale(1)' : 'scale(0)',
        }}
        src={props.iframeUrl}
        allow='clipboard-write'
      />
    </>
  );
});

const appRef = createRef();

export function open() {
  appRef.current?.open();
}

export function close() {
  appRef.current?.close();
}

export async function load({
  envPrefix: _envPrefix,
  bgColor,
  textColor = 'white',
  horizontalPosition = 'right',
  verticalPosition = 'bottom',
  unverifiedUserInfo = {},
  orgFriendlyId,
  agentFriendlyId,
}: Partial<Omit<Props, 'agentId' | 'baseUrl'>> & {
  envPrefix?: string;
  apiKey: string;
  horizontalPosition?: 'left' | 'right';
  verticalPosition?: 'top' | 'bottom';
  unverifiedUserInfo?: Record<string, unknown>;
  orgFriendlyId: string;
  agentFriendlyId: string;
}) {
  const placeholder = document.createElement('div');
  document.body.appendChild(placeholder);

  const currentDomain = window.location.hostname;
  const isLocalhost = currentDomain.includes('localhost');
  const iframeProtocol = isLocalhost ? 'http' : 'https';
  const iframeDomain = isLocalhost ? 'localhost:3000' : 'chat-v2.onmaven.app';
  let iframeUrl = `${iframeProtocol}://${iframeDomain}/${orgFriendlyId}/${agentFriendlyId}`;
  if (unverifiedUserInfo) {
    iframeUrl += `?unverifiedUserInfo=${encodeURIComponent(JSON.stringify(unverifiedUserInfo))}`;
  }

  render(
    // @ts-expect-error Server Component
    <App
      ref={appRef}
      iframeUrl={iframeUrl}
      bgColor={bgColor || '#6C2BD9'}
      textColor={textColor}
      horizontalPosition={horizontalPosition}
      verticalPosition={verticalPosition}
    />,
    placeholder
  );
}
