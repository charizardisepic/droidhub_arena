export const Footer = () => {
  return (
    <footer className="border-t border-border bg-cyber-darker py-8">
      <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:justify-between">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          Built on Avalanche. Powered by the people.
        </p>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/bonusducks777/droidhub/blob/main/README.md"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            X/Twitter
          </a>
          <a
            href="https://discord.com"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Discord
          </a>
        </div>
      </div>
    </footer>
  );
};
