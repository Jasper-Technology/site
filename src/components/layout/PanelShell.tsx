interface PanelShellProps {
  children: React.ReactNode;
  title?: string;
}

export default function PanelShell({ children, title }: PanelShellProps) {
  return (
    <div className="h-full bg-card flex flex-col min-w-0">
      {title && (
        <div className="px-4 py-2 border-b border-border bg-muted/30">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</h3>
        </div>
      )}
      <div className="flex-1 overflow-y-auto custom-scrollbar">{children}</div>
    </div>
  );
}

