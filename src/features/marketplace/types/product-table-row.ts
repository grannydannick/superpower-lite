export type ProductPrice = {
  amount: number;
  currency: string;
};

export type ProductTableRow = {
  id: string;
  slug: string;
  name: string;
  title: string;
  type: 'diagnostic_test' | 'prescription';
  subtitle?: string | null;
  status: 'draft' | 'published' | 'archived';
  shortDescription: string | null;
  description: string | null;
  tags: { id: string; name: string; slug: string; title: string }[];
  image: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  prices?: ProductPrice[];
  legacy?: {
    id: string;
    description: string | null;
    active: boolean;
    bloodTubeCount: number | null;
  };
};
