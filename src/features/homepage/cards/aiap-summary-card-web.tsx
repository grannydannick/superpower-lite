import { DigitalTwinPreviewMobile } from '../components/digital-twin-preview-mobile';

import { ScoreCards } from './score-cards';

export const AiapSummaryCardWeb = () => {
  return (
    <div>
      {/* Mobile digital twin preview */}
      <div className="lg:hidden">
        <DigitalTwinPreviewMobile />
      </div>

      <ScoreCards />
    </div>
  );
};
