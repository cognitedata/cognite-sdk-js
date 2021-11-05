import { CogniteInternalId } from "@cognite/sdk-core";


export interface ClassifierName {
  name?: string;
}

export interface ClassifierMetrics {
  precision?: number;
  recall?: number;
  f1Score?: number;
  confusionMatrix?: number[][];
  labels?: string[];
}

export interface Classifier extends ClassifierName {
  id: CogniteInternalId;
  projectId?: number;
  createdAt?: number;
  status?: string;
  active?: boolean;
  metrics?: ClassifierMetrics;
}
