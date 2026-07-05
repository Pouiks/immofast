import { Card } from "@/components/ui";

/** Placeholder de module à construire — remplacé par la feature réelle. */
export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <Card className="flex flex-col items-center justify-center gap-2 p-16 text-center">
      <div className="text-lg font-extrabold">{title}</div>
      <p className="max-w-md text-[13px] font-medium text-muted">{description}</p>
    </Card>
  );
}
