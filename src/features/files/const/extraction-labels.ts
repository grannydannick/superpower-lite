import type { FileExtraction, FileUploadClassification } from '@/types/api';

export const FILE_CLASSIFICATION_LABELS: Record<
  FileUploadClassification,
  string
> = {
  lab_results_pathology: 'Lab Results',
  diagnostic_reports: 'Diagnostic Report',
  clinical_notes: 'Clinical Notes',
  medical_images: 'Medical Image',
  medical_other: 'Medical Document',
  non_medical: 'Document',
};

export const FILE_EXTRACTION_PHASE_LABELS: Record<
  NonNullable<FileExtraction['phase']>,
  string
> = {
  classifying: 'Classifying',
  extracting: 'Extracting',
  validating: 'Validating',
  writing: 'Writing',
};
