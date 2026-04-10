"use client";

import { AppHeader } from "@/components/AppHeader";
import { InputMethodsPanel } from "@/components/InputMethodsPanel";
import { PipelineVisualization } from "@/components/PipelineVisualization";
import { ResultsPanel } from "@/components/ResultsPanel";
import { useMiddlewareDemo } from "@/hooks/useMiddlewareDemo";

export default function Home() {
  const demo = useMiddlewareDemo();

  return (
    <main className="min-h-screen bg-surface text-ink">
      <AppHeader />
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-6 xl:grid-cols-[1fr_0.9fr_1fr]">
        <div className="rounded border border-line bg-panel p-5">
          <InputMethodsPanel
            clinicalNote={demo.clinicalNote}
            destinationIntent={demo.destinationIntent}
            inputChannel={demo.inputChannel}
            isRunning={demo.isRunning}
            jsonPayload={demo.jsonPayload}
            messageInput={demo.messageInput}
            onClinicalNoteChange={demo.setClinicalNote}
            onDestinationIntentChange={demo.setDestinationIntent}
            onInputChannelChange={demo.setInputChannel}
            onJsonPayloadChange={demo.setJsonPayload}
            onMessageInputChange={demo.setMessageInput}
            onRun={demo.runDemo}
          />
        </div>
        <div className="rounded border border-line bg-panel p-5">
          <PipelineVisualization stages={demo.stages} />
        </div>
        <div className="rounded border border-line bg-panel p-5">
          <ResultsPanel error={demo.error} result={demo.result} />
        </div>
      </div>
    </main>
  );
}
