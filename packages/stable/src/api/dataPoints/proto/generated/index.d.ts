import * as $protobuf from "protobufjs";
import Long = require("long");

/** Namespace com. */
export namespace com {

    /** Namespace cognite. */
    namespace cognite {

        /** Namespace v1. */
        namespace v1 {

            /** Namespace timeseries. */
            namespace timeseries {

                /** Namespace proto. */
                namespace proto {

                    /**
                     * Properties of a Status.
                     * @deprecated Use com.cognite.v1.timeseries.proto.Status.$Properties instead.
                     */
                    interface IStatus extends com.cognite.v1.timeseries.proto.Status.$Properties {
                    }

                    /** Represents a Status. */
                    class Status {

                        /**
                         * Constructs a new Status.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: com.cognite.v1.timeseries.proto.Status.$Properties);

                        /** Unknown fields preserved while decoding */
                        $unknowns?: Uint8Array[];

                        /** Status code. */
                        code: Long;

                        /** Status symbol. */
                        symbol: string;

                        /**
                         * Encodes the specified Status message. Does not implicitly {@link com.cognite.v1.timeseries.proto.Status.verify|verify} messages.
                         * @param message Status message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        static encode(message: com.cognite.v1.timeseries.proto.Status.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes a Status message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns {com.cognite.v1.timeseries.proto.Status & com.cognite.v1.timeseries.proto.Status.$Shape} Status
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): com.cognite.v1.timeseries.proto.Status & com.cognite.v1.timeseries.proto.Status.$Shape;

                        /**
                         * Gets the type url for Status
                         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                         * @returns The type url
                         */
                        static getTypeUrl(prefix?: string): string;
                    }

                    namespace Status {

                        /** Properties of a Status. */
                        interface $Properties {

                            /** Status code */
                            code?: (Long|null);

                            /** Status symbol */
                            symbol?: (string|null);

                            /** Unknown fields preserved while decoding */
                            $unknowns?: Uint8Array[];
                        }

                        /** Shape of a Status. */
                        type $Shape = com.cognite.v1.timeseries.proto.Status.$Properties;
                    }

                    /**
                     * Properties of a NumericDatapoint.
                     * @deprecated Use com.cognite.v1.timeseries.proto.NumericDatapoint.$Properties instead.
                     */
                    interface INumericDatapoint extends com.cognite.v1.timeseries.proto.NumericDatapoint.$Properties {
                    }

                    /** Represents a NumericDatapoint. */
                    class NumericDatapoint {

                        /**
                         * Constructs a new NumericDatapoint.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: com.cognite.v1.timeseries.proto.NumericDatapoint.$Properties);

                        /** Unknown fields preserved while decoding */
                        $unknowns?: Uint8Array[];

                        /** NumericDatapoint timestamp. */
                        timestamp: Long;

                        /** NumericDatapoint value. */
                        value: number;

                        /** NumericDatapoint status. */
                        status?: (com.cognite.v1.timeseries.proto.Status.$Properties|null);

                        /** NumericDatapoint nullValue. */
                        nullValue: boolean;

                        /**
                         * Encodes the specified NumericDatapoint message. Does not implicitly {@link com.cognite.v1.timeseries.proto.NumericDatapoint.verify|verify} messages.
                         * @param message NumericDatapoint message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        static encode(message: com.cognite.v1.timeseries.proto.NumericDatapoint.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes a NumericDatapoint message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns {com.cognite.v1.timeseries.proto.NumericDatapoint & com.cognite.v1.timeseries.proto.NumericDatapoint.$Shape} NumericDatapoint
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): com.cognite.v1.timeseries.proto.NumericDatapoint & com.cognite.v1.timeseries.proto.NumericDatapoint.$Shape;

                        /**
                         * Gets the type url for NumericDatapoint
                         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                         * @returns The type url
                         */
                        static getTypeUrl(prefix?: string): string;
                    }

                    namespace NumericDatapoint {

                        /** Properties of a NumericDatapoint. */
                        interface $Properties {

                            /** NumericDatapoint timestamp */
                            timestamp?: (Long|null);

                            /** NumericDatapoint value */
                            value?: (number|null);

                            /** NumericDatapoint status */
                            status?: (com.cognite.v1.timeseries.proto.Status.$Properties|null);

                            /** NumericDatapoint nullValue */
                            nullValue?: (boolean|null);

                            /** Unknown fields preserved while decoding */
                            $unknowns?: Uint8Array[];
                        }

                        /** Shape of a NumericDatapoint. */
                        type $Shape = com.cognite.v1.timeseries.proto.NumericDatapoint.$Properties;
                    }

                    /**
                     * Properties of a NumericDatapoints.
                     * @deprecated Use com.cognite.v1.timeseries.proto.NumericDatapoints.$Properties instead.
                     */
                    interface INumericDatapoints extends com.cognite.v1.timeseries.proto.NumericDatapoints.$Properties {
                    }

                    /** Represents a NumericDatapoints. */
                    class NumericDatapoints {

                        /**
                         * Constructs a new NumericDatapoints.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: com.cognite.v1.timeseries.proto.NumericDatapoints.$Properties);

                        /** Unknown fields preserved while decoding */
                        $unknowns?: Uint8Array[];

                        /** NumericDatapoints datapoints. */
                        datapoints: com.cognite.v1.timeseries.proto.NumericDatapoint.$Properties[];

                        /**
                         * Encodes the specified NumericDatapoints message. Does not implicitly {@link com.cognite.v1.timeseries.proto.NumericDatapoints.verify|verify} messages.
                         * @param message NumericDatapoints message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        static encode(message: com.cognite.v1.timeseries.proto.NumericDatapoints.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes a NumericDatapoints message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns {com.cognite.v1.timeseries.proto.NumericDatapoints & com.cognite.v1.timeseries.proto.NumericDatapoints.$Shape} NumericDatapoints
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): com.cognite.v1.timeseries.proto.NumericDatapoints & com.cognite.v1.timeseries.proto.NumericDatapoints.$Shape;

                        /**
                         * Gets the type url for NumericDatapoints
                         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                         * @returns The type url
                         */
                        static getTypeUrl(prefix?: string): string;
                    }

                    namespace NumericDatapoints {

                        /** Properties of a NumericDatapoints. */
                        interface $Properties {

                            /** NumericDatapoints datapoints */
                            datapoints?: (com.cognite.v1.timeseries.proto.NumericDatapoint.$Properties[]|null);

                            /** Unknown fields preserved while decoding */
                            $unknowns?: Uint8Array[];
                        }

                        /** Shape of a NumericDatapoints. */
                        type $Shape = com.cognite.v1.timeseries.proto.NumericDatapoints.$Properties;
                    }

                    /**
                     * Properties of a StringDatapoint.
                     * @deprecated Use com.cognite.v1.timeseries.proto.StringDatapoint.$Properties instead.
                     */
                    interface IStringDatapoint extends com.cognite.v1.timeseries.proto.StringDatapoint.$Properties {
                    }

                    /** Represents a StringDatapoint. */
                    class StringDatapoint {

                        /**
                         * Constructs a new StringDatapoint.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: com.cognite.v1.timeseries.proto.StringDatapoint.$Properties);

                        /** Unknown fields preserved while decoding */
                        $unknowns?: Uint8Array[];

                        /** StringDatapoint timestamp. */
                        timestamp: Long;

                        /** StringDatapoint value. */
                        value: string;

                        /** StringDatapoint status. */
                        status?: (com.cognite.v1.timeseries.proto.Status.$Properties|null);

                        /** StringDatapoint nullValue. */
                        nullValue: boolean;

                        /**
                         * Encodes the specified StringDatapoint message. Does not implicitly {@link com.cognite.v1.timeseries.proto.StringDatapoint.verify|verify} messages.
                         * @param message StringDatapoint message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        static encode(message: com.cognite.v1.timeseries.proto.StringDatapoint.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes a StringDatapoint message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns {com.cognite.v1.timeseries.proto.StringDatapoint & com.cognite.v1.timeseries.proto.StringDatapoint.$Shape} StringDatapoint
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): com.cognite.v1.timeseries.proto.StringDatapoint & com.cognite.v1.timeseries.proto.StringDatapoint.$Shape;

                        /**
                         * Gets the type url for StringDatapoint
                         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                         * @returns The type url
                         */
                        static getTypeUrl(prefix?: string): string;
                    }

                    namespace StringDatapoint {

                        /** Properties of a StringDatapoint. */
                        interface $Properties {

                            /** StringDatapoint timestamp */
                            timestamp?: (Long|null);

                            /** StringDatapoint value */
                            value?: (string|null);

                            /** StringDatapoint status */
                            status?: (com.cognite.v1.timeseries.proto.Status.$Properties|null);

                            /** StringDatapoint nullValue */
                            nullValue?: (boolean|null);

                            /** Unknown fields preserved while decoding */
                            $unknowns?: Uint8Array[];
                        }

                        /** Shape of a StringDatapoint. */
                        type $Shape = com.cognite.v1.timeseries.proto.StringDatapoint.$Properties;
                    }

                    /**
                     * Properties of a StringDatapoints.
                     * @deprecated Use com.cognite.v1.timeseries.proto.StringDatapoints.$Properties instead.
                     */
                    interface IStringDatapoints extends com.cognite.v1.timeseries.proto.StringDatapoints.$Properties {
                    }

                    /** Represents a StringDatapoints. */
                    class StringDatapoints {

                        /**
                         * Constructs a new StringDatapoints.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: com.cognite.v1.timeseries.proto.StringDatapoints.$Properties);

                        /** Unknown fields preserved while decoding */
                        $unknowns?: Uint8Array[];

                        /** StringDatapoints datapoints. */
                        datapoints: com.cognite.v1.timeseries.proto.StringDatapoint.$Properties[];

                        /**
                         * Encodes the specified StringDatapoints message. Does not implicitly {@link com.cognite.v1.timeseries.proto.StringDatapoints.verify|verify} messages.
                         * @param message StringDatapoints message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        static encode(message: com.cognite.v1.timeseries.proto.StringDatapoints.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes a StringDatapoints message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns {com.cognite.v1.timeseries.proto.StringDatapoints & com.cognite.v1.timeseries.proto.StringDatapoints.$Shape} StringDatapoints
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): com.cognite.v1.timeseries.proto.StringDatapoints & com.cognite.v1.timeseries.proto.StringDatapoints.$Shape;

                        /**
                         * Gets the type url for StringDatapoints
                         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                         * @returns The type url
                         */
                        static getTypeUrl(prefix?: string): string;
                    }

                    namespace StringDatapoints {

                        /** Properties of a StringDatapoints. */
                        interface $Properties {

                            /** StringDatapoints datapoints */
                            datapoints?: (com.cognite.v1.timeseries.proto.StringDatapoint.$Properties[]|null);

                            /** Unknown fields preserved while decoding */
                            $unknowns?: Uint8Array[];
                        }

                        /** Shape of a StringDatapoints. */
                        type $Shape = com.cognite.v1.timeseries.proto.StringDatapoints.$Properties;
                    }

                    /**
                     * Properties of a StateDatapoint.
                     * @deprecated Use com.cognite.v1.timeseries.proto.StateDatapoint.$Properties instead.
                     */
                    interface IStateDatapoint extends com.cognite.v1.timeseries.proto.StateDatapoint.$Properties {
                    }

                    /** Represents a StateDatapoint. */
                    class StateDatapoint {

                        /**
                         * Constructs a new StateDatapoint.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: com.cognite.v1.timeseries.proto.StateDatapoint.$Properties);

                        /** Unknown fields preserved while decoding */
                        $unknowns?: Uint8Array[];

                        /** StateDatapoint timestamp. */
                        timestamp: Long;

                        /** StateDatapoint numericValue. */
                        numericValue?: (Long|null);

                        /** StateDatapoint stringValue. */
                        stringValue?: (string|null);

                        /** StateDatapoint status. */
                        status?: (com.cognite.v1.timeseries.proto.Status.$Properties|null);

                        /**
                         * Encodes the specified StateDatapoint message. Does not implicitly {@link com.cognite.v1.timeseries.proto.StateDatapoint.verify|verify} messages.
                         * @param message StateDatapoint message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        static encode(message: com.cognite.v1.timeseries.proto.StateDatapoint.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes a StateDatapoint message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns {com.cognite.v1.timeseries.proto.StateDatapoint & com.cognite.v1.timeseries.proto.StateDatapoint.$Shape} StateDatapoint
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): com.cognite.v1.timeseries.proto.StateDatapoint & com.cognite.v1.timeseries.proto.StateDatapoint.$Shape;

                        /**
                         * Gets the type url for StateDatapoint
                         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                         * @returns The type url
                         */
                        static getTypeUrl(prefix?: string): string;
                    }

                    namespace StateDatapoint {

                        /** Properties of a StateDatapoint. */
                        interface $Properties {

                            /** StateDatapoint timestamp */
                            timestamp?: (Long|null);

                            /** StateDatapoint numericValue */
                            numericValue?: (Long|null);

                            /** StateDatapoint stringValue */
                            stringValue?: (string|null);

                            /** StateDatapoint status */
                            status?: (com.cognite.v1.timeseries.proto.Status.$Properties|null);

                            /** Unknown fields preserved while decoding */
                            $unknowns?: Uint8Array[];
                        }

                        /** Shape of a StateDatapoint. */
                        type $Shape = com.cognite.v1.timeseries.proto.StateDatapoint.$Properties;
                    }

                    /**
                     * Properties of a StateDatapoints.
                     * @deprecated Use com.cognite.v1.timeseries.proto.StateDatapoints.$Properties instead.
                     */
                    interface IStateDatapoints extends com.cognite.v1.timeseries.proto.StateDatapoints.$Properties {
                    }

                    /** Represents a StateDatapoints. */
                    class StateDatapoints {

                        /**
                         * Constructs a new StateDatapoints.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: com.cognite.v1.timeseries.proto.StateDatapoints.$Properties);

                        /** Unknown fields preserved while decoding */
                        $unknowns?: Uint8Array[];

                        /** StateDatapoints datapoints. */
                        datapoints: com.cognite.v1.timeseries.proto.StateDatapoint.$Properties[];

                        /**
                         * Encodes the specified StateDatapoints message. Does not implicitly {@link com.cognite.v1.timeseries.proto.StateDatapoints.verify|verify} messages.
                         * @param message StateDatapoints message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        static encode(message: com.cognite.v1.timeseries.proto.StateDatapoints.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes a StateDatapoints message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns {com.cognite.v1.timeseries.proto.StateDatapoints & com.cognite.v1.timeseries.proto.StateDatapoints.$Shape} StateDatapoints
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): com.cognite.v1.timeseries.proto.StateDatapoints & com.cognite.v1.timeseries.proto.StateDatapoints.$Shape;

                        /**
                         * Gets the type url for StateDatapoints
                         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                         * @returns The type url
                         */
                        static getTypeUrl(prefix?: string): string;
                    }

                    namespace StateDatapoints {

                        /** Properties of a StateDatapoints. */
                        interface $Properties {

                            /** StateDatapoints datapoints */
                            datapoints?: (com.cognite.v1.timeseries.proto.StateDatapoint.$Properties[]|null);

                            /** Unknown fields preserved while decoding */
                            $unknowns?: Uint8Array[];
                        }

                        /** Shape of a StateDatapoints. */
                        type $Shape = com.cognite.v1.timeseries.proto.StateDatapoints.$Properties;
                    }

                    /**
                     * Properties of an AggregateDatapoint.
                     * @deprecated Use com.cognite.v1.timeseries.proto.AggregateDatapoint.$Properties instead.
                     */
                    interface IAggregateDatapoint extends com.cognite.v1.timeseries.proto.AggregateDatapoint.$Properties {
                    }

                    /** Represents an AggregateDatapoint. */
                    class AggregateDatapoint {

                        /**
                         * Constructs a new AggregateDatapoint.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: com.cognite.v1.timeseries.proto.AggregateDatapoint.$Properties);

                        /** Unknown fields preserved while decoding */
                        $unknowns?: Uint8Array[];

                        /** AggregateDatapoint timestamp. */
                        timestamp: Long;

                        /** AggregateDatapoint average. */
                        average: number;

                        /** AggregateDatapoint max. */
                        max: number;

                        /** AggregateDatapoint min. */
                        min: number;

                        /** AggregateDatapoint count. */
                        count: number;

                        /** AggregateDatapoint sum. */
                        sum: number;

                        /** AggregateDatapoint interpolation. */
                        interpolation: number;

                        /** AggregateDatapoint stepInterpolation. */
                        stepInterpolation: number;

                        /** AggregateDatapoint continuousVariance. */
                        continuousVariance: number;

                        /** AggregateDatapoint discreteVariance. */
                        discreteVariance: number;

                        /** AggregateDatapoint totalVariation. */
                        totalVariation: number;

                        /** AggregateDatapoint countGood. */
                        countGood: number;

                        /** AggregateDatapoint countUncertain. */
                        countUncertain: number;

                        /** AggregateDatapoint countBad. */
                        countBad: number;

                        /** AggregateDatapoint durationGood. */
                        durationGood: number;

                        /** AggregateDatapoint durationUncertain. */
                        durationUncertain: number;

                        /** AggregateDatapoint durationBad. */
                        durationBad: number;

                        /** AggregateDatapoint maxDatapoint. */
                        maxDatapoint?: (com.cognite.v1.timeseries.proto.NumericDatapoint.$Properties|null);

                        /** AggregateDatapoint minDatapoint. */
                        minDatapoint?: (com.cognite.v1.timeseries.proto.NumericDatapoint.$Properties|null);

                        /** AggregateDatapoint stateAggregates. */
                        stateAggregates: com.cognite.v1.timeseries.proto.StateAggregate.$Properties[];

                        /**
                         * Encodes the specified AggregateDatapoint message. Does not implicitly {@link com.cognite.v1.timeseries.proto.AggregateDatapoint.verify|verify} messages.
                         * @param message AggregateDatapoint message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        static encode(message: com.cognite.v1.timeseries.proto.AggregateDatapoint.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes an AggregateDatapoint message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns {com.cognite.v1.timeseries.proto.AggregateDatapoint & com.cognite.v1.timeseries.proto.AggregateDatapoint.$Shape} AggregateDatapoint
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): com.cognite.v1.timeseries.proto.AggregateDatapoint & com.cognite.v1.timeseries.proto.AggregateDatapoint.$Shape;

                        /**
                         * Gets the type url for AggregateDatapoint
                         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                         * @returns The type url
                         */
                        static getTypeUrl(prefix?: string): string;
                    }

                    namespace AggregateDatapoint {

                        /** Properties of an AggregateDatapoint. */
                        interface $Properties {

                            /** AggregateDatapoint timestamp */
                            timestamp?: (Long|null);

                            /** AggregateDatapoint average */
                            average?: (number|null);

                            /** AggregateDatapoint max */
                            max?: (number|null);

                            /** AggregateDatapoint min */
                            min?: (number|null);

                            /** AggregateDatapoint count */
                            count?: (number|null);

                            /** AggregateDatapoint sum */
                            sum?: (number|null);

                            /** AggregateDatapoint interpolation */
                            interpolation?: (number|null);

                            /** AggregateDatapoint stepInterpolation */
                            stepInterpolation?: (number|null);

                            /** AggregateDatapoint continuousVariance */
                            continuousVariance?: (number|null);

                            /** AggregateDatapoint discreteVariance */
                            discreteVariance?: (number|null);

                            /** AggregateDatapoint totalVariation */
                            totalVariation?: (number|null);

                            /** AggregateDatapoint countGood */
                            countGood?: (number|null);

                            /** AggregateDatapoint countUncertain */
                            countUncertain?: (number|null);

                            /** AggregateDatapoint countBad */
                            countBad?: (number|null);

                            /** AggregateDatapoint durationGood */
                            durationGood?: (number|null);

                            /** AggregateDatapoint durationUncertain */
                            durationUncertain?: (number|null);

                            /** AggregateDatapoint durationBad */
                            durationBad?: (number|null);

                            /** AggregateDatapoint maxDatapoint */
                            maxDatapoint?: (com.cognite.v1.timeseries.proto.NumericDatapoint.$Properties|null);

                            /** AggregateDatapoint minDatapoint */
                            minDatapoint?: (com.cognite.v1.timeseries.proto.NumericDatapoint.$Properties|null);

                            /** AggregateDatapoint stateAggregates */
                            stateAggregates?: (com.cognite.v1.timeseries.proto.StateAggregate.$Properties[]|null);

                            /** Unknown fields preserved while decoding */
                            $unknowns?: Uint8Array[];
                        }

                        /** Shape of an AggregateDatapoint. */
                        type $Shape = com.cognite.v1.timeseries.proto.AggregateDatapoint.$Properties;
                    }

                    /**
                     * Properties of an AggregateDatapoints.
                     * @deprecated Use com.cognite.v1.timeseries.proto.AggregateDatapoints.$Properties instead.
                     */
                    interface IAggregateDatapoints extends com.cognite.v1.timeseries.proto.AggregateDatapoints.$Properties {
                    }

                    /** Represents an AggregateDatapoints. */
                    class AggregateDatapoints {

                        /**
                         * Constructs a new AggregateDatapoints.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: com.cognite.v1.timeseries.proto.AggregateDatapoints.$Properties);

                        /** Unknown fields preserved while decoding */
                        $unknowns?: Uint8Array[];

                        /** AggregateDatapoints datapoints. */
                        datapoints: com.cognite.v1.timeseries.proto.AggregateDatapoint.$Properties[];

                        /**
                         * Encodes the specified AggregateDatapoints message. Does not implicitly {@link com.cognite.v1.timeseries.proto.AggregateDatapoints.verify|verify} messages.
                         * @param message AggregateDatapoints message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        static encode(message: com.cognite.v1.timeseries.proto.AggregateDatapoints.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes an AggregateDatapoints message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns {com.cognite.v1.timeseries.proto.AggregateDatapoints & com.cognite.v1.timeseries.proto.AggregateDatapoints.$Shape} AggregateDatapoints
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): com.cognite.v1.timeseries.proto.AggregateDatapoints & com.cognite.v1.timeseries.proto.AggregateDatapoints.$Shape;

                        /**
                         * Gets the type url for AggregateDatapoints
                         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                         * @returns The type url
                         */
                        static getTypeUrl(prefix?: string): string;
                    }

                    namespace AggregateDatapoints {

                        /** Properties of an AggregateDatapoints. */
                        interface $Properties {

                            /** AggregateDatapoints datapoints */
                            datapoints?: (com.cognite.v1.timeseries.proto.AggregateDatapoint.$Properties[]|null);

                            /** Unknown fields preserved while decoding */
                            $unknowns?: Uint8Array[];
                        }

                        /** Shape of an AggregateDatapoints. */
                        type $Shape = com.cognite.v1.timeseries.proto.AggregateDatapoints.$Properties;
                    }

                    /**
                     * Properties of a StateAggregate.
                     * @deprecated Use com.cognite.v1.timeseries.proto.StateAggregate.$Properties instead.
                     */
                    interface IStateAggregate extends com.cognite.v1.timeseries.proto.StateAggregate.$Properties {
                    }

                    /** Represents a StateAggregate. */
                    class StateAggregate {

                        /**
                         * Constructs a new StateAggregate.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: com.cognite.v1.timeseries.proto.StateAggregate.$Properties);

                        /** Unknown fields preserved while decoding */
                        $unknowns?: Uint8Array[];

                        /** StateAggregate numericValue. */
                        numericValue: Long;

                        /** StateAggregate stringValue. */
                        stringValue?: (string|null);

                        /** StateAggregate stateCount. */
                        stateCount?: (Long|null);

                        /** StateAggregate stateTransitions. */
                        stateTransitions?: (Long|null);

                        /** StateAggregate stateDuration. */
                        stateDuration?: (Long|null);

                        /**
                         * Encodes the specified StateAggregate message. Does not implicitly {@link com.cognite.v1.timeseries.proto.StateAggregate.verify|verify} messages.
                         * @param message StateAggregate message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        static encode(message: com.cognite.v1.timeseries.proto.StateAggregate.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes a StateAggregate message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns {com.cognite.v1.timeseries.proto.StateAggregate & com.cognite.v1.timeseries.proto.StateAggregate.$Shape} StateAggregate
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): com.cognite.v1.timeseries.proto.StateAggregate & com.cognite.v1.timeseries.proto.StateAggregate.$Shape;

                        /**
                         * Gets the type url for StateAggregate
                         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                         * @returns The type url
                         */
                        static getTypeUrl(prefix?: string): string;
                    }

                    namespace StateAggregate {

                        /** Properties of a StateAggregate. */
                        interface $Properties {

                            /** StateAggregate numericValue */
                            numericValue?: (Long|null);

                            /** StateAggregate stringValue */
                            stringValue?: (string|null);

                            /** StateAggregate stateCount */
                            stateCount?: (Long|null);

                            /** StateAggregate stateTransitions */
                            stateTransitions?: (Long|null);

                            /** StateAggregate stateDuration */
                            stateDuration?: (Long|null);

                            /** Unknown fields preserved while decoding */
                            $unknowns?: Uint8Array[];
                        }

                        /** Shape of a StateAggregate. */
                        type $Shape = com.cognite.v1.timeseries.proto.StateAggregate.$Properties;
                    }

                    /**
                     * Properties of an InstanceId.
                     * @deprecated Use com.cognite.v1.timeseries.proto.InstanceId.$Properties instead.
                     */
                    interface IInstanceId extends com.cognite.v1.timeseries.proto.InstanceId.$Properties {
                    }

                    /** Represents an InstanceId. */
                    class InstanceId {

                        /**
                         * Constructs a new InstanceId.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: com.cognite.v1.timeseries.proto.InstanceId.$Properties);

                        /** Unknown fields preserved while decoding */
                        $unknowns?: Uint8Array[];

                        /** InstanceId space. */
                        space: string;

                        /** InstanceId externalId. */
                        externalId: string;

                        /**
                         * Encodes the specified InstanceId message. Does not implicitly {@link com.cognite.v1.timeseries.proto.InstanceId.verify|verify} messages.
                         * @param message InstanceId message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        static encode(message: com.cognite.v1.timeseries.proto.InstanceId.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes an InstanceId message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns {com.cognite.v1.timeseries.proto.InstanceId & com.cognite.v1.timeseries.proto.InstanceId.$Shape} InstanceId
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): com.cognite.v1.timeseries.proto.InstanceId & com.cognite.v1.timeseries.proto.InstanceId.$Shape;

                        /**
                         * Gets the type url for InstanceId
                         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                         * @returns The type url
                         */
                        static getTypeUrl(prefix?: string): string;
                    }

                    namespace InstanceId {

                        /** Properties of an InstanceId. */
                        interface $Properties {

                            /** InstanceId space */
                            space?: (string|null);

                            /** InstanceId externalId */
                            externalId?: (string|null);

                            /** Unknown fields preserved while decoding */
                            $unknowns?: Uint8Array[];
                        }

                        /** Shape of an InstanceId. */
                        type $Shape = com.cognite.v1.timeseries.proto.InstanceId.$Properties;
                    }

                    /**
                     * Properties of a DataPointInsertionItem.
                     * @deprecated Use com.cognite.v1.timeseries.proto.DataPointInsertionItem.$Properties instead.
                     */
                    interface IDataPointInsertionItem extends com.cognite.v1.timeseries.proto.DataPointInsertionItem.$Properties {
                    }

                    /** Represents a DataPointInsertionItem. */
                    class DataPointInsertionItem {

                        /**
                         * Constructs a new DataPointInsertionItem.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: com.cognite.v1.timeseries.proto.DataPointInsertionItem.$Properties);

                        /** Unknown fields preserved while decoding */
                        $unknowns?: Uint8Array[];

                        /** DataPointInsertionItem id. */
                        id?: (Long|null);

                        /** DataPointInsertionItem externalId. */
                        externalId?: (string|null);

                        /** DataPointInsertionItem instanceId. */
                        instanceId?: (com.cognite.v1.timeseries.proto.InstanceId.$Properties|null);

                        /** DataPointInsertionItem numericDatapoints. */
                        numericDatapoints?: (com.cognite.v1.timeseries.proto.NumericDatapoints.$Properties|null);

                        /** DataPointInsertionItem stringDatapoints. */
                        stringDatapoints?: (com.cognite.v1.timeseries.proto.StringDatapoints.$Properties|null);

                        /** DataPointInsertionItem stateDatapoints. */
                        stateDatapoints?: (com.cognite.v1.timeseries.proto.StateDatapoints.$Properties|null);

                        /** DataPointInsertionItem timeSeriesReference. */
                        timeSeriesReference?: ("id"|"externalId"|"instanceId");

                        /** DataPointInsertionItem datapointType. */
                        datapointType?: ("numericDatapoints"|"stringDatapoints"|"stateDatapoints");

                        /**
                         * Encodes the specified DataPointInsertionItem message. Does not implicitly {@link com.cognite.v1.timeseries.proto.DataPointInsertionItem.verify|verify} messages.
                         * @param message DataPointInsertionItem message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        static encode(message: com.cognite.v1.timeseries.proto.DataPointInsertionItem.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes a DataPointInsertionItem message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns {com.cognite.v1.timeseries.proto.DataPointInsertionItem & com.cognite.v1.timeseries.proto.DataPointInsertionItem.$Shape} DataPointInsertionItem
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): com.cognite.v1.timeseries.proto.DataPointInsertionItem & com.cognite.v1.timeseries.proto.DataPointInsertionItem.$Shape;

                        /**
                         * Gets the type url for DataPointInsertionItem
                         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                         * @returns The type url
                         */
                        static getTypeUrl(prefix?: string): string;
                    }

                    namespace DataPointInsertionItem {

                        /** Properties of a DataPointInsertionItem. */
                        interface $Properties {

                            /** DataPointInsertionItem id */
                            id?: (Long|null);

                            /** DataPointInsertionItem externalId */
                            externalId?: (string|null);

                            /** DataPointInsertionItem instanceId */
                            instanceId?: (com.cognite.v1.timeseries.proto.InstanceId.$Properties|null);

                            /** DataPointInsertionItem numericDatapoints */
                            numericDatapoints?: (com.cognite.v1.timeseries.proto.NumericDatapoints.$Properties|null);

                            /** DataPointInsertionItem stringDatapoints */
                            stringDatapoints?: (com.cognite.v1.timeseries.proto.StringDatapoints.$Properties|null);

                            /** DataPointInsertionItem stateDatapoints */
                            stateDatapoints?: (com.cognite.v1.timeseries.proto.StateDatapoints.$Properties|null);

                            /** DataPointInsertionItem timeSeriesReference */
                            timeSeriesReference?: ("id"|"externalId"|"instanceId");

                            /** DataPointInsertionItem datapointType */
                            datapointType?: ("numericDatapoints"|"stringDatapoints"|"stateDatapoints");

                            /** Unknown fields preserved while decoding */
                            $unknowns?: Uint8Array[];
                        }

                        /** Narrowed shape of a DataPointInsertionItem. */
                        type $Shape = {
  id?: Long|null;
  externalId?: string|null;
  instanceId?: com.cognite.v1.timeseries.proto.InstanceId.$Shape|null;
  numericDatapoints?: com.cognite.v1.timeseries.proto.NumericDatapoints.$Shape|null;
  stringDatapoints?: com.cognite.v1.timeseries.proto.StringDatapoints.$Shape|null;
  stateDatapoints?: com.cognite.v1.timeseries.proto.StateDatapoints.$Shape|null;
  $unknowns?: Uint8Array[];
} & (
  ({ timeSeriesReference?: undefined; id?: null; externalId?: null; instanceId?: null }|{ timeSeriesReference?: "id"; id: Long; externalId?: null; instanceId?: null }|{ timeSeriesReference?: "externalId"; id?: null; externalId: string; instanceId?: null }|{ timeSeriesReference?: "instanceId"; id?: null; externalId?: null; instanceId: com.cognite.v1.timeseries.proto.InstanceId.$Shape })
) & (
  ({ datapointType?: undefined; numericDatapoints?: null; stringDatapoints?: null; stateDatapoints?: null }|{ datapointType?: "numericDatapoints"; numericDatapoints: com.cognite.v1.timeseries.proto.NumericDatapoints.$Shape; stringDatapoints?: null; stateDatapoints?: null }|{ datapointType?: "stringDatapoints"; numericDatapoints?: null; stringDatapoints: com.cognite.v1.timeseries.proto.StringDatapoints.$Shape; stateDatapoints?: null }|{ datapointType?: "stateDatapoints"; numericDatapoints?: null; stringDatapoints?: null; stateDatapoints: com.cognite.v1.timeseries.proto.StateDatapoints.$Shape })
);
                    }

                    /**
                     * Properties of a DataPointInsertionRequest.
                     * @deprecated Use com.cognite.v1.timeseries.proto.DataPointInsertionRequest.$Properties instead.
                     */
                    interface IDataPointInsertionRequest extends com.cognite.v1.timeseries.proto.DataPointInsertionRequest.$Properties {
                    }

                    /** Represents a DataPointInsertionRequest. */
                    class DataPointInsertionRequest {

                        /**
                         * Constructs a new DataPointInsertionRequest.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: com.cognite.v1.timeseries.proto.DataPointInsertionRequest.$Properties);

                        /** Unknown fields preserved while decoding */
                        $unknowns?: Uint8Array[];

                        /** DataPointInsertionRequest items. */
                        items: com.cognite.v1.timeseries.proto.DataPointInsertionItem.$Properties[];

                        /**
                         * Encodes the specified DataPointInsertionRequest message. Does not implicitly {@link com.cognite.v1.timeseries.proto.DataPointInsertionRequest.verify|verify} messages.
                         * @param message DataPointInsertionRequest message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        static encode(message: com.cognite.v1.timeseries.proto.DataPointInsertionRequest.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes a DataPointInsertionRequest message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns {com.cognite.v1.timeseries.proto.DataPointInsertionRequest & com.cognite.v1.timeseries.proto.DataPointInsertionRequest.$Shape} DataPointInsertionRequest
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): com.cognite.v1.timeseries.proto.DataPointInsertionRequest & com.cognite.v1.timeseries.proto.DataPointInsertionRequest.$Shape;

                        /**
                         * Gets the type url for DataPointInsertionRequest
                         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                         * @returns The type url
                         */
                        static getTypeUrl(prefix?: string): string;
                    }

                    namespace DataPointInsertionRequest {

                        /** Properties of a DataPointInsertionRequest. */
                        interface $Properties {

                            /** DataPointInsertionRequest items */
                            items?: (com.cognite.v1.timeseries.proto.DataPointInsertionItem.$Properties[]|null);

                            /** Unknown fields preserved while decoding */
                            $unknowns?: Uint8Array[];
                        }

                        /** Shape of a DataPointInsertionRequest. */
                        type $Shape = {
  items?: com.cognite.v1.timeseries.proto.DataPointInsertionItem.$Shape[]|null;
  $unknowns?: Uint8Array[];
};
                    }

                    /** TimeSeriesType enum. */
                    enum TimeSeriesType {

                        /** TIMESERIES_TYPE_UNSPECIFIED value */
                        TIMESERIES_TYPE_UNSPECIFIED = 0,

                        /** TIMESERIES_TYPE_NUMERIC value */
                        TIMESERIES_TYPE_NUMERIC = 1,

                        /** TIMESERIES_TYPE_STRING value */
                        TIMESERIES_TYPE_STRING = 2,

                        /** TIMESERIES_TYPE_STATE value */
                        TIMESERIES_TYPE_STATE = 3
                    }

                    /**
                     * Properties of a DataPointListItem.
                     * @deprecated Use com.cognite.v1.timeseries.proto.DataPointListItem.$Properties instead.
                     */
                    interface IDataPointListItem extends com.cognite.v1.timeseries.proto.DataPointListItem.$Properties {
                    }

                    /** Represents a DataPointListItem. */
                    class DataPointListItem {

                        /**
                         * Constructs a new DataPointListItem.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: com.cognite.v1.timeseries.proto.DataPointListItem.$Properties);

                        /** Unknown fields preserved while decoding */
                        $unknowns?: Uint8Array[];

                        /** DataPointListItem id. */
                        id: Long;

                        /** DataPointListItem externalId. */
                        externalId: string;

                        /** DataPointListItem instanceId. */
                        instanceId?: (com.cognite.v1.timeseries.proto.InstanceId.$Properties|null);

                        /** DataPointListItem isString. */
                        isString: boolean;

                        /** DataPointListItem isStep. */
                        isStep: boolean;

                        /** DataPointListItem unit. */
                        unit: string;

                        /** DataPointListItem nextCursor. */
                        nextCursor: string;

                        /** DataPointListItem unitExternalId. */
                        unitExternalId: string;

                        /** DataPointListItem type. */
                        type: com.cognite.v1.timeseries.proto.TimeSeriesType;

                        /** DataPointListItem numericDatapoints. */
                        numericDatapoints?: (com.cognite.v1.timeseries.proto.NumericDatapoints.$Properties|null);

                        /** DataPointListItem stringDatapoints. */
                        stringDatapoints?: (com.cognite.v1.timeseries.proto.StringDatapoints.$Properties|null);

                        /** DataPointListItem aggregateDatapoints. */
                        aggregateDatapoints?: (com.cognite.v1.timeseries.proto.AggregateDatapoints.$Properties|null);

                        /** DataPointListItem stateDatapoints. */
                        stateDatapoints?: (com.cognite.v1.timeseries.proto.StateDatapoints.$Properties|null);

                        /** DataPointListItem datapointType. */
                        datapointType?: ("numericDatapoints"|"stringDatapoints"|"aggregateDatapoints"|"stateDatapoints");

                        /**
                         * Encodes the specified DataPointListItem message. Does not implicitly {@link com.cognite.v1.timeseries.proto.DataPointListItem.verify|verify} messages.
                         * @param message DataPointListItem message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        static encode(message: com.cognite.v1.timeseries.proto.DataPointListItem.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes a DataPointListItem message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns {com.cognite.v1.timeseries.proto.DataPointListItem & com.cognite.v1.timeseries.proto.DataPointListItem.$Shape} DataPointListItem
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): com.cognite.v1.timeseries.proto.DataPointListItem & com.cognite.v1.timeseries.proto.DataPointListItem.$Shape;

                        /**
                         * Gets the type url for DataPointListItem
                         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                         * @returns The type url
                         */
                        static getTypeUrl(prefix?: string): string;
                    }

                    namespace DataPointListItem {

                        /** Properties of a DataPointListItem. */
                        interface $Properties {

                            /** DataPointListItem id */
                            id?: (Long|null);

                            /** DataPointListItem externalId */
                            externalId?: (string|null);

                            /** DataPointListItem instanceId */
                            instanceId?: (com.cognite.v1.timeseries.proto.InstanceId.$Properties|null);

                            /** DataPointListItem isString */
                            isString?: (boolean|null);

                            /** DataPointListItem isStep */
                            isStep?: (boolean|null);

                            /** DataPointListItem unit */
                            unit?: (string|null);

                            /** DataPointListItem nextCursor */
                            nextCursor?: (string|null);

                            /** DataPointListItem unitExternalId */
                            unitExternalId?: (string|null);

                            /** DataPointListItem type */
                            type?: (com.cognite.v1.timeseries.proto.TimeSeriesType|null);

                            /** DataPointListItem numericDatapoints */
                            numericDatapoints?: (com.cognite.v1.timeseries.proto.NumericDatapoints.$Properties|null);

                            /** DataPointListItem stringDatapoints */
                            stringDatapoints?: (com.cognite.v1.timeseries.proto.StringDatapoints.$Properties|null);

                            /** DataPointListItem aggregateDatapoints */
                            aggregateDatapoints?: (com.cognite.v1.timeseries.proto.AggregateDatapoints.$Properties|null);

                            /** DataPointListItem stateDatapoints */
                            stateDatapoints?: (com.cognite.v1.timeseries.proto.StateDatapoints.$Properties|null);

                            /** DataPointListItem datapointType */
                            datapointType?: ("numericDatapoints"|"stringDatapoints"|"aggregateDatapoints"|"stateDatapoints");

                            /** Unknown fields preserved while decoding */
                            $unknowns?: Uint8Array[];
                        }

                        /** Narrowed shape of a DataPointListItem. */
                        type $Shape = {
  id?: Long|null;
  externalId?: string|null;
  instanceId?: com.cognite.v1.timeseries.proto.InstanceId.$Shape|null;
  isString?: boolean|null;
  isStep?: boolean|null;
  unit?: string|null;
  nextCursor?: string|null;
  unitExternalId?: string|null;
  type?: com.cognite.v1.timeseries.proto.TimeSeriesType|null;
  numericDatapoints?: com.cognite.v1.timeseries.proto.NumericDatapoints.$Shape|null;
  stringDatapoints?: com.cognite.v1.timeseries.proto.StringDatapoints.$Shape|null;
  aggregateDatapoints?: com.cognite.v1.timeseries.proto.AggregateDatapoints.$Shape|null;
  stateDatapoints?: com.cognite.v1.timeseries.proto.StateDatapoints.$Shape|null;
  $unknowns?: Uint8Array[];
} & (
  ({ datapointType?: undefined; numericDatapoints?: null; stringDatapoints?: null; aggregateDatapoints?: null; stateDatapoints?: null }|{ datapointType?: "numericDatapoints"; numericDatapoints: com.cognite.v1.timeseries.proto.NumericDatapoints.$Shape; stringDatapoints?: null; aggregateDatapoints?: null; stateDatapoints?: null }|{ datapointType?: "stringDatapoints"; numericDatapoints?: null; stringDatapoints: com.cognite.v1.timeseries.proto.StringDatapoints.$Shape; aggregateDatapoints?: null; stateDatapoints?: null }|{ datapointType?: "aggregateDatapoints"; numericDatapoints?: null; stringDatapoints?: null; aggregateDatapoints: com.cognite.v1.timeseries.proto.AggregateDatapoints.$Shape; stateDatapoints?: null }|{ datapointType?: "stateDatapoints"; numericDatapoints?: null; stringDatapoints?: null; aggregateDatapoints?: null; stateDatapoints: com.cognite.v1.timeseries.proto.StateDatapoints.$Shape })
);
                    }

                    /**
                     * Properties of a DataPointListResponse.
                     * @deprecated Use com.cognite.v1.timeseries.proto.DataPointListResponse.$Properties instead.
                     */
                    interface IDataPointListResponse extends com.cognite.v1.timeseries.proto.DataPointListResponse.$Properties {
                    }

                    /** Represents a DataPointListResponse. */
                    class DataPointListResponse {

                        /**
                         * Constructs a new DataPointListResponse.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: com.cognite.v1.timeseries.proto.DataPointListResponse.$Properties);

                        /** Unknown fields preserved while decoding */
                        $unknowns?: Uint8Array[];

                        /** DataPointListResponse items. */
                        items: com.cognite.v1.timeseries.proto.DataPointListItem.$Properties[];

                        /**
                         * Encodes the specified DataPointListResponse message. Does not implicitly {@link com.cognite.v1.timeseries.proto.DataPointListResponse.verify|verify} messages.
                         * @param message DataPointListResponse message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        static encode(message: com.cognite.v1.timeseries.proto.DataPointListResponse.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes a DataPointListResponse message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns {com.cognite.v1.timeseries.proto.DataPointListResponse & com.cognite.v1.timeseries.proto.DataPointListResponse.$Shape} DataPointListResponse
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): com.cognite.v1.timeseries.proto.DataPointListResponse & com.cognite.v1.timeseries.proto.DataPointListResponse.$Shape;

                        /**
                         * Gets the type url for DataPointListResponse
                         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
                         * @returns The type url
                         */
                        static getTypeUrl(prefix?: string): string;
                    }

                    namespace DataPointListResponse {

                        /** Properties of a DataPointListResponse. */
                        interface $Properties {

                            /** DataPointListResponse items */
                            items?: (com.cognite.v1.timeseries.proto.DataPointListItem.$Properties[]|null);

                            /** Unknown fields preserved while decoding */
                            $unknowns?: Uint8Array[];
                        }

                        /** Shape of a DataPointListResponse. */
                        type $Shape = {
  items?: com.cognite.v1.timeseries.proto.DataPointListItem.$Shape[]|null;
  $unknowns?: Uint8Array[];
};
                    }
                }
            }
        }
    }
}
