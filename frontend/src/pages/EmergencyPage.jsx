import React from "react";

const EmergencyPage = () => {
  return (
    <div className="p-12 space-y-12">
      <h1 className="text-2xl font-bold text-red-600">Stress Relief Activities</h1>

      <div className="card p-11 border border-red-500 rounded-lg">
        <p className="text-muted-foreground">
          If you feel overwhelmed, anxious, or emotionally distressed, here are some
          calming and grounding activities you can try right now.
        </p>

        <p className="mt-4 font-semibold text-red-500">
          ⚠️ This page does NOT replace professional help but provides immediate
          calming resources.
        </p>

        <h2 className="mt-4 font-bold text-lg text-foreground">Stress Relief Activities</h2>

        <ul className="list-disc ml-5 space-y-2 text-primary-600 font-medium">
          <li>
            🎨{" "}
            <a
              href="https://sketch.io/sketchpad/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              Online Coloring + Drawing
            </a>{" "}
            — Create art, doodle, or color to relax your mind.
          </li>

          <li>
            🌿{" "}
            <a
              href="https://neal.fun/ambient-chaos/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              Ambient Nature Sounds
            </a>{" "}
            — Mix soothing sounds like rain, waves, and wind.
          </li>

          <li>
            😌{" "}
            <a
              href="https://www.calm.com/breathe"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              Guided Breathing Exercise
            </a>{" "}
            — Follow a smooth animation to calm your breath.
          </li>

          <li>
            🧘{" "}
            <a
              href="https://www.mindful.org/free-mindfulness-apps/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              Simple Mindfulness Activities
            </a>{" "}
            — Quick grounding and mindfulness techniques.
          </li>

          <li>
            💭{" "}
            <a
              href="https://thenicestplace.net/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              Uplifting & Comforting Messages
            </a>{" "}
            — Feel supported with kind messages.
          </li>
        </ul>

        <p className="mt-6 text-muted-foreground">
          Take slow breaths, drink some water, and give yourself a quiet moment.
          You are not alone — your feelings matter and you deserve care.
        </p>
      </div>
    </div>
  );
};

export default EmergencyPage;
