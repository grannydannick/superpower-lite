import { useRive } from '@rive-app/react-canvas-lite';
import { useEffect } from 'react';

/**
 * The animated AI icon component that displays different animation states:
 * - idle: Default resting state
 * - analyzing: When processing a document, e.g. image as attachment
 * - thinking: When generating a response
 * @param state - The state of the animation
 * @returns The animated icon
 */
export const AnimatedIcon = ({
  state,
  size = 24,
  className,
}: {
  state: 'idle' | 'analyzing' | 'thinking';
  size?: number;
  className?: string;
}) => {
  const { RiveComponent, rive } = useRive({
    src: '/animations/superpower_ai.riv',
    autoplay: true,
    artboard: 'superpower-ai',
    stateMachines: 'states',
  });

  useEffect(() => {
    if (rive) {
      // Get inputs for the state machine
      const inputs = rive.stateMachineInputs('states');

      // Find boolean inputs for each state
      const thinkingInput = inputs.find((i) => i.name === 'thinking');
      const analyzingInput = inputs.find((i) => i.name === 'analyzing');

      if (thinkingInput && analyzingInput) {
        // Reset all states first
        thinkingInput.value = false;
        analyzingInput.value = false;

        // Set the active state based on the current state
        if (state === 'thinking') {
          thinkingInput.value = true;
        } else if (state === 'analyzing') {
          analyzingInput.value = true;
        }
      }
    }
  }, [state, rive]);

  return (
    <div
      style={{
        width: size,
        height: size,
      }}
      className={className}
    >
      <RiveComponent />
    </div>
  );
};
