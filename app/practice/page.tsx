import { Suspense } from "react";
import { PracticeClient } from "./practice-client";

export default function PracticePage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Dealing the questions&hellip;</p>}>
      <PracticeClient />
    </Suspense>
  );
}
