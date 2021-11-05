import {
  Adder,
  DocumentsFieldMappings,
  LabelList,
  NullSetter,
  Remover,
  SensitivityMatcher,
  Setter,
  StringToStringArrayMap,
} from './shared';

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
  trainingLabels:
    | Adder<LabelList[]>
    | Remover<LabelList[]>
    | Setter<LabelList[]>;
  activeClassifierId: Setter<number> | NullSetter;
}

export interface DocumentsPipeline {
  externalId: string;
  sensitivityMatcher: SensitivityMatcher;
  classifier: DocumentsPipelineClassifier;
}

export interface DocumentsPipelineClassifier {
  name?: string;
  trainingLabels: LabelList[];
  activeClassifierId?: number;
}
