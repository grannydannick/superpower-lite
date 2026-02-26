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
  'use no memo';

  const { RiveComponent, rive } = useRive({
    src: '/animations/superpower_ai.riv',
    autoplay: true,
    artboard: 'superpower-ai',
    stateMachines: 'states',
  });

  useEffect(() => {
    if (rive == null) return;

    const inputs = rive.stateMachineInputs('states');
    if (!inputs) return;
    for (const input of inputs) {
      if (input.name === 'thinking') {
        const nextThinking = state === 'thinking';
        if (typeof input.value === 'boolean') {
          if (input.value !== nextThinking) {
            input.value = nextThinking;
          }
        }
      } else if (input.name === 'analyzing') {
        const nextAnalyzing = state === 'analyzing';
        if (typeof input.value === 'boolean') {
          if (input.value !== nextAnalyzing) {
            input.value = nextAnalyzing;
          }
        }
      }
    }
  }, [rive, state]);

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
