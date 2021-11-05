import {
  Adder,
  NullSetter,
  Remover,
  Setter,
  StringToStringArrayMap,
} from './shared';
import { Label } from '@cognite/sdk';

export interface SensitivityMatcher {
  matchLists: StringToStringArrayMap;
  fieldMappings: DocumentsFieldMappings;
  filterPasswords?: boolean;
  sensitiveSecurityCategory?: number;
  restrictToSources?: string[];
}

export interface DocumentsFieldMappings {
  title?: string[];
  author?: string[];
  mimeType?: string[];
  type?: string[];
  labelsExternalIds?: string[];
  sourceFile?: DocumentsSourceFile;
}

export interface DocumentsSourceFile {
  name?: string[];
  directory?: string[];
  content?: string[];
  metadata?: StringToStringArrayMap;
}

export interface UpdateDocumentsPipeline {
  externalId: string;
  sensitivityMatcher?: UpdateDocumentsPipelineSensitivityMatcher;
  classifier?: UpdateDocumentsPipelineClassifier;
}

export interface UpdateDocumentsPipelineSensitivityMatcher {
  matchLists?:
    | Adder<StringToStringArrayMap>
    | Setter<StringToStringArrayMap>
    | Remover<string[]>;
  fieldMappings?: Setter<DocumentsFieldMappings>;
  filterPasswords?: Setter<boolean>;
  sensitiveSecurityCategory?: Setter<boolean> | NullSetter;
  restrictToSources?: Adder<string[]> | Remover<string[]> | Setter<string[]>;
}

export interface UpdateDocumentsPipelineClassifier {
  name?: Setter<string>;
  trainingLabels: Adder<Label[]> | Remover<Label[]> | Setter<Label[]>;
  activeClassifierId: Setter<number> | NullSetter;
}

export interface DocumentsPipeline {
  externalId: string;
  sensitivityMatcher: SensitivityMatcher;
  classifier: DocumentsPipelineClassifier;
}

export interface DocumentsPipelineClassifier {
  name?: string;
  trainingLabels: Label[];
  activeClassifierId?: number;
}
