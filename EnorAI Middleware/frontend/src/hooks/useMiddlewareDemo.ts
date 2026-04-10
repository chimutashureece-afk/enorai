"use client";

import { useMemo, useState } from "react";

import { runMiddlewareDemo } from "@/lib/middleware/client";
import {
  DEFAULT_CLINICAL_NOTE,
  DEFAULT_DESTINATION_INTENT,
  DEFAULT_INPUT_CHANNEL,
  DEFAULT_MESSAGE_INPUT,
  DEFAULT_PATIENT_CONTEXT,
} from "@/lib/middleware/demo-inputs";
import { parsePatientContext } from "@/lib/middleware/patient-context";
import {
  PIPELINE_STAGES,
  buildPipelineStages,
} from "@/lib/middleware/pipeline";
import type {
  MiddlewareRunRequest,
  MiddlewareRunResponse,
} from "@/lib/middleware/types";

export function useMiddlewareDemo() {
  const [clinicalNote, setClinicalNote] = useState(DEFAULT_CLINICAL_NOTE);
  const [messageInput, setMessageInput] = useState(DEFAULT_MESSAGE_INPUT);
  const [jsonPayload, setJsonPayload] = useState(DEFAULT_PATIENT_CONTEXT);
  const [inputChannel, setInputChannel] = useState(DEFAULT_INPUT_CHANNEL);
  const [destinationIntent, setDestinationIntent] = useState(
    DEFAULT_DESTINATION_INTENT,
  );
  const [activeStageIndex, setActiveStageIndex] = useState<number | null>(null);
  const [result, setResult] = useState<MiddlewareRunResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const stages = useMemo(
    () => buildPipelineStages({ activeStageIndex, isRunning, result }),
    [activeStageIndex, isRunning, result],
  );

  async function runDemo() {
    setIsRunning(true);
    setError(null);
    setResult(null);
    setActiveStageIndex(0);

    const interval = setInterval(() => {
      setActiveStageIndex((current) => {
        if (current === null) {
          return 0;
        }

        return Math.min(current + 1, PIPELINE_STAGES.length - 1);
      });
    }, 220);

    try {
      const payload: MiddlewareRunRequest = {
        input_channel: inputChannel,
        raw_payload: `${clinicalNote}\n\n${messageInput}`,
        patient_context: parsePatientContext(jsonPayload),
        destination_intent: destinationIntent,
      };
      const response = await runMiddlewareDemo(payload);
      setResult(response);
      setActiveStageIndex(PIPELINE_STAGES.length - 1);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to run middleware demo.";
      setError(message);
      setActiveStageIndex(null);
    } finally {
      clearInterval(interval);
      setIsRunning(false);
    }
  }

  return {
    clinicalNote,
    destinationIntent,
    error,
    inputChannel,
    isRunning,
    jsonPayload,
    messageInput,
    result,
    stages,
    runDemo,
    setClinicalNote,
    setDestinationIntent,
    setInputChannel,
    setJsonPayload,
    setMessageInput,
  };
}

