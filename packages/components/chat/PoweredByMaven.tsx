import { Logo } from "@magi/components/Logo";

interface PoweredByMavenProps {
  shouldRender: boolean;
}

export function PoweredByMaven({ shouldRender }: PoweredByMavenProps) {
  if (!shouldRender) return null;

  return (
    <div
      className="flex h-20 w-full items-center text-center"
      data-testid="powered-by-maven"
    >
      <div className="mx-auto flex items-center text-xs text-gray-400">
        Powered by{" "}
        <a href="https://www.mavenagi.com" target="_blank">
          <Logo className="ml-1 h-6" width={82} height={24} />
        </a>
      </div>
    </div>
  );
}
