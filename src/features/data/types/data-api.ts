import type { operations } from '@/orpc/types.generated';
import type { Biomarker } from '@/types/api';

type SummaryResponse =
  operations['data.summary']['responses'][200]['content']['application/json'];
export type DataSummaryCategory = SummaryResponse['categories'][number];

type BiomarkersResponse =
  operations['data.biomarkers']['responses'][200]['content']['application/json'];
type RawDataBiomarker = BiomarkersResponse['biomarkers'][number];
export type DataBiomarker = Omit<RawDataBiomarker, 'observation'> & {
  observation?: Biomarker;
};
