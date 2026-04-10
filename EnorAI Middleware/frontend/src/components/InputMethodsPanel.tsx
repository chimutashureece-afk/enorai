type InputMethodsPanelProps = {
  clinicalNote: string;
  destinationIntent: string;
  inputChannel: string;
  jsonPayload: string;
  messageInput: string;
  isRunning: boolean;
  onClinicalNoteChange: (value: string) => void;
  onDestinationIntentChange: (value: string) => void;
  onInputChannelChange: (value: string) => void;
  onJsonPayloadChange: (value: string) => void;
  onMessageInputChange: (value: string) => void;
  onRun: () => void;
};

export function InputMethodsPanel({
  clinicalNote,
  destinationIntent,
  inputChannel,
  jsonPayload,
  messageInput,
  isRunning,
  onClinicalNoteChange,
  onDestinationIntentChange,
  onInputChannelChange,
  onJsonPayloadChange,
  onMessageInputChange,
  onRun,
}: InputMethodsPanelProps) {
  return (
    <section className="space-y-5">
      <div>
        <p className="eyebrow">Input methods</p>
        <h2 className="mt-2 text-lg font-semibold text-ink">
          Healthcare source payload
        </h2>
      </div>

      <label className="field">
        <span>Input channel</span>
        <input
          value={inputChannel}
          onChange={(event) => onInputChannelChange(event.target.value)}
        />
      </label>

      <label className="field">
        <span>Destination intent</span>
        <input
          value={destinationIntent}
          onChange={(event) => onDestinationIntentChange(event.target.value)}
        />
      </label>

      <label className="field">
        <span>Clinical note text input</span>
        <textarea
          rows={7}
          value={clinicalNote}
          onChange={(event) => onClinicalNoteChange(event.target.value)}
        />
      </label>

      <label className="field">
        <span>WhatsApp-style message input</span>
        <textarea
          rows={4}
          value={messageInput}
          onChange={(event) => onMessageInputChange(event.target.value)}
        />
      </label>

      <label className="field">
        <span>JSON API payload textarea</span>
        <textarea
          rows={7}
          value={jsonPayload}
          onChange={(event) => onJsonPayloadChange(event.target.value)}
        />
      </label>

      <div className="rounded border border-dashed border-line bg-white px-4 py-4">
        <p className="text-sm font-medium text-ink">CSV/Excel upload</p>
        <p className="mt-1 text-sm text-muted">
          Batch intake placeholder for future file-based middleware runs.
        </p>
        <button className="mt-4 rounded border border-line px-3 py-2 text-sm text-muted" disabled>
          Upload placeholder
        </button>
      </div>

      <button
        className="w-full rounded bg-ink px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-muted"
        disabled={isRunning}
        onClick={onRun}
        type="button"
      >
        {isRunning ? "Running middleware..." : "Run Middleware Demo"}
      </button>
    </section>
  );
}

