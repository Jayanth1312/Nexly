interface Source {
  title: string;
  url: string;
  snippet?: string;
  text?: string;
  date?: string;
}

interface SourcesProps {
  sources: Source[];
}

export function Sources({ sources }: SourcesProps) {
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 w-full">
        {sources.map((source, index) => (
          <div
            key={index}
            className="border rounded-lg px-4 py-3 bg-accent/20 hover:bg-accent/30 transition-colors cursor-pointer group sm:h-24 sm:flex sm:flex-col sm:justify-between"
            onClick={() => window.open(source.url, "_blank")}
          >
            {/* Mobile layout: only favicon and URL */}
            <div className="flex items-center gap-2 sm:hidden w-fit">
              <img
                src={`https://www.google.com/s2/favicons?domain=${
                  new URL(source.url).hostname
                }&sz=16`}
                alt=""
                className="w-4 h-4 rounded-sm flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <span className="text-sm text-muted-foreground truncate">
                {new URL(source.url).hostname}
              </span>
            </div>

            {/* Desktop layout: title + favicon and URL */}
            <div className="hidden sm:contents">
              <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                {source.title}
              </h4>

              <div className="flex items-center gap-2 mt-2">
                <img
                  src={`https://www.google.com/s2/favicons?domain=${
                    new URL(source.url).hostname
                  }&sz=16`}
                  alt=""
                  className="w-4 h-4 rounded-sm flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <span className="text-sm text-muted-foreground truncate">
                  {new URL(source.url).hostname}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
